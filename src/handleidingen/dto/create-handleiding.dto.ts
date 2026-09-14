import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

function trimString(value: unknown): unknown {
  return typeof value === 'string' ? value.trim() : value;
}

export class CreateHandleidingDto {
  @ApiProperty({ example: 'Gebruikershandleiding Haier wandmodel' })
  @Transform(({ value }) => trimString(value))
  @IsString()
  @MinLength(1)
  @MaxLength(160)
  title!: string;

  @ApiPropertyOptional({
    example: 'Installatie- en gebruiksinstructies voor het wandmodel.',
  })
  @Transform(({ value }) => trimString(value))
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;
}
