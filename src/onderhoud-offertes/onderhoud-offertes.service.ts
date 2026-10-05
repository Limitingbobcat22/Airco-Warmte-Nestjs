import {
  BadRequestException,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'node:crypto';
import { DataSource, EntityManager, In, Repository } from 'typeorm';
import { Klant } from '../klanten/klant.entity';
import { OnderhoudType } from '../onderhoud-types/onderhoud-type.entity';
import type { AdminCreateOnderhoudOfferteDto } from './dto/admin-create-onderhoud-offerte.dto';
import type { CreateOnderhoudOfferteDto } from './dto/create-onderhoud-offerte.dto';
import type { UpdateOnderhoudOfferteDto } from './dto/update-onderhoud-offerte.dto';
import type { UpdateOnderhoudOfferteReadDto } from './dto/update-onderhoud-offerte-read.dto';
import { OnderhoudOfferteImage } from './onderhoud-offerte-image.entity';
import { OnderhoudOfferteTypeLink } from './onderhoud-offerte-type-link.entity';
import { OnderhoudOfferte } from './onderhoud-offerte.entity';
import { CREATE_ONDERHOUD_OFFERTE_OVERVIEW_VIEW_SQL } from './onderhoud-offerte-overview.sql';
import {
  isAllowedPhoto,
  photoMimeType,
  type UploadedFilePayload,
} from './uploaded-file';

const MAX_PHOTOS = 3;

export type OnderhoudOffertePhotoResponse = {
  id: string;
  sortOrder: number;
  mimeType: string;
  originalFilename: string;
  url: string;
};

export type OnderhoudOfferteTypeResponse = {
  id: string;
  name: string;
  sortOrder: number;
};

export type OnderhoudOfferteResponse = {
  id: string;
  klantId: string | null;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  street: string;
  houseNumber: string;
  postalCode: string;
  city: string;
  note: string | null;
  consentContact: boolean;
  consentTerms: boolean;
  types: OnderhoudOfferteTypeResponse[];
  images: OnderhoudOffertePhotoResponse[];
  createdAt: Date;
  updatedAt: Date;
};

/** Rij uit de view onderhoud_offerte_overview, klaar voor de beheertabel. */
export type OnderhoudOfferteOverview = {
  id: string;
  klantId: string | null;
  name: string | null;
  email: string | null;
  phone: string | null;
  city: string | null;
  typeNames: string | null;
  imageCount: number;
  read: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
};

type OverviewRow = {
  id: string;
  klantId: string | null;
  name: string | null;
  email: string | null;
  phone: string | null;
  city: string | null;
  typeNames: string | null;
  imageCount: number | string;
  isRead: boolean | number | string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
};

function asBoolean(value: boolean | number | string | null | undefined): boolean {
  if (typeof value === 'boolean') return value;
  return Number(value) === 1;
}

function mapOverview(row: OverviewRow): OnderhoudOfferteOverview {
  return {
    id: row.id,
    klantId: row.klantId,
    name: row.name,
    email: row.email,
    phone: row.phone,
    city: row.city,
    typeNames: row.typeNames,
    imageCount: Number(row.imageCount),
    read: asBoolean(row.isRead),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

const OVERVIEW_SELECT = `
  SELECT
    id,
    klant_id AS klantId,
    name,
    email,
    phone,
    city,
    type_names AS typeNames,
    image_count AS imageCount,
    is_read AS isRead,
    created_at AS createdAt,
    updated_at AS updatedAt
  FROM onderhoud_offerte_overview
`;

function uniqueIds(ids: string[]): string[] {
  return [...new Set(ids)];
}

function maxImagesForTypes(typeCount: number): number {
  return Math.min(Math.max(typeCount, 0), MAX_PHOTOS);
}

@Injectable()
export class OnderhoudOffertesService implements OnModuleInit {
  constructor(
    @InjectRepository(OnderhoudOfferte)
    private readonly offertes: Repository<OnderhoudOfferte>,
    @InjectRepository(OnderhoudOfferteImage)
    private readonly images: Repository<OnderhoudOfferteImage>,
    @InjectRepository(OnderhoudType)
    private readonly types: Repository<OnderhoudType>,
    @InjectRepository(Klant)
    private readonly klanten: Repository<Klant>,
    private readonly dataSource: DataSource,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.ensureReadColumn();
    await this.dataSource.query(CREATE_ONDERHOUD_OFFERTE_OVERVIEW_VIEW_SQL);
  }

  async findAll(): Promise<OnderhoudOfferteOverview[]> {
    const rows: OverviewRow[] = await this.dataSource.query(
      `${OVERVIEW_SELECT} ORDER BY created_at DESC`,
    );
    return rows.map(mapOverview);
  }

  async findOne(id: string): Promise<OnderhoudOfferteResponse> {
    return this.toResponse(await this.loadOfferte(id));
  }

  async create(
    dto: CreateOnderhoudOfferteDto | AdminCreateOnderhoudOfferteDto,
    files: UploadedFilePayload[],
    options?: { read?: boolean },
  ): Promise<OnderhoudOfferteResponse> {
    const typeIds = uniqueIds(dto.typeIds);
    if (typeIds.length === 0) {
      throw new BadRequestException('Kies minimaal één onderhoudtype.');
    }
    this.assertImages(files, typeIds.length);
    const types = await this.loadTypes(typeIds);
    const linked = await this.linkedKlant(dto.klantId);
    if (!linked) {
      throw new BadRequestException('Kies een bestaande klant.');
    }

    const saved = await this.dataSource.transaction(async (manager) => {
      const offerte = manager.create(OnderhoudOfferte, {
        id: randomUUID(),
        klantId: linked.id,
        read: options?.read ?? false,
      });
      await manager.save(offerte);
      await manager.save(
        types.map((type) =>
          manager.create(OnderhoudOfferteTypeLink, {
            offerteId: offerte.id,
            typeId: type.id,
          }),
        ),
      );
      const images = this.imageEntities(manager, offerte.id, files, 0);
      if (images.length > 0) await manager.save(images);
      return offerte.id;
    });

    return this.findOne(saved);
  }

  async update(
    id: string,
    dto: UpdateOnderhoudOfferteDto,
    files: UploadedFilePayload[],
  ): Promise<OnderhoudOfferteResponse> {
    const existing = await this.loadOfferte(id);
    const typeIds = uniqueIds(dto.typeIds);
    if (typeIds.length === 0) {
      throw new BadRequestException('Kies minimaal één onderhoudtype.');
    }
    const types = await this.loadTypes(typeIds);
    const keepIds = new Set(uniqueIds(dto.keepImageIds));
    const linked = await this.linkedKlant(dto.klantId);
    if (!linked) {
      throw new BadRequestException('Kies een bestaande klant.');
    }
    const kept = existing.images.filter((image) => keepIds.has(image.id));
    if (kept.length !== keepIds.size) {
      throw new BadRequestException('Een van de afbeeldingen hoort niet bij deze offerte.');
    }
    const total = kept.length + files.length;
    const max = maxImagesForTypes(typeIds.length);
    if (total > max) {
      throw new BadRequestException(
        `U kunt maximaal ${max} ${max === 1 ? 'afbeelding' : 'afbeeldingen'} toevoegen bij ${typeIds.length} ${typeIds.length === 1 ? 'onderhoudtype' : 'onderhoudtypes'}.`,
      );
    }
    this.assertImageFiles(files);
    const nextSort =
      kept.reduce((maxSort, image) => Math.max(maxSort, image.sortOrder), -1) + 1;

    await this.dataSource.transaction(async (manager) => {
      const removeIds = existing.images
        .filter((image) => !keepIds.has(image.id))
        .map((image) => image.id);
      if (removeIds.length > 0) {
        await manager.delete(OnderhoudOfferteImage, { id: In(removeIds) });
      }
      await manager.delete(OnderhoudOfferteTypeLink, { offerteId: id });
      await manager.save(
        types.map((type) =>
          manager.create(OnderhoudOfferteTypeLink, {
            offerteId: id,
            typeId: type.id,
          }),
        ),
      );
      if (files.length > 0) {
        await manager.save(this.imageEntities(manager, id, files, nextSort));
      }
      await manager.update(OnderhoudOfferte, id, {
        klantId: linked.id,
      });
    });

    return this.findOne(id);
  }

  async updateRead(
    id: string,
    dto: UpdateOnderhoudOfferteReadDto,
  ): Promise<OnderhoudOfferteOverview> {
    const offerte = await this.loadOfferte(id);
    offerte.read = dto.read;
    await this.offertes.save(offerte);
    const rows: OverviewRow[] = await this.dataSource.query(
      `${OVERVIEW_SELECT} WHERE id = ?`,
      [id],
    );
    const row = rows[0];
    if (!row) throw new NotFoundException('Onderhoudofferte niet gevonden.');
    return mapOverview(row);
  }

  async remove(id: string): Promise<void> {
    await this.loadOfferte(id);
    await this.dataSource.transaction(async (manager) => {
      await manager.delete(OnderhoudOfferteImage, { offerteId: id });
      await manager.delete(OnderhoudOfferteTypeLink, { offerteId: id });
      await manager.delete(OnderhoudOfferte, { id });
    });
  }

  async getImageBuffer(
    offerteId: string,
    imageId: string,
  ): Promise<OnderhoudOfferteImage> {
    const image = await this.images
      .createQueryBuilder('image')
      .addSelect('image.data')
      .where('image.id = :imageId', { imageId })
      .andWhere('image.offerte_id = :offerteId', { offerteId })
      .getOne();
    if (!image) throw new NotFoundException('Afbeelding niet gevonden.');
    return image;
  }

  private async linkedKlant(klantId?: string | null): Promise<Klant | null> {
    if (!klantId) return null;
    const klant = await this.klanten.findOne({ where: { id: klantId } });
    if (!klant) {
      throw new BadRequestException('Kies een bestaande klant.');
    }
    return klant;
  }

  private assertImages(files: UploadedFilePayload[], typeCount: number): void {
    const max = maxImagesForTypes(typeCount);
    if (files.length > max) {
      throw new BadRequestException(
        `U kunt maximaal ${max} ${max === 1 ? 'afbeelding' : 'afbeeldingen'} toevoegen bij ${typeCount} ${typeCount === 1 ? 'onderhoudtype' : 'onderhoudtypes'}.`,
      );
    }
    this.assertImageFiles(files);
  }

  private assertImageFiles(files: UploadedFilePayload[]): void {
    for (const file of files) {
      if (!isAllowedPhoto(file)) {
        throw new BadRequestException('Kies een afbeelding in jpg, png, webp of heic.');
      }
    }
  }

  private imageEntities(
    manager: EntityManager,
    offerteId: string,
    files: UploadedFilePayload[],
    startOrder: number,
  ): OnderhoudOfferteImage[] {
    return files.map((file, index) =>
      manager.create(OnderhoudOfferteImage, {
        id: randomUUID(),
        offerteId,
        sortOrder: startOrder + index,
        mimeType: photoMimeType(file),
        originalFilename: file.originalname.slice(0, 255),
        data: file.buffer,
      }),
    );
  }

  private async loadTypes(ids: string[]): Promise<OnderhoudType[]> {
    const types = await this.types.find({ where: { id: In(ids) } });
    if (types.length !== ids.length) {
      throw new BadRequestException('Een gekozen onderhoudtype bestaat niet.');
    }
    return types;
  }

  private async ensureReadColumn(): Promise<void> {
    const rows: Array<{ count: number | string }> = await this.dataSource.query(`
      SELECT COUNT(*) AS count
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'onderhoud_offertes'
        AND COLUMN_NAME = 'is_read'
    `);
    if (Number(rows[0]?.count) > 0) return;
    await this.dataSource.query(`
      ALTER TABLE onderhoud_offertes
        ADD COLUMN is_read TINYINT(1) NOT NULL DEFAULT 0 AFTER klant_id
    `);
  }

  private async loadOfferte(id: string): Promise<OnderhoudOfferte> {
    const offerte = await this.offertes.findOne({
      where: { id },
      relations: { images: true, typeLinks: { type: true }, klant: true },
    });
    if (!offerte) throw new NotFoundException('Onderhoudofferte niet gevonden.');
    return offerte;
  }

  private toResponse(row: OnderhoudOfferte): OnderhoudOfferteResponse {
    const types = (row.typeLinks ?? [])
      .map((link) => link.type)
      .filter((type): type is OnderhoudType => Boolean(type))
      .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, 'nl'))
      .map((type) => ({
        id: type.id,
        name: type.name,
        sortOrder: type.sortOrder,
      }));

    const images = (row.images ?? [])
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((image) => ({
        id: image.id,
        sortOrder: image.sortOrder,
        mimeType: image.mimeType,
        originalFilename: image.originalFilename,
        url: `/onderhoud-offertes/${row.id}/images/${image.id}`,
      }));

    const klant = row.klant;

    return {
      id: row.id,
      klantId: row.klantId,
      types,
      firstName: klant?.firstName ?? '',
      lastName: klant?.lastName ?? '',
      email: klant?.email ?? '',
      phone: klant?.phone ?? '',
      street: klant?.street ?? '',
      houseNumber: klant?.houseNumber ?? '',
      postalCode: klant?.postalCode ?? '',
      city: klant?.city ?? '',
      note: klant?.note ?? null,
      consentContact: Boolean(klant?.consentContact),
      consentTerms: Boolean(klant?.consentTerms),
      images,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}
