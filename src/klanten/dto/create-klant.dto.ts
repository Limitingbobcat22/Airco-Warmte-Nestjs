import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  Equals,
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { OfferteBerekeningDto } from '../../offertes/dto/offerte-berekening.dto';

const DUTCH_POSTAL_CODE = /^[1-9][0-9]{3}\s?[A-Za-z]{2}$/;

function trimString(value: unknown): unknown {
  return typeof value === 'string' ? value.trim() : value;
}

export class CreateKlantDto extends OfferteBerekeningDto {
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
    description: 'Gekozen airco; wordt op de offerte opgeslagen, niet op de klant.',
  })
  @IsOptional()
  @IsUUID()
  aircoId?: string;
}
