import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  OutfitRecommendationRequest,
  RecommendationStatus,
  ClothingItem,
} from '@moodfit/shared';
import { AiService } from '../ai/ai.service';
import { WardrobeService } from '../wardrobe/wardrobe.service';
import { WeatherService } from '../weather/weather.service';
import { UserEntity } from '../users/entities/user.entity';

// We'll store recommendations as JSON in a simple structure for now
// In production, create a proper TypeORM entity
export interface StoredRecommendation {
  id: string;
  userId: string;
  items: Array<{
    clothingItemId: string;
    role: 'primary' | 'layering' | 'accessory';
  }>;
  occasion: string;
  season: string;
  mood: string;
  weatherCondition?: string;
  temperature?: number;
  aiExplanation: string;
  aiConfidenceScore: number;
  stylingTips: string[];
  colorPalette: string[];
  status: RecommendationStatus;
  isSaved: boolean;
  wearDate?: string;
  createdAt: string;
  updatedAt: string;
}

@Injectable()
export class OutfitService {
  private readonly logger = new Logger(OutfitService.name);
  // In-memory store for demo; replace with TypeORM entity in production
  private recommendations: StoredRecommendation[] = [];
  private wearLogs: any[] = [];

  constructor(
    private readonly aiService: AiService,
    private readonly wardrobeService: WardrobeService,
    private readonly weatherService: WeatherService,
  ) {}

  async requestRecommendation(
    userId: string,
    request: OutfitRecommendationRequest,
    user?: UserEntity,
  ): Promise<StoredRecommendation> {
    // Get user's wardrobe
    const wardrobe = await this.wardrobeService.findAll(userId, {
      page: 1,
      limit: 200,
      ...(request.occasion && { occasions: [request.occasion] }),
    });

    const wardrobeItems = wardrobe.data as unknown as ClothingItem[];

    if (wardrobeItems.length === 0) {
      throw new NotFoundException(
        'No wardrobe items found. Please add items to your wardrobe first.',
      );
    }

    // Optionally fetch weather if not provided
    let weatherData = request.weatherData;

    // Get AI recommendation
    const aiResult = await this.aiService.generateOutfitRecommendation(
      wardrobeItems,
      { ...request, weatherData },
      {
        stylePreferences: user?.stylePreferences,
        bodyType: user?.bodyType,
      },
    );

    const now = new Date().toISOString();
    const recommendation: StoredRecommendation = {
      id: crypto.randomUUID(),
      userId,
      items: aiResult.selectedItemIds.map((id) => ({
        clothingItemId: id,
        role: aiResult.roles[id] || 'primary',
      })),
      occasion: request.occasion,
      season: this.getCurrentSeason(),
      mood: request.mood || 'confident',
      weatherCondition: weatherData?.condition,
      temperature: weatherData?.temperature,
      aiExplanation: aiResult.explanation,
      aiConfidenceScore: aiResult.confidenceScore,
      stylingTips: aiResult.stylingTips,
      colorPalette: aiResult.colorPalette,
      status: RecommendationStatus.COMPLETED,
      isSaved: false,
      createdAt: now,
      updatedAt: now,
    };

    this.recommendations.unshift(recommendation);
    return recommendation;
  }

  async getRecommendations(
    userId: string,
    page = 1,
    limit = 10,
  ) {
    const userRecs = this.recommendations.filter((r) => r.userId === userId);
    const total = userRecs.length;
    const data = userRecs.slice((page - 1) * limit, page * limit);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getRecommendation(id: string, userId: string): Promise<StoredRecommendation> {
    const rec = this.recommendations.find((r) => r.id === id);
    if (!rec) throw new NotFoundException('Recommendation not found');
    if (rec.userId !== userId) throw new ForbiddenException();
    return rec;
  }

  async saveRecommendation(id: string, userId: string): Promise<StoredRecommendation> {
    const rec = await this.getRecommendation(id, userId);
    rec.isSaved = true;
    rec.updatedAt = new Date().toISOString();
    return rec;
  }

  async logWear(userId: string, data: any) {
    const log = {
      id: crypto.randomUUID(),
      userId,
      ...data,
      createdAt: new Date().toISOString(),
    };

    this.wearLogs.unshift(log);

    // Increment wear count for each item
    if (data.outfitItems) {
      for (const item of data.outfitItems) {
        await this.wardrobeService.incrementWearCount(item.clothingItemId).catch(() => {});
      }
    }

    return log;
  }

  async getWearHistory(userId: string, page = 1, limit = 20) {
    const userLogs = this.wearLogs.filter((l) => l.userId === userId);
    const total = userLogs.length;
    const data = userLogs.slice((page - 1) * limit, page * limit);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  private getCurrentSeason(): string {
    const month = new Date().getMonth() + 1;
    if (month >= 3 && month <= 5) return 'spring';
    if (month >= 6 && month <= 8) return 'summer';
    if (month >= 9 && month <= 11) return 'autumn';
    return 'winter';
  }
}
