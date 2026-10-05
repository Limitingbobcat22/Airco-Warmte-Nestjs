import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'node:crypto';
import { DataSource, EntityManager, In, Repository } from 'typeorm';
import { Klant } from '../klanten/klant.entity';
import { OnderhoudType } from '../onderhoud-types/onderhoud-type.entity';
import type { AdminCreateOnderhoudOfferteDto } from './dto/admin-create-onderhoud-offerte.dto';
import type { CreateOnderhoudOfferteDto } from './dto/create-onderhoud-offerte.dto';
import type { UpdateOnderhoudOfferteDto } from './dto/update-onderhoud-offerte.dto';
import { OnderhoudOfferteFoto } from './onderhoud-offerte-foto.entity';
import { OnderhoudOfferteTypeLink } from './onderhoud-offerte-type-link.entity';
import { OnderhoudOfferte } from './onderhoud-offerte.entity';
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
  photos: OnderhoudOffertePhotoResponse[];
  createdAt: Date;
  updatedAt: Date;
};

function normalizePostalCode(value: string): string {
  const compact = value.replace(/\s+/g, '').toUpperCase();
  if (/^[1-9][0-9]{3}[A-Z]{2}$/.test(compact)) {
    return `${compact.slice(0, 4)} ${compact.slice(4)}`;
  }
  return value.trim().toUpperCase();
}

function maxPhotosForTypes(typeCount: number): number {
  return Math.min(typeCount, MAX_PHOTOS);
}

function uniqueIds(ids: string[]): string[] {
  return [...new Set(ids)];
}

@Injectable()
export class OnderhoudOffertesService {
  constructor(
    @InjectRepository(OnderhoudOfferte)
    private readonly offertes: Repository<OnderhoudOfferte>,
    @InjectRepository(OnderhoudOfferteFoto)
    private readonly fotos: Repository<OnderhoudOfferteFoto>,
    @InjectRepository(OnderhoudType)
    private readonly types: Repository<OnderhoudType>,
    @InjectRepository(Klant)
    private readonly klanten: Repository<Klant>,
    private readonly dataSource: DataSource,
  ) {}

  async findAll(): Promise<OnderhoudOfferteResponse[]> {
    const rows = await this.offertes.find({
      relations: { fotos: true, typeLinks: { type: true }, klant: true },
      order: { createdAt: 'DESC' },
    });
    return rows.map((row) => this.toResponse(row));
  }

  async findOne(id: string): Promise<OnderhoudOfferteResponse> {
    return this.toResponse(await this.loadOfferte(id));
  }

  async create(
    dto: CreateOnderhoudOfferteDto | AdminCreateOnderhoudOfferteDto,
    files: UploadedFilePayload[],
  ): Promise<OnderhoudOfferteResponse> {
    const typeIds = uniqueIds(dto.typeIds);
    if (typeIds.length === 0) {
      throw new BadRequestException('Kies minimaal één onderhoudtype.');
    }
    this.assertPhotos(files, typeIds.length);
    const types = await this.loadTypes(typeIds);
    const linked = await this.linkedKlant(
      'klantId' in dto ? dto.klantId : undefined,
    );

    const saved = await this.dataSource.transaction(async (manager) => {
      const offerte = manager.create(OnderhoudOfferte, {
        id: randomUUID(),
        ...this.customerFrom(linked ?? dto),
        klantId: linked?.id ?? null,
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
      const fotos = this.fotoEntities(manager, offerte.id, files, 0);
      if (fotos.length > 0) await manager.save(fotos);
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
    const keepIds = new Set(dto.keepPhotoIds);
    const linked = await this.linkedKlant(dto.klantId);
    const kept = existing.fotos.filter((foto) => keepIds.has(foto.id));
    if (kept.length !== keepIds.size) {
      throw new BadRequestException('Een van de foto\'s hoort niet bij deze offerte.');
    }
    const total = kept.length + files.length;
    const max = maxPhotosForTypes(typeIds.length);
    if (total > max) {
      throw new BadRequestException(
        `U kunt maximaal ${max} ${max === 1 ? 'foto' : "foto's"} toevoegen bij ${typeIds.length} ${typeIds.length === 1 ? 'onderhoudtype' : 'onderhoudtypes'}.`,
      );
    }
    this.assertPhotoFiles(files);
    const nextSort =
      kept.reduce((maxSort, foto) => Math.max(maxSort, foto.sortOrder), -1) + 1;

    await this.dataSource.transaction(async (manager) => {
      const removeIds = existing.fotos
        .filter((foto) => !keepIds.has(foto.id))
        .map((foto) => foto.id);
      if (removeIds.length > 0) {
        await manager.delete(OnderhoudOfferteFoto, { id: In(removeIds) });
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
        await manager.save(this.fotoEntities(manager, id, files, nextSort));
      }
      await manager.update(OnderhoudOfferte, id, {
        ...this.customerFrom(linked ?? dto),
        klantId: linked ? linked.id : existing.klantId,
      });
    });

    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.loadOfferte(id);
    await this.dataSource.transaction(async (manager) => {
      await manager.delete(OnderhoudOfferteFoto, { offerteId: id });
      await manager.delete(OnderhoudOfferteTypeLink, { offerteId: id });
      await manager.delete(OnderhoudOfferte, { id });
    });
  }

  async getFotoBuffer(
    offerteId: string,
    fotoId: string,
  ): Promise<OnderhoudOfferteFoto> {
    const foto = await this.fotos
      .createQueryBuilder('foto')
      .addSelect('foto.data')
      .where('foto.id = :fotoId', { fotoId })
      .andWhere('foto.offerte_id = :offerteId', { offerteId })
      .getOne();
    if (!foto) throw new NotFoundException('Foto niet gevonden.');
    return foto;
  }

  private async linkedKlant(klantId?: string | null): Promise<Klant | null> {
    if (!klantId) return null;
    const klant = await this.klanten.findOne({ where: { id: klantId } });
    if (!klant) {
      throw new BadRequestException('Kies een bestaande klant.');
    }
    return klant;
  }

  private customerFrom(
    dto:
      | CreateOnderhoudOfferteDto
      | AdminCreateOnderhoudOfferteDto
      | UpdateOnderhoudOfferteDto
      | Klant,
  ) {
    return {
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      phone: dto.phone,
      street: dto.street,
      houseNumber: dto.houseNumber,
      postalCode: normalizePostalCode(dto.postalCode),
      city: dto.city,
      note: dto.note?.trim() ? dto.note.trim() : null,
      consentContact: dto.consentContact,
      consentTerms: dto.consentTerms,
    };
  }

  private assertPhotos(files: UploadedFilePayload[], typeCount: number): void {
    const max = maxPhotosForTypes(typeCount);
    if (files.length > max) {
      throw new BadRequestException(
        `U kunt maximaal ${max} ${max === 1 ? 'foto' : "foto's"} toevoegen bij ${typeCount} ${typeCount === 1 ? 'onderhoudtype' : 'onderhoudtypes'}.`,
      );
    }
    this.assertPhotoFiles(files);
  }

  private assertPhotoFiles(files: UploadedFilePayload[]): void {
    for (const file of files) {
      if (!isAllowedPhoto(file)) {
        throw new BadRequestException('Kies een foto in jpg, png, webp of heic.');
      }
    }
  }

  private fotoEntities(
    manager: EntityManager,
    offerteId: string,
    files: UploadedFilePayload[],
    startOrder: number,
  ): OnderhoudOfferteFoto[] {
    return files.map((file, index) =>
      manager.create(OnderhoudOfferteFoto, {
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

  private async loadOfferte(id: string): Promise<OnderhoudOfferte> {
    const offerte = await this.offertes.findOne({
      where: { id },
      relations: { fotos: true, typeLinks: { type: true }, klant: true },
    });
    if (!offerte) throw new NotFoundException('Onderhoudofferte niet gevonden.');
    return offerte;
  }

  private toResponse(row: OnderhoudOfferte): OnderhoudOfferteResponse {
    const types = (row.typeLinks ?? [])
      .map((link) => link.type)
      .filter((type): type is OnderhoudType => Boolean(type))
      .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name))
      .map((type) => ({
        id: type.id,
        name: type.name,
        sortOrder: type.sortOrder,
      }));

    const photos = (row.fotos ?? [])
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((foto) => ({
        id: foto.id,
        sortOrder: foto.sortOrder,
        mimeType: foto.mimeType,
        originalFilename: foto.originalFilename,
        url: `/onderhoud-offertes/${row.id}/fotos/${foto.id}`,
      }));

    const source = row.klant ?? row;

    return {
      id: row.id,
      klantId: row.klantId,
      firstName: source.firstName,
      lastName: source.lastName,
      email: source.email,
      phone: source.phone,
      street: source.street,
      houseNumber: source.houseNumber,
      postalCode: source.postalCode,
      city: source.city,
      note: source.note,
      consentContact: Boolean(source.consentContact),
      consentTerms: Boolean(source.consentTerms),
      types,
      photos,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}
