import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MusinsaController } from './musinsa.controller';
import { MusinsaService } from './musinsa.service';
import { MusinsaItemEntity } from './entities/musinsa-item.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MusinsaItemEntity])],
  controllers: [MusinsaController],
  providers: [MusinsaService],
  exports: [MusinsaService],
})
export class MusinsaModule {}
