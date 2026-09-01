import {
  BadRequestException,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'node:crypto';
import { DataSource, Repository } from 'typeorm';
import { Airco } from '../aircos/airco.entity';
import { Klant } from '../klanten/klant.entity';
import type { CreateOfferteDto } from './dto/create-offerte.dto';
import {
  applyBerekening,
  berekeningFrom,
  type OfferteBerekeningInput,
} from './dto/offerte-berekening.dto';
import type { UpdateOfferteDto } from './dto/update-offerte.dto';
import { Offerte } from './offerte.entity';
import {
  mapOfferteOverzicht,
  type OfferteViewResponse,
} from './offerte-overzicht.mapper';
import { CREATE_OFFERTE_OVERZICHT_VIEW_SQL } from './offerte-overzicht.sql';
import { OfferteOverzicht } from './offerte-overzicht.view-entity';

export type OfferteAanvraagInput = OfferteBerekeningInput & {
  aircoId?: string | null;
};

@Injectable()
export class OffertesService implements OnModuleInit {
  constructor(
    @InjectRepository(Offerte)
    private readonly offertes: Repository<Offerte>,
    @InjectRepository(OfferteOverzicht)
    private readonly overzicht: Repository<OfferteOverzicht>,
    @InjectRepository(Klant)
    private readonly klanten: Repository<Klant>,
    @InjectRepository(Airco)
    private readonly aircos: Repository<Airco>,
    private readonly dataSource: DataSource,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.dataSource.query(CREATE_OFFERTE_OVERZICHT_VIEW_SQL);
  }

  async findAll(): Promise<OfferteViewResponse[]> {
    const rows = await this.overzicht.find({
      order: { createdAt: 'DESC' },
    });
    return rows.map(mapOfferteOverzicht);
  }

  async findOne(id: string): Promise<OfferteViewResponse> {
    return this.loadOverzicht(id);
  }

  async create(dto: CreateOfferteDto): Promise<OfferteViewResponse> {
    const klant = await this.loadKlant(dto.klantId);
    const airco = await this.resolveAirco(dto.aircoId);
    const offerte = this.offertes.create({
      id: randomUUID(),
      klantId: klant.id,
      aircoId: airco?.id ?? null,
      ...berekeningFrom(dto),
    });
    const saved = await this.offertes.save(offerte);
    return this.loadOverzicht(saved.id);
  }

  async createFromAanvraag(
    klant: Klant,
    aanvraag: OfferteAanvraagInput,
  ): Promise<Offerte | null> {
    if (!this.hasAanvraagData(aanvraag)) return null;

    const airco = await this.resolveAirco(aanvraag.aircoId);
    const offerte = this.offertes.create({
      id: randomUUID(),
      klantId: klant.id,
      aircoId: airco?.id ?? null,
      ...berekeningFrom(aanvraag),
    });
    return this.offertes.save(offerte);
  }

  async update(id: string, dto: UpdateOfferteDto): Promise<OfferteViewResponse> {
    const offerte = await this.loadOfferteRow(id);

    if (dto.klantId !== undefined) {
      const klant = await this.loadKlant(dto.klantId);
      offerte.klantId = klant.id;
    }

    if (dto.aircoId !== undefined) {
      const airco = await this.resolveAirco(dto.aircoId);
      offerte.aircoId = airco?.id ?? null;
    }

    applyBerekening(offerte, dto);

    await this.offertes.save(offerte);
    return this.loadOverzicht(id);
  }

  async remove(id: string): Promise<void> {
    const offerte = await this.loadOfferteRow(id);
    await this.offertes.remove(offerte);
  }

  private hasAanvraagData(aanvraag: OfferteAanvraagInput): boolean {
    return Boolean(
      aanvraag.aircoId ||
        aanvraag.areaM2 != null ||
        aanvraag.heightM != null ||
        aanvraag.heatingSharePct != null ||
        aanvraag.requiredKw != null ||
        aanvraag.yearlyGasM3 != null ||
        aanvraag.gasPriceEur != null ||
        aanvraag.elecPriceEur != null ||
        aanvraag.netEuroSavedYearly != null,
    );
  }

  private async loadOverzicht(id: string): Promise<OfferteViewResponse> {
    const row = await this.overzicht.findOne({ where: { id } });
    if (!row) {
      throw new NotFoundException('Offerte niet gevonden.');
    }
    return mapOfferteOverzicht(row);
  }

  private async loadOfferteRow(id: string): Promise<Offerte> {
    const offerte = await this.offertes.findOne({ where: { id } });
    if (!offerte) {
      throw new NotFoundException('Offerte niet gevonden.');
    }
    return offerte;
  }

  private async loadKlant(id: string): Promise<Klant> {
    const klant = await this.klanten.findOne({ where: { id } });
    if (!klant) {
      throw new NotFoundException('Klant niet gevonden.');
    }
    return klant;
  }

  private async resolveAirco(
    aircoId: string | null | undefined,
  ): Promise<Airco | null> {
    if (aircoId == null || aircoId === '') return null;
    const airco = await this.aircos.findOne({ where: { id: aircoId } });
    if (!airco) {
      throw new BadRequestException('Gekozen airco bestaat niet.');
    }
    return airco;
  }
}
