import { ApiPropertyOptional, OmitType, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
import { CreateKlantDto } from './create-klant.dto';

export class UpdateKlantDto extends PartialType(
  OmitType(CreateKlantDto, [
    'consentContact',
    'aircoId',
    'areaM2',
    'heightM',
    'heatingSharePct',
    'requiredKw',
    'yearlyGasM3',
    'gasPriceEur',
    'elecPriceEur',
    'netEuroSavedYearly',
  ] as const),
) {
  @ApiPropertyOptional({
    example: true,
    description: 'Bij bewerken mag toestemming true of false zijn.',
  })
  @IsOptional()
  @IsBoolean()
  consentContact?: boolean;
}
