import {
  BadRequestException,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'node:crypto';
import { DataSource, Repository } from 'typeorm';
import { applyTextSearch } from '../common/text-search';
import {
  type ExcelColumn,
  formatEurExact,
  formatEurWhole,
  formatExportDateTime,
  formatMeasure,
  formatReadStatus,
  selectExportColumns,
  textOrDash,
  workbookBuffer,
} from '../common/excel-export';
import { Airco } from '../aircos/airco.entity';
import { Klant } from '../klanten/klant.entity';
import type { CreateOfferteDto } from './dto/create-offerte.dto';
import {
  applyBerekening,
  berekeningFrom,
  type OfferteBerekeningInput,
} from './dto/offerte-berekening.dto';
import type { UpdateOfferteDto } from './dto/update-offerte.dto';
import type { UpdateOfferteReadDto } from './dto/update-offerte-read.dto';
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

  async findAll(search?: string): Promise<OfferteViewResponse[]> {
    const qb = this.overzicht
      .createQueryBuilder('offerte')
      .orderBy('offerte.createdAt', 'DESC');
    applyTextSearch(
      qb,
      search,
      [
        "CONCAT(offerte.klantFirstName, ' ', offerte.klantLastName)",
        'offerte.klantEmail',
        'offerte.klantPhone',
        'offerte.klantStreet',
        'offerte.klantHouseNumber',
        'offerte.klantPostalCode',
        'offerte.klantCity',
        'offerte.klantNote',
        "CONCAT(offerte.aircoBrand, ' ', offerte.aircoModel)",
        'offerte.aircoUnitType',
      ],
      ["REPLACE(offerte.klantPostalCode, ' ', '')"],
    );
    const rows = await qb.getMany();
    return rows.map(mapOfferteOverzicht);
  }

  async exportExcel(search?: string, columns?: string[]): Promise<Buffer> {
    const rows = await this.findAll(search);
    const tableColumns: ExcelColumn[] = [
      { header: 'Status', key: 'read', width: 14 },
      { header: 'Klant', key: 'name', width: 28 },
      { header: 'E-mail', key: 'email', width: 32 },
      { header: 'Airco', key: 'airco', width: 28 },
      { header: 'Koel vermogen', key: 'coolingKw', width: 16 },
      { header: 'Oppervlakte', key: 'areaM2', width: 14 },
      { header: 'Hoogte', key: 'heightM', width: 12 },
      { header: 'Aandeel airco', key: 'heatingSharePct', width: 16 },
      { header: 'Aanbevolen vermogen', key: 'requiredKw', width: 22 },
      { header: 'Gasverbruik', key: 'yearlyGasM3', width: 14 },
      { header: 'Gasprijs', key: 'gasPriceEur', width: 16 },
      { header: 'Stroomprijs', key: 'elecPriceEur', width: 16 },
      { header: 'Voordeel / jaar', key: 'netEuroSavedYearly', width: 18 },
      { header: 'Aangevraagd', key: 'createdAt', width: 20 },
    ];

    return workbookBuffer(
      'Offertes',
      selectExportColumns(tableColumns, columns),
      rows.map((offerte) => ({
        read: formatReadStatus(offerte.read),
        name: offerte.klant
          ? `${offerte.klant.firstName} ${offerte.klant.lastName}`.trim()
          : 'Klant verwijderd',
        email: textOrDash(offerte.klant?.email),
        airco: offerte.airco
          ? `${offerte.airco.brand} ${offerte.airco.model}`.trim()
          : '–',
        coolingKw: formatMeasure(offerte.airco?.coolingKw, 1, ' kW'),
        areaM2: formatMeasure(offerte.areaM2, null, ' m²'),
        heightM: formatMeasure(offerte.heightM, 1, ' m'),
        heatingSharePct: formatMeasure(offerte.heatingSharePct, null, '%'),
        requiredKw: formatMeasure(offerte.requiredKw, 1, ' kW'),
        yearlyGasM3: formatMeasure(offerte.yearlyGasM3, null, ' m³'),
        gasPriceEur: formatEurExact(offerte.gasPriceEur, '/m³'),
        elecPriceEur: formatEurExact(offerte.elecPriceEur, '/kWh'),
        netEuroSavedYearly: formatEurWhole(offerte.netEuroSavedYearly),
        createdAt: formatExportDateTime(offerte.createdAt),
      })),
    );
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
      read: true,
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
      read: false,
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

  async updateRead(
    id: string,
    dto: UpdateOfferteReadDto,
  ): Promise<OfferteViewResponse> {
    const offerte = await this.loadOfferteRow(id);
    offerte.read = dto.read;
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
