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
  @ApiProperty({ example: 'Haier' })
  @IsString()
  @MaxLength(80)
  brand!: string;

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

  @ApiProperty({ example: 6.2 })
  @IsNumber()
  @Min(0)
  coolingKw!: number;

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
  noiseDbaInside!: number;

  @ApiProperty({ example: 48 })
  @IsInt()
  noiseDbaOutside!: number;

  @ApiPropertyOptional({ example: '295 × 858 × 187 mm' })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  netSizeInside?: string;

  @ApiPropertyOptional({ example: '700 × 870 × 320 mm' })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  netSizeOutside?: string;

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
