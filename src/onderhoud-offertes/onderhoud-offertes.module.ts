import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { Klant } from '../klanten/klant.entity';
import { OnderhoudType } from '../onderhoud-types/onderhoud-type.entity';
import { OnderhoudOfferteFoto } from './onderhoud-offerte-foto.entity';
import { OnderhoudOfferteTypeLink } from './onderhoud-offerte-type-link.entity';
import { OnderhoudOfferte } from './onderhoud-offerte.entity';
import { OnderhoudOffertesController } from './onderhoud-offertes.controller';
import { OnderhoudOffertesService } from './onderhoud-offertes.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      OnderhoudOfferte,
      OnderhoudOfferteFoto,
      OnderhoudOfferteTypeLink,
      OnderhoudType,
      Klant,
    ]),
    AuthModule,
  ],
  controllers: [OnderhoudOffertesController],
  providers: [OnderhoudOffertesService],
})
export class OnderhoudOffertesModule {}
