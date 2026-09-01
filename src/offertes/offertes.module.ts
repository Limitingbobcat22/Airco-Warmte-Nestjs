import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Airco } from '../aircos/airco.entity';
import { AuthModule } from '../auth/auth.module';
import { Klant } from '../klanten/klant.entity';
import { Offerte } from './offerte.entity';
import { OfferteOverzicht } from './offerte-overzicht.view-entity';
import { OffertesController } from './offertes.controller';
import { OffertesService } from './offertes.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Offerte, OfferteOverzicht, Klant, Airco]),
    AuthModule,
  ],
  controllers: [OffertesController],
  providers: [OffertesService],
  exports: [OffertesService],
})
export class OffertesModule {}
