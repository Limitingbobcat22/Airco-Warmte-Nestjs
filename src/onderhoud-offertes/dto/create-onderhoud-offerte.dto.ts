import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  Equals,
  IsArray,
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { toBoolean, toIdList, trimString } from '../multipart';

const DUTCH_POSTAL_CODE = /^[1-9][0-9]{3}\s?[A-Za-z]{2}$/;

export class CreateOnderhoudOfferteDto {
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

  @ApiPropertyOptional()
  @Transform(({ value }) => trimString(value))
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  note?: string;

  @ApiProperty({ example: true })
  @Transform(({ value }) => toBoolean(value))
  @IsBoolean()
  @Equals(true, { message: 'Toestemming voor contact is verplicht.' })
  consentContact!: boolean;

  @ApiProperty({ example: true })
  @Transform(({ value }) => toBoolean(value))
  @IsBoolean()
  @Equals(true, {
    message: 'Acceptatie van de algemene voorwaarden is verplicht.',
  })
  consentTerms!: boolean;

  @ApiProperty({ type: [String] })
  @Transform(({ value }) => toIdList(value))
  @IsArray()
  @ArrayMinSize(1, { message: 'Kies minimaal één onderhoudtype.' })
  @ArrayMaxSize(10)
  @IsUUID('all', { each: true })
  typeIds!: string[];
}
