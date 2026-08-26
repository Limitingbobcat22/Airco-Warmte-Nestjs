import {
  IsArray,
  IsHexColor,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAircoDto {
  @ApiPropertyOptional({ example: 'haier-revive' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  slug?: string;

  @ApiProperty({ example: 'Haier' })
  @IsString()
  @MaxLength(80)
  brand!: string;

  @ApiProperty({ example: 'Revive' })
  @IsString()
  @MaxLength(80)
  series!: string;

  @ApiProperty({ example: 'Wandmodel' })
  @IsString()
  @MaxLength(80)
  model!: string;

  @ApiPropertyOptional({ example: 'Wandmodel (split)' })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  unitType?: string;

  @ApiPropertyOptional({ example: 'Voordelig & Efficient' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  tag?: string;

  @ApiProperty({
    example:
      'Het perfecte basismodel voor snelle koeling en verwarming met een uitstekende prijs-kwaliteitverhouding.',
  })
  @IsString()
  description!: string;

  @ApiPropertyOptional({ example: 'Koelen en verwarmen' })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  productFunction?: string;

  @ApiProperty({
    type: [String],
    example: [
      'Energielabel A++ / A+',
      'Snelle koeling & verwarming',
      'hOn Smart App bediening',
      'Eenvoudig onderhoud',
    ],
  })
  @IsArray()
  @IsString({ each: true })
  features!: string[];

  @ApiPropertyOptional({
    type: [String],
    example: [
      'Inclusief standaard montage',
      'F-gassen-gecertificeerde monteur',
    ],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  trustPoints?: string[];

  @ApiProperty({ example: 2.7 })
  @IsNumber()
  @Min(0)
  coolingKwMin!: number;

  @ApiProperty({ example: 6.2 })
  @IsNumber()
  @Min(0)
  coolingKwMax!: number;

  @ApiProperty({ example: 3.9 })
  @IsNumber()
  @Min(0)
  heatingKw!: number;

  @ApiProperty({ example: 6.1 })
  @IsNumber()
  @Min(0)
  seer!: number;

  @ApiProperty({ example: 4.0 })
  @IsNumber()
  @Min(0)
  scop!: number;

  @ApiProperty({ example: 'A++' })
  @IsString()
  @MaxLength(8)
  energyClassCooling!: string;

  @ApiProperty({ example: 'A+' })
  @IsString()
  @MaxLength(8)
  energyClassHeating!: string;

  @ApiProperty({ example: 19 })
  @IsInt()
  noiseSilentDba!: number;

  @ApiProperty({ example: -20 })
  @IsInt()
  minTempC!: number;

  @ApiPropertyOptional({ example: 'R32' })
  @IsOptional()
  @IsString()
  @MaxLength(16)
  refrigerant?: string;

  @ApiProperty({ example: 'tot 40 m²' })
  @IsString()
  @MaxLength(40)
  roomM2!: string;

  @ApiPropertyOptional({ example: 0.5 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  heatingCoverage?: number;

  @ApiProperty({ example: 1890 })
  @IsNumber()
  @Min(0)
  priceEur!: number;

  @ApiPropertyOptional({ example: '#005A9C' })
  @IsOptional()
  @IsHexColor()
  accent?: string;
}
