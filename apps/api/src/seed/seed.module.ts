import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedService } from './seed.service';
import { UserEntity } from '../users/entities/user.entity';
import { ClothingItemEntity } from '../wardrobe/entities/clothing-item.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, ClothingItemEntity])],
  providers: [SeedService],
  exports: [SeedService],
})
export class SeedModule {}
