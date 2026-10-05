import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { ArrayMaxSize, ArrayMinSize, IsArray, IsUUID } from 'class-validator';
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
}
