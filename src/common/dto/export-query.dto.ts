import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsArray, IsOptional, IsString, MaxLength } from 'class-validator';
import { SearchQueryDto } from './search-query.dto';

export class ExportQueryDto extends SearchQueryDto {
  @ApiPropertyOptional({
    description:
      'Komma-gescheiden kolom-ids. Weglaten exporteert alle tabelkolommen.',
    example: 'name,email,city',
  })
  @Transform(({ value }) => {
    const raw = Array.isArray(value) ? value.join(',') : value;
    if (typeof raw !== 'string') return undefined;
    const ids = raw
      .split(',')
      .map((part: string) => part.trim())
      .filter((part: string) => part.length > 0);
    return ids.length > 0 ? ids : undefined;
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @MaxLength(40, { each: true })
  columns?: string[];
}
