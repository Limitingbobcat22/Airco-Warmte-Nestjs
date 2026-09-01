import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'node:crypto';
import { Repository } from 'typeorm';
import { Airco } from '../aircos/airco.entity';
import type { CreateKlantDto } from './dto/create-klant.dto';
import type { UpdateKlantDto } from './dto/update-klant.dto';
import { Klant } from './klant.entity';

function normalizePostalCode(value: string): string {
  const compact = value.replace(/\s+/g, '').toUpperCase();
  if (/^[1-9][0-9]{3}[A-Z]{2}$/.test(compact)) {
    return `${compact.slice(0, 4)} ${compact.slice(4)}`;
  }
  return value.trim().toUpperCase();
}

@Injectable()
export class KlantenService {
  constructor(
    @InjectRepository(Klant)
    private readonly klanten: Repository<Klant>,
    @InjectRepository(Airco)
    private readonly aircos: Repository<Airco>,
  ) {}

  async findAll(): Promise<Klant[]> {
    return this.klanten.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Klant> {
    return this.loadKlant(id);
  }

  async create(dto: CreateKlantDto): Promise<Klant> {
    const aircoId = await this.resolveAircoId(dto.aircoId);

    const klant = this.klanten.create({
      id: randomUUID(),
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
      aircoId,
      aircoLabel: dto.aircoLabel?.trim() || null,
      coolingKw: dto.coolingKw ?? null,
      heatingKw: dto.heatingKw ?? null,
      netEuroSavedYearly: dto.netEuroSavedYearly ?? null,
    });

    return this.klanten.save(klant);
  }

  async update(id: string, dto: UpdateKlantDto): Promise<Klant> {
    const klant = await this.loadKlant(id);

    if (dto.firstName != null) klant.firstName = dto.firstName;
    if (dto.lastName != null) klant.lastName = dto.lastName;
    if (dto.email != null) klant.email = dto.email;
    if (dto.phone != null) klant.phone = dto.phone;
    if (dto.street != null) klant.street = dto.street;
    if (dto.houseNumber != null) klant.houseNumber = dto.houseNumber;
    if (dto.postalCode != null) {
      klant.postalCode = normalizePostalCode(dto.postalCode);
    }
    if (dto.city != null) klant.city = dto.city;
    if (dto.note !== undefined) {
      klant.note = dto.note?.trim() ? dto.note.trim() : null;
    }
    if (dto.consentContact != null) klant.consentContact = dto.consentContact;
    if (dto.aircoId !== undefined) {
      klant.aircoId = await this.resolveAircoId(dto.aircoId);
    }
    if (dto.aircoLabel !== undefined) {
      klant.aircoLabel = dto.aircoLabel?.trim() || null;
    }
    if (dto.coolingKw !== undefined) klant.coolingKw = dto.coolingKw ?? null;
    if (dto.heatingKw !== undefined) klant.heatingKw = dto.heatingKw ?? null;
    if (dto.netEuroSavedYearly !== undefined) {
      klant.netEuroSavedYearly = dto.netEuroSavedYearly ?? null;
    }

    return this.klanten.save(klant);
  }

  async remove(id: string): Promise<void> {
    const klant = await this.loadKlant(id);
    await this.klanten.remove(klant);
  }

  private async loadKlant(id: string): Promise<Klant> {
    const klant = await this.klanten.findOne({ where: { id } });
    if (!klant) {
      throw new NotFoundException('Klant niet gevonden.');
    }
    return klant;
  }

  private async resolveAircoId(
    aircoId: string | null | undefined,
  ): Promise<string | null> {
    if (aircoId == null || aircoId === '') return null;
    const airco = await this.aircos.findOne({ where: { id: aircoId } });
    if (!airco) {
      throw new BadRequestException('Gekozen airco bestaat niet.');
    }
    return airco.id;
  }
}
