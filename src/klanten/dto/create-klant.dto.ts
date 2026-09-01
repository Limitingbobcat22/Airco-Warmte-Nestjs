import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  Equals,
  IsBoolean,
  IsEmail,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

const DUTCH_POSTAL_CODE = /^[1-9][0-9]{3}\s?[A-Za-z]{2}$/;

function trimString(value: unknown): unknown {
  return typeof value === 'string' ? value.trim() : value;
}

export class CreateKlantDto {
  @ApiProperty({ example: 'Jan' })
  @Transform(({ value }) => trimString(value))
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  firstName!: string;

  @ApiProperty({ example: 'Jansen' })
  @Transform(({ value }) => trimString(value))
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  lastName!: string;

  @ApiProperty({ example: 'jan.jansen@example.com' })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail()
  @MaxLength(255)
  email!: string;

  @ApiProperty({ example: '06 12345678' })
  @Transform(({ value }) => trimString(value))
  @IsString()
  @MinLength(8)
  @MaxLength(30)
  phone!: string;

  @ApiProperty({ example: 'Kerkstraat' })
  @Transform(({ value }) => trimString(value))
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  street!: string;

  @ApiProperty({ example: '12A' })
  @Transform(({ value }) => trimString(value))
  @IsString()
  @MinLength(1)
  @MaxLength(16)
  houseNumber!: string;

  @ApiProperty({ example: '1234 AB' })
  @Transform(({ value }) => trimString(value))
  @IsString()
  @Matches(DUTCH_POSTAL_CODE, {
    message: 'Postcode moet het formaat 1234 AB hebben.',
  })
  @MaxLength(10)
  postalCode!: string;

  @ApiProperty({ example: 'Utrecht' })
  @Transform(({ value }) => trimString(value))
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  city!: string;

  @ApiPropertyOptional({ example: 'Het liefst contact in de ochtend.' })
  @Transform(({ value }) => trimString(value))
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  note?: string;

  @ApiProperty({
    example: true,
    description: 'Toestemming om contact op te nemen over de offerte.',
  })
  @IsBoolean()
  @Equals(true, { message: 'Toestemming voor contact is verplicht.' })
  consentContact!: boolean;

  @ApiPropertyOptional({
    example: '3f1a0c2e-6b8d-4e9a-9c1b-2d4f6a8b0c1e',
    description: 'Gekozen airco (optioneel).',
  })
  @IsOptional()
  @IsUUID()
  aircoId?: string;

  @ApiPropertyOptional({ example: 'Haier Wandmodel' })
  @Transform(({ value }) => trimString(value))
  @IsOptional()
  @IsString()
  @MaxLength(160)
  aircoLabel?: string;

  @ApiPropertyOptional({ example: 6.2 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  coolingKw?: number;

  @ApiPropertyOptional({ example: 6.3 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  heatingKw?: number;

  @ApiPropertyOptional({ example: 420 })
  @IsOptional()
  @IsNumber()
  netEuroSavedYearly?: number;
}
