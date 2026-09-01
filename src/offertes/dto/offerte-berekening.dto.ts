import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, Min } from 'class-validator';

/** Invoer en uitkomsten van de frontend-berekening; horen op de offerte. */
export class OfferteBerekeningDto {
  @ApiPropertyOptional({ example: 30, description: 'Oppervlakte ruimte (m²)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  areaM2?: number | null;

  @ApiPropertyOptional({ example: 2.5, description: 'Hoogte ruimte (meter)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  heightM?: number | null;

  @ApiPropertyOptional({
    example: 70,
    description: 'Deel van de woning verwarmd via airco (%)',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  heatingSharePct?: number | null;

  @ApiPropertyOptional({ example: 3.5, description: 'Aanbevolen vermogen (kW)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  requiredKw?: number | null;

  @ApiPropertyOptional({
    example: 1500,
    description: 'Jaarlijks gasverbruik (m³)',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  yearlyGasM3?: number | null;

  @ApiPropertyOptional({ example: 1.45, description: 'Gasprijs (€ per m³)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  gasPriceEur?: number | null;

  @ApiPropertyOptional({ example: 0.28, description: 'Stroomprijs (€ per kWh)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  elecPriceEur?: number | null;

  @ApiPropertyOptional({
    example: 420,
    description: 'Geschat jaarvoordeel, berekend in de frontend.',
  })
  @IsOptional()
  @IsNumber()
  netEuroSavedYearly?: number | null;
}

export type OfferteBerekeningInput = {
  areaM2?: number | null;
  heightM?: number | null;
  heatingSharePct?: number | null;
  requiredKw?: number | null;
  yearlyGasM3?: number | null;
  gasPriceEur?: number | null;
  elecPriceEur?: number | null;
  netEuroSavedYearly?: number | null;
};

export function berekeningFrom(
  input: OfferteBerekeningInput,
): Required<OfferteBerekeningInput> {
  return {
    areaM2: input.areaM2 ?? null,
    heightM: input.heightM ?? null,
    heatingSharePct: input.heatingSharePct ?? null,
    requiredKw: input.requiredKw ?? null,
    yearlyGasM3: input.yearlyGasM3 ?? null,
    gasPriceEur: input.gasPriceEur ?? null,
    elecPriceEur: input.elecPriceEur ?? null,
    netEuroSavedYearly: input.netEuroSavedYearly ?? null,
  };
}

export function applyBerekening(
  target: OfferteBerekeningInput,
  input: OfferteBerekeningInput,
): void {
  if (input.areaM2 !== undefined) target.areaM2 = input.areaM2 ?? null;
  if (input.heightM !== undefined) target.heightM = input.heightM ?? null;
  if (input.heatingSharePct !== undefined) {
    target.heatingSharePct = input.heatingSharePct ?? null;
  }
  if (input.requiredKw !== undefined) target.requiredKw = input.requiredKw ?? null;
  if (input.yearlyGasM3 !== undefined) {
    target.yearlyGasM3 = input.yearlyGasM3 ?? null;
  }
  if (input.gasPriceEur !== undefined) {
    target.gasPriceEur = input.gasPriceEur ?? null;
  }
  if (input.elecPriceEur !== undefined) {
    target.elecPriceEur = input.elecPriceEur ?? null;
  }
  if (input.netEuroSavedYearly !== undefined) {
    target.netEuroSavedYearly = input.netEuroSavedYearly ?? null;
  }
}
