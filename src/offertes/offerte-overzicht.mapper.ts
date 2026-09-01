import type { Klant } from '../klanten/klant.entity';
import type { OfferteOverzicht } from './offerte-overzicht.view-entity';

export type OfferteAircoSnapshot = {
  id: string;
  brand: string;
  model: string;
  unitType: string;
  tag: string;
  description: string;
  productFunction: string;
  trustPoints: string[];
  coolingKw: number;
  heatingKw: number;
  seer: number;
  scop: number;
  energyClassCooling: string;
  energyClassHeating: string;
  noiseDbaInside: number;
  noiseDbaOutside: number;
  netSizeInside: string;
  netSizeOutside: string;
  refrigerant: string;
  roomM2: string;
  heatingCoverage: number;
  priceEur: number;
  accent: string;
};

export type OfferteViewResponse = {
  id: string;
  klantId: string | null;
  aircoId: string | null;
  areaM2: number | null;
  heightM: number | null;
  heatingSharePct: number | null;
  requiredKw: number | null;
  yearlyGasM3: number | null;
  gasPriceEur: number | null;
  elecPriceEur: number | null;
  netEuroSavedYearly: number | null;
  createdAt: Date;
  updatedAt: Date;
  klant: Klant | null;
  airco: OfferteAircoSnapshot | null;
};

function asStringArray(value: string[] | string | null | undefined): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === 'string');
  }
  if (typeof value === 'string' && value.trim()) {
    try {
      const parsed: unknown = JSON.parse(value);
      return Array.isArray(parsed)
        ? parsed.filter((item): item is string => typeof item === 'string')
        : [];
    } catch {
      return [];
    }
  }
  return [];
}

function asBoolean(value: boolean | number | null | undefined): boolean {
  if (typeof value === 'boolean') return value;
  return Number(value) === 1;
}

export function mapOfferteOverzicht(row: OfferteOverzicht): OfferteViewResponse {
  const klant: Klant | null =
    row.klantId && row.klantFirstName != null && row.klantLastName != null
      ? {
          id: row.klantId,
          firstName: row.klantFirstName,
          lastName: row.klantLastName,
          email: row.klantEmail ?? '',
          phone: row.klantPhone ?? '',
          street: row.klantStreet ?? '',
          houseNumber: row.klantHouseNumber ?? '',
          postalCode: row.klantPostalCode ?? '',
          city: row.klantCity ?? '',
          note: row.klantNote,
          consentContact: asBoolean(row.klantConsentContact),
          createdAt: row.klantCreatedAt ?? row.createdAt,
          updatedAt: row.klantUpdatedAt ?? row.updatedAt,
        }
      : null;

  const airco: OfferteAircoSnapshot | null =
    row.aircoId && row.aircoBrand != null && row.aircoModel != null
      ? {
          id: row.aircoId,
          brand: row.aircoBrand,
          model: row.aircoModel,
          unitType: row.aircoUnitType ?? '',
          tag: row.aircoTag ?? '',
          description: row.aircoDescription ?? '',
          productFunction: row.aircoProductFunction ?? '',
          trustPoints: asStringArray(row.aircoTrustPoints),
          coolingKw: row.aircoCoolingKw ?? 0,
          heatingKw: row.aircoHeatingKw ?? 0,
          seer: row.aircoSeer ?? 0,
          scop: row.aircoScop ?? 0,
          energyClassCooling: row.aircoEnergyClassCooling ?? '',
          energyClassHeating: row.aircoEnergyClassHeating ?? '',
          noiseDbaInside: row.aircoNoiseDbaInside ?? 0,
          noiseDbaOutside: row.aircoNoiseDbaOutside ?? 0,
          netSizeInside: row.aircoNetSizeInside ?? '',
          netSizeOutside: row.aircoNetSizeOutside ?? '',
          refrigerant: row.aircoRefrigerant ?? '',
          roomM2: row.aircoRoomM2 ?? '',
          heatingCoverage: row.aircoHeatingCoverage ?? 0,
          priceEur: row.aircoPriceEur ?? 0,
          accent: row.aircoAccent ?? '',
        }
      : null;

  return {
    id: row.id,
    klantId: row.klantId,
    aircoId: row.aircoId,
    areaM2: row.areaM2,
    heightM: row.heightM,
    heatingSharePct: row.heatingSharePct,
    requiredKw: row.requiredKw,
    yearlyGasM3: row.yearlyGasM3,
    gasPriceEur: row.gasPriceEur,
    elecPriceEur: row.elecPriceEur,
    netEuroSavedYearly: row.netEuroSavedYearly,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    klant,
    airco,
  };
}
