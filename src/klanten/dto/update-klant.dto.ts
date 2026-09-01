import { ApiPropertyOptional, OmitType, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
import { CreateKlantDto } from './create-klant.dto';

export class UpdateKlantDto extends PartialType(
  OmitType(CreateKlantDto, ['consentContact'] as const),
) {
  @ApiPropertyOptional({
    example: true,
    description: 'Bij bewerken mag toestemming true of false zijn.',
  })
  @IsOptional()
  @IsBoolean()
  consentContact?: boolean;
}
