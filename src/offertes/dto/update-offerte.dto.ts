import { PartialType } from '@nestjs/swagger';
import { CreateOfferteDto } from './create-offerte.dto';

export class UpdateOfferteDto extends PartialType(CreateOfferteDto) {}
