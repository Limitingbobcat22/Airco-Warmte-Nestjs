import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'node:crypto';
import { Repository } from 'typeorm';
import { AircoImage } from './airco-image.entity';
import { Airco } from './airco.entity';
import type { CreateAircoDto } from './dto/create-airco.dto';
import type { UpdateAircoDto } from './dto/update-airco.dto';
import type { UploadedFilePayload } from './uploaded-file';

export const MAX_AIRCO_IMAGES = 3;

const DEFAULT_IMAGE_LABELS = [
  'Vooraanzicht',
  'Schuin aanzicht',
  'Detail',
] as const;

const DEFAULT_TRUST_POINTS = [
  'Inclusief standaard montage',
  'F-gassen-gecertificeerde monteur',
];

export type AircoImageMeta = {
  id: string;
  sortOrder: number;
  label: string;
  mimeType: string;
  url: string;
};

export type AircoResponse = Omit<Airco, 'images'> & {
  images: AircoImageMeta[];
};

@Injectable()
export class AircosService {
  constructor(
    @InjectRepository(Airco)
    private readonly aircos: Repository<Airco>,
    @InjectRepository(AircoImage)
    private readonly images: Repository<AircoImage>,
  ) {}

  async findAll(): Promise<AircoResponse[]> {
    const rows = await this.aircos.find({
      relations: { images: true },
      order: { brand: 'ASC', series: 'ASC' },
    });
    return rows.map((row) => this.toResponse(row));
  }

  async findOne(id: string): Promise<AircoResponse> {
    const airco = await this.loadAirco(id);
    return this.toResponse(airco);
  }

  async create(dto: CreateAircoDto): Promise<AircoResponse> {
    const slug = await this.ensureUniqueSlug(
      dto.slug?.trim() || this.slugify(dto.brand, dto.series),
    );

    const airco = this.aircos.create({
      id: randomUUID(),
      slug,
      brand: dto.brand.trim(),
      series: dto.series.trim(),
      model: dto.model.trim(),
      unitType: (dto.unitType ?? `${dto.model.trim()} (split)`).trim(),
      tag: dto.tag?.trim() ?? '',
      description: dto.description.trim(),
      productFunction: dto.productFunction?.trim() ?? 'Koelen en verwarmen',
      trustPoints: dto.trustPoints ?? DEFAULT_TRUST_POINTS,
      coolingKw: dto.coolingKw,
      heatingKw: dto.heatingKw,
      seer: dto.seer,
      scop: dto.scop,
      energyClassCooling: dto.energyClassCooling,
      energyClassHeating: dto.energyClassHeating,
      noiseSilentDba: dto.noiseSilentDba,
      refrigerant: dto.refrigerant ?? 'R32',
      roomM2: dto.roomM2.trim(),
      heatingCoverage: dto.heatingCoverage ?? 0.55,
      priceEur: dto.priceEur,
      accent: dto.accent ?? '#005A9C',
    });

    const saved = await this.aircos.save(airco);
    return this.findOne(saved.id);
  }

  async update(id: string, dto: UpdateAircoDto): Promise<AircoResponse> {
    const airco = await this.loadAirco(id);

    if (dto.slug && dto.slug.trim() !== airco.slug) {
      airco.slug = await this.ensureUniqueSlug(dto.slug.trim(), airco.id);
    }

    if (dto.brand != null) airco.brand = dto.brand.trim();
    if (dto.series != null) airco.series = dto.series.trim();
    if (dto.model != null) airco.model = dto.model.trim();
    if (dto.unitType != null) airco.unitType = dto.unitType.trim();
    if (dto.tag != null) airco.tag = dto.tag.trim();
    if (dto.description != null) airco.description = dto.description.trim();
    if (dto.productFunction != null) {
      airco.productFunction = dto.productFunction.trim();
    }
    if (dto.trustPoints != null) airco.trustPoints = dto.trustPoints;
    if (dto.coolingKw != null) airco.coolingKw = dto.coolingKw;
    if (dto.heatingKw != null) airco.heatingKw = dto.heatingKw;
    if (dto.seer != null) airco.seer = dto.seer;
    if (dto.scop != null) airco.scop = dto.scop;
    if (dto.energyClassCooling != null) {
      airco.energyClassCooling = dto.energyClassCooling;
    }
    if (dto.energyClassHeating != null) {
      airco.energyClassHeating = dto.energyClassHeating;
    }
    if (dto.noiseSilentDba != null) airco.noiseSilentDba = dto.noiseSilentDba;
    if (dto.refrigerant != null) airco.refrigerant = dto.refrigerant;
    if (dto.roomM2 != null) airco.roomM2 = dto.roomM2.trim();
    if (dto.heatingCoverage != null) {
      airco.heatingCoverage = dto.heatingCoverage;
    }
    if (dto.priceEur != null) airco.priceEur = dto.priceEur;
    if (dto.accent != null) airco.accent = dto.accent;

    await this.aircos.save(airco);
    return this.findOne(airco.id);
  }

  async remove(id: string): Promise<void> {
    const airco = await this.loadAirco(id);
    await this.aircos.remove(airco);
  }

  async uploadImage(
    id: string,
    file: UploadedFilePayload,
    options: { sortOrder?: number; label?: string } = {},
  ): Promise<AircoResponse> {
    const airco = await this.loadAirco(id);
    const existing = await this.images.find({
      where: { aircoId: airco.id },
      order: { sortOrder: 'ASC' },
    });

    let sortOrder = options.sortOrder;
    if (sortOrder == null) {
      const taken = new Set(existing.map((image) => image.sortOrder));
      sortOrder = [0, 1, 2].find((slot) => !taken.has(slot));
      if (sortOrder == null) {
        throw new BadRequestException(
          `Maximaal ${MAX_AIRCO_IMAGES} foto's per airco.`,
        );
      }
    }

    if (sortOrder < 0 || sortOrder > 2) {
      throw new BadRequestException('sortOrder moet 0, 1 of 2 zijn.');
    }

    const occupying = existing.find((image) => image.sortOrder === sortOrder);
    if (occupying) {
      await this.images.remove(occupying);
    }

    const image = this.images.create({
      id: randomUUID(),
      aircoId: airco.id,
      sortOrder,
      label: options.label?.trim() || DEFAULT_IMAGE_LABELS[sortOrder],
      mimeType: file.mimetype,
      originalFilename: file.originalname,
      data: file.buffer,
    });
    await this.images.save(image);

    return this.findOne(airco.id);
  }

  async removeImage(id: string, imageId: string): Promise<AircoResponse> {
    const airco = await this.loadAirco(id);
    const image = await this.images.findOne({
      where: { id: imageId, aircoId: airco.id },
    });
    if (!image) {
      throw new NotFoundException('Foto niet gevonden.');
    }
    await this.images.remove(image);
    return this.findOne(airco.id);
  }

  async getImageBuffer(
    id: string,
    imageId: string,
  ): Promise<Pick<AircoImage, 'mimeType' | 'data' | 'originalFilename'>> {
    const airco = await this.loadAirco(id);
    const image = await this.images.findOne({
      where: { id: imageId, aircoId: airco.id },
      select: {
        id: true,
        mimeType: true,
        originalFilename: true,
        data: true,
      },
    });
    if (!image) {
      throw new NotFoundException('Foto niet gevonden.');
    }
    return image;
  }

  private async loadAirco(id: string): Promise<Airco> {
    const airco = await this.aircos.findOne({
      where: { id },
      relations: { images: true },
    });
    if (!airco) {
      throw new NotFoundException('Airco niet gevonden.');
    }
    return airco;
  }

  private async ensureUniqueSlug(
    slug: string,
    exceptId?: string,
  ): Promise<string> {
    const existing = await this.aircos.findOne({ where: { slug } });
    if (existing && existing.id !== exceptId) {
      throw new ConflictException(`Slug "${slug}" is al in gebruik.`);
    }
    return slug;
  }

  private slugify(brand: string, series: string): string {
    return `${brand}-${series}`
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{M}/gu, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  private toResponse(airco: Airco): AircoResponse {
    const images = [...(airco.images ?? [])]
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((image) => ({
        id: image.id,
        sortOrder: image.sortOrder,
        label: image.label,
        mimeType: image.mimeType,
        url: `/aircos/${airco.id}/images/${image.id}`,
      }));

    return {
      ...airco,
      images,
    };
  }
}
