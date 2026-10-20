import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class SearchQueryDto {
  @ApiPropertyOptional({
    description:
      'Vrije tekst. Leeg of weggelaten geeft de volledige lijst terug.',
    example: 'Jansen',
  })
  @Transform(({ value }) => {
    if (typeof value !== 'string') return value;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  search?: string;
}
