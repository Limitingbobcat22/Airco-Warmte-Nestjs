import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { OnderhoudType } from './onderhoud-type.entity';
import { OnderhoudTypesController } from './onderhoud-types.controller';
import { OnderhoudTypesService } from './onderhoud-types.service';

@Module({
  imports: [TypeOrmModule.forFeature([OnderhoudType]), AuthModule],
  controllers: [OnderhoudTypesController],
  providers: [OnderhoudTypesService],
  exports: [OnderhoudTypesService],
})
export class OnderhoudTypesModule {}
