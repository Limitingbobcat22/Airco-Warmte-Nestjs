import { PartialType } from '@nestjs/swagger';
import { CreateAircoDto } from './create-airco.dto';

export class UpdateAircoDto extends PartialType(CreateAircoDto) {}
