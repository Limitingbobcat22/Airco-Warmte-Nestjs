import { PartialType } from '@nestjs/swagger';
import { CreateHandleidingDto } from './create-handleiding.dto';

export class UpdateHandleidingDto extends PartialType(CreateHandleidingDto) {}
