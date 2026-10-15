import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { toIdList, trimString } from '../multipart';

export class CreateOnderhoudOfferteDto {
  @ApiProperty({ description: 'Bestaande klant uit de klantentabel' })
  @Transform(({ value }) => trimString(value))
  @IsUUID('all')
  klantId!: string;

  @ApiProperty({ type: [String], description: 'Gekozen onderhoudtypes' })
  @Transform(({ value }) => toIdList(value))
  @IsArray()
  @ArrayMinSize(1, { message: 'Kies minimaal één onderhoudtype.' })
  @ArrayMaxSize(10)
  @IsUUID('all', { each: true })
  typeIds!: string[];

  @ApiPropertyOptional({
    description: 'Extra informatie over de onderhoudstaken. Leeg wissen mag.',
    maxLength: 2000,
  })
  @Transform(({ value }) => trimString(value))
  @IsOptional()
  @IsString()
  @MaxLength(2000, { message: 'Toelichting is te lang.' })
  taskNote?: string;
}
