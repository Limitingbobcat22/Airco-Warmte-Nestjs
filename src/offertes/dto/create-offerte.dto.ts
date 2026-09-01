import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional, IsUUID } from 'class-validator';
import { OfferteBerekeningDto } from './offerte-berekening.dto';

export class CreateOfferteDto extends OfferteBerekeningDto {
  @ApiProperty({ example: '3f1a0c2e-6b8d-4e9a-9c1b-2d4f6a8b0c1e' })
  @IsUUID()
  klantId!: string;

  @ApiPropertyOptional({
    example: '3f1a0c2e-6b8d-4e9a-9c1b-2d4f6a8b0c1e',
    nullable: true,
  })
  @Transform(({ value }) => (value === '' ? null : value))
  @IsOptional()
  @IsUUID()
  aircoId?: string | null;
}
