import { OmitType } from '@nestjs/swagger';
import { UpdateOnderhoudOfferteDto } from './update-onderhoud-offerte.dto';

/** Zelfde velden als een wijziging, zonder bestaande foto's. Toestemming is niet verplicht. */
export class AdminCreateOnderhoudOfferteDto extends OmitType(
  UpdateOnderhoudOfferteDto,
  ['keepPhotoIds'] as const,
) {}
