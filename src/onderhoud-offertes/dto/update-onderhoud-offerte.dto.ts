import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  ArrayMaxSize,
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

export class UpdateOnderhoudOfferteDto {
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

  @ApiProperty()
  @Transform(({ value }) => toBoolean(value))
  @IsBoolean()
  consentContact!: boolean;

  @ApiProperty()
  @Transform(({ value }) => toBoolean(value))
  @IsBoolean()
  consentTerms!: boolean;

  @ApiProperty({ type: [String] })
  @Transform(({ value }) => toIdList(value))
  @IsArray()
  @ArrayMaxSize(10)
  @IsUUID('all', { each: true })
  typeIds!: string[];

  @ApiProperty({ type: [String] })
  @Transform(({ value }) => toIdList(value))
  @IsArray()
  @ArrayMaxSize(3)
  @IsUUID('all', { each: true })
  keepPhotoIds!: string[];

  @ApiPropertyOptional()
  @Transform(({ value }) => {
    const text = trimString(value);
    return text || undefined;
  })
  @IsOptional()
  @IsUUID()
  klantId?: string;
}
