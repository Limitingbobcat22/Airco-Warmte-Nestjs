import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Airco } from '../aircos/airco.entity';
import { AuthModule } from '../auth/auth.module';
import { Klant } from './klant.entity';
import { KlantenController } from './klanten.controller';
import { KlantenService } from './klanten.service';

@Module({
  imports: [TypeOrmModule.forFeature([Klant, Airco]), AuthModule],
  controllers: [KlantenController],
  providers: [KlantenService],
})
export class KlantenModule {}
