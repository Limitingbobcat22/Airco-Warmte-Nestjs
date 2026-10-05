import {
  BadRequestException,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'node:crypto';
import { QueryFailedError, Repository } from 'typeorm';
import { DEFAULT_ONDERHOUD_TYPES } from './default-onderhoud-types';
import type { CreateOnderhoudTypeDto } from './dto/create-onderhoud-type.dto';
import type { UpdateOnderhoudTypeDto } from './dto/update-onderhoud-type.dto';
import { OnderhoudType } from './onderhoud-type.entity';

@Injectable()
export class OnderhoudTypesService implements OnModuleInit {
  constructor(
    @InjectRepository(OnderhoudType)
    private readonly types: Repository<OnderhoudType>,
  ) {}

  async onModuleInit(): Promise<void> {
    const existing = await this.types.find();
    const byId = new Map(existing.map((row) => [row.id, row]));
    const pending: OnderhoudType[] = [];

    for (const item of DEFAULT_ONDERHOUD_TYPES) {
      const row = byId.get(item.id);
      if (!row) {
        pending.push(this.types.create(item));
        continue;
      }
      if (!row.description?.trim()) {
        row.description = item.description;
        pending.push(row);
      }
    }

    if (pending.length === 0) return;
    await this.types.save(pending);
  }

  findAll(): Promise<OnderhoudType[]> {
    return this.types.find({
      order: { sortOrder: 'ASC', name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<OnderhoudType> {
    return this.loadType(id);
  }

  async create(dto: CreateOnderhoudTypeDto): Promise<OnderhoudType> {
    const row = this.types.create({
      id: randomUUID(),
      name: dto.name,
      description: dto.description?.trim() ? dto.description.trim() : null,
      sortOrder: dto.sortOrder,
    });
    return this.saveUnique(row);
  }

  async update(id: string, dto: UpdateOnderhoudTypeDto): Promise<OnderhoudType> {
    const row = await this.loadType(id);
    if (dto.name != null) row.name = dto.name;
    if (dto.description !== undefined) {
      row.description = dto.description?.trim() ? dto.description.trim() : null;
    }
    if (dto.sortOrder != null) row.sortOrder = dto.sortOrder;
    return this.saveUnique(row);
  }

  async remove(id: string): Promise<void> {
    const row = await this.loadType(id);
    const used = await this.types.manager
      .createQueryBuilder()
      .select('link.offerte_id', 'offerteId')
      .from('onderhoud_offerte_types', 'link')
      .where('link.type_id = :id', { id })
      .limit(1)
      .getRawOne<{ offerteId: string }>();
    if (used) {
      throw new BadRequestException(
        'Dit onderhoudtype wordt gebruikt in een offerte en kan niet verwijderd worden.',
      );
    }
    await this.types.remove(row);
  }

  private async loadType(id: string): Promise<OnderhoudType> {
    const row = await this.types.findOne({ where: { id } });
    if (!row) throw new NotFoundException('Onderhoudtype niet gevonden.');
    return row;
  }

  private async saveUnique(row: OnderhoudType): Promise<OnderhoudType> {
    try {
      return await this.types.save(row);
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        (error as QueryFailedError & { driverError?: { code?: string } })
          .driverError?.code === 'ER_DUP_ENTRY'
      ) {
        throw new BadRequestException(
          'Er bestaat al een onderhoudtype met deze naam.',
        );
      }
      throw error;
    }
  }
}
