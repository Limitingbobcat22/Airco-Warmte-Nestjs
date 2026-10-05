import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { ArrayMaxSize, IsArray, IsUUID } from 'class-validator';
import { toIdList } from '../multipart';
import { CreateOnderhoudOfferteDto } from './create-onderhoud-offerte.dto';

export class UpdateOnderhoudOfferteDto extends CreateOnderhoudOfferteDto {
  @ApiProperty({ type: [String] })
  @Transform(({ value }) => toIdList(value))
  @IsArray()
  @ArrayMaxSize(3)
  @IsUUID('all', { each: true })
  keepImageIds!: string[];
}
