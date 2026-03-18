import { Module } from '@nestjs/common';
import { OutfitController } from './outfit.controller';
import { OutfitService } from './outfit.service';
import { AiModule } from '../ai/ai.module';
import { WardrobeModule } from '../wardrobe/wardrobe.module';
import { WeatherModule } from '../weather/weather.module';

@Module({
  imports: [AiModule, WardrobeModule, WeatherModule],
  controllers: [OutfitController],
  providers: [OutfitService],
  exports: [OutfitService],
})
export class OutfitModule {}
