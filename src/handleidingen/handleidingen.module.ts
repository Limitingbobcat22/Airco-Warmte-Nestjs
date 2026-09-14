import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { Handleiding } from './handleiding.entity';
import { HandleidingenController } from './handleidingen.controller';
import { HandleidingenService } from './handleidingen.service';

@Module({
  imports: [TypeOrmModule.forFeature([Handleiding]), AuthModule],
  controllers: [HandleidingenController],
  providers: [HandleidingenService],
})
export class HandleidingenModule {}
