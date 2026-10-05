import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class UpdateOnderhoudOfferteReadDto {
  @ApiProperty({
    example: true,
    description: 'true = gelezen, false = ongelezen.',
  })
  @IsBoolean()
  read!: boolean;
}
