import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'node:crypto';
import { Repository } from 'typeorm';
import { OffertesService } from '../offertes/offertes.service';
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
    private readonly offertes: OffertesService,
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
    });

    const saved = await this.klanten.save(klant);

    try {
      await this.offertes.createFromAanvraag(saved, {
        aircoId: dto.aircoId,
        areaM2: dto.areaM2,
        heightM: dto.heightM,
        heatingSharePct: dto.heatingSharePct,
        requiredKw: dto.requiredKw,
        yearlyGasM3: dto.yearlyGasM3,
        gasPriceEur: dto.gasPriceEur,
        elecPriceEur: dto.elecPriceEur,
        netEuroSavedYearly: dto.netEuroSavedYearly,
      });
    } catch (error) {
      await this.klanten.remove(saved);
      throw error;
    }

    return saved;
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
}
