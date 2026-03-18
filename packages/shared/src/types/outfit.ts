import { ClothingItem, ClothingOccasion, ClothingSeason } from './clothing';
import { WeatherCondition } from './weather';

export enum OutfitMood {
  CONFIDENT = 'confident',
  RELAXED = 'relaxed',
  PROFESSIONAL = 'professional',
  PLAYFUL = 'playful',
  ROMANTIC = 'romantic',
  ENERGETIC = 'energetic',
  COZY = 'cozy',
  ADVENTUROUS = 'adventurous',
}

export enum RecommendationStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export interface OutfitItem {
  clothingItemId: string;
  clothingItem?: ClothingItem;
  role: 'primary' | 'layering' | 'accessory';
}

export interface OutfitRecommendation {
  id: string;
  userId: string;
  items: OutfitItem[];
  occasion: ClothingOccasion;
  season: ClothingSeason;
  mood: OutfitMood;
  weatherCondition?: WeatherCondition;
  temperature?: number;
  aiExplanation: string;
  aiConfidenceScore: number; // 0-100
  stylingTips: string[];
  colorPalette: string[];
  status: RecommendationStatus;
  isSaved: boolean;
  wearDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OutfitRecommendationRequest {
  occasion: ClothingOccasion;
  mood?: OutfitMood;
  weatherData?: {
    temperature: number;
    condition: WeatherCondition;
    humidity: number;
  };
  specificItems?: string[]; // clothingItem IDs to include
  excludeItems?: string[]; // clothingItem IDs to exclude
  notes?: string;
}

export interface OutfitPost {
  id: string;
  userId: string;
  userProfile?: {
    username: string;
    displayName: string;
    avatarUrl?: string;
  };
  outfitRecommendationId?: string;
  items: OutfitItem[];
  imageUrl?: string;
  caption?: string;
  occasion: ClothingOccasion;
  mood?: OutfitMood;
  tags: string[];
  likesCount: number;
  commentsCount: number;
  isLiked?: boolean;
  isBookmarked?: boolean;
  weatherInfo?: {
    temperature: number;
    condition: WeatherCondition;
    location: string;
  };
  wornDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WearLog {
  id: string;
  userId: string;
  outfitItems: OutfitItem[];
  outfitPostId?: string;
  outfitRecommendationId?: string;
  occasion: ClothingOccasion;
  mood?: OutfitMood;
  notes?: string;
  rating?: number; // 1-5
  wornDate: string;
  weather?: {
    temperature: number;
    condition: WeatherCondition;
    location: string;
  };
  createdAt: string;
}

export interface OutfitComment {
  id: string;
  postId: string;
  userId: string;
  userProfile?: {
    username: string;
    displayName: string;
    avatarUrl?: string;
  };
  content: string;
  likesCount: number;
  isLiked?: boolean;
  createdAt: string;
  updatedAt: string;
}
