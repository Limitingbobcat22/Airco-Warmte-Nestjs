import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'node:crypto';
import { Repository } from 'typeorm';
import type { CreateHandleidingDto } from './dto/create-handleiding.dto';
import type { UpdateHandleidingDto } from './dto/update-handleiding.dto';
import { Handleiding } from './handleiding.entity';
import type { UploadedFilePayload } from './uploaded-file';

export type HandleidingResponse = {
  id: string;
  title: string;
  description: string | null;
  originalFilename: string;
  mimeType: string;
  url: string;
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class HandleidingenService {
  constructor(
    @InjectRepository(Handleiding)
    private readonly handleidingen: Repository<Handleiding>,
  ) {}

  async findAll(): Promise<HandleidingResponse[]> {
    const rows = await this.handleidingen.find({
      order: { createdAt: 'DESC' },
    });
    return rows.map((row) => this.toResponse(row));
  }

  async findOne(id: string): Promise<HandleidingResponse> {
    const handleiding = await this.loadHandleiding(id);
    return this.toResponse(handleiding);
  }

  async create(
    dto: CreateHandleidingDto,
    file: UploadedFilePayload,
  ): Promise<HandleidingResponse> {
    const handleiding = this.handleidingen.create({
      id: randomUUID(),
      title: dto.title,
      description: dto.description?.trim() ? dto.description.trim() : null,
      originalFilename: file.originalname,
      mimeType: file.mimetype,
      data: file.buffer,
    });

    const saved = await this.handleidingen.save(handleiding);
    return this.toResponse(saved);
  }

  async update(
    id: string,
    dto: UpdateHandleidingDto,
    file?: UploadedFilePayload,
  ): Promise<HandleidingResponse> {
    const handleiding = await this.loadHandleiding(id);

    if (dto.title != null) handleiding.title = dto.title;
    if (dto.description !== undefined) {
      handleiding.description = dto.description?.trim()
        ? dto.description.trim()
        : null;
    }
    if (file) {
      handleiding.originalFilename = file.originalname;
      handleiding.mimeType = file.mimetype;
      handleiding.data = file.buffer;
    }

    const saved = await this.handleidingen.save(handleiding);
    return this.toResponse(saved);
  }

  async remove(id: string): Promise<void> {
    const handleiding = await this.loadHandleiding(id);
    await this.handleidingen.remove(handleiding);
  }

  async getFileBuffer(
    id: string,
  ): Promise<Pick<Handleiding, 'mimeType' | 'data' | 'originalFilename'>> {
    const handleiding = await this.handleidingen.findOne({
      where: { id },
      select: {
        id: true,
        mimeType: true,
        originalFilename: true,
        data: true,
      },
    });
    if (!handleiding) {
      throw new NotFoundException('Handleiding niet gevonden.');
    }
    return handleiding;
  }

  private async loadHandleiding(id: string): Promise<Handleiding> {
    const handleiding = await this.handleidingen.findOne({ where: { id } });
    if (!handleiding) {
      throw new NotFoundException('Handleiding niet gevonden.');
    }
    return handleiding;
  }

  private toResponse(handleiding: Handleiding): HandleidingResponse {
    return {
      id: handleiding.id,
      title: handleiding.title,
      description: handleiding.description,
      originalFilename: handleiding.originalFilename,
      mimeType: handleiding.mimeType,
      url: `/handleidingen/${handleiding.id}/file`,
      createdAt: handleiding.createdAt,
      updatedAt: handleiding.updatedAt,
    };
  }
}
