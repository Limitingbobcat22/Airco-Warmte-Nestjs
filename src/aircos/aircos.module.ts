import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { AircoImage } from './airco-image.entity';
import { Airco } from './airco.entity';
import { AircosController } from './aircos.controller';
import { AircosService } from './aircos.service';

@Module({
  imports: [TypeOrmModule.forFeature([Airco, AircoImage]), AuthModule],
  controllers: [AircosController],
  providers: [AircosService],
})
export class AircosModule {}
