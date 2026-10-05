import { PartialType } from '@nestjs/swagger';
import { CreateOnderhoudTypeDto } from './create-onderhoud-type.dto';

export class UpdateOnderhoudTypeDto extends PartialType(CreateOnderhoudTypeDto) {}
