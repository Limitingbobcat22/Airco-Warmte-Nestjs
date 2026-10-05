import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

function trimString(value: unknown): unknown {
  return typeof value === 'string' ? value.trim() : value;
}

export class CreateOnderhoudTypeDto {
  @ApiProperty({ example: 'Ketels' })
  @Transform(({ value }) => trimString(value))
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  name!: string;

  @ApiPropertyOptional({
    example: 'Controleren van de ketel\nReinigen van de brander',
  })
  @Transform(({ value }) => trimString(value))
  @IsOptional()
  @IsString()
  @MaxLength(4000)
  description?: string;

  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(999)
  sortOrder!: number;
}
