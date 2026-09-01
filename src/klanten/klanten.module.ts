import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { OffertesModule } from '../offertes/offertes.module';
import { Klant } from './klant.entity';
import { KlantenController } from './klanten.controller';
import { KlantenService } from './klanten.service';

@Module({
  imports: [TypeOrmModule.forFeature([Klant]), AuthModule, OffertesModule],
  controllers: [KlantenController],
  providers: [KlantenService],
})
export class KlantenModule {}
