import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ClothingItem,
  OutfitRecommendationRequest,
  ClothingCategory,
} from '@moodfit/shared';

export interface AiOutfitRecommendation {
  selectedItemIds: string[];
  roles: Record<string, 'primary' | 'layering' | 'accessory'>;
  explanation: string;
  confidenceScore: number;
  stylingTips: string[];
  colorPalette: string[];
}

interface ParsedRecommendation {
  selectedItemIds: string[];
  roles: Record<string, 'primary' | 'layering' | 'accessory'>;
  explanation: string;
  confidenceScore: number;
  stylingTips: string[];
  colorPalette: string[];
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly apiKey: string | undefined;
  private anthropic: any;

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('ANTHROPIC_API_KEY');
    if (this.apiKey) {
      // 동적으로 로드하여 API 키 없을 때 import 오류 방지
      import('@anthropic-ai/sdk').then((mod) => {
        this.anthropic = new mod.default({ apiKey: this.apiKey });
      });
    }
  }

  async generateOutfitRecommendation(
    wardrobeItems: ClothingItem[],
    request: OutfitRecommendationRequest,
    userPreferences?: {
      stylePreferences?: string[];
      bodyType?: string;
    },
  ): Promise<AiOutfitRecommendation> {
    if (wardrobeItems.length === 0) {
      throw new Error('No wardrobe items available for recommendation');
    }

    // API 키가 없으면 Mock 추천 사용
    if (!this.apiKey) {
      this.logger.warn('[MOCK MODE] ANTHROPIC_API_KEY 없음 — Mock 추천 반환');
      return this.getMockRecommendation(wardrobeItems, request);
    }

    const systemPrompt = this.buildSystemPrompt();
    const userPrompt = this.buildUserPrompt(wardrobeItems, request, userPreferences);

    this.logger.log(`AI 코디 추천 생성 중 (occasion: ${request.occasion})`);

    try {
      const message = await this.anthropic.messages.create({
        model: 'claude-opus-4-5',
        max_tokens: 1500,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
      });

      const responseText =
        message.content[0].type === 'text' ? message.content[0].text : '';

      return this.parseRecommendationResponse(responseText, wardrobeItems);
    } catch (error) {
      this.logger.error('Claude API 오류, Mock으로 fallback:', error);
      return this.getMockRecommendation(wardrobeItems, request);
    }
  }

  async generateStylingAdvice(items: ClothingItem[], context: string): Promise<string> {
    if (!this.apiKey) {
      return this.getMockStylingAdvice(items, context);
    }

    const itemDescriptions = items
      .map((item) => `- ${item.name} (${item.category}, ${item.colors.join('/')})`)
      .join('\n');

    try {
      const message = await this.anthropic.messages.create({
        model: 'claude-opus-4-5',
        max_tokens: 500,
        messages: [
          {
            role: 'user',
            content: `As a professional fashion stylist, provide concise styling advice for this outfit:\n\nItems:\n${itemDescriptions}\n\nContext: ${context}\n\nGive 2-3 specific, actionable styling tips in a friendly tone.`,
          },
        ],
      });

      return message.content[0].type === 'text' ? message.content[0].text : '';
    } catch {
      return this.getMockStylingAdvice(items, context);
    }
  }

  async analyzeOutfitCompatibility(items: ClothingItem[]): Promise<{
    score: number;
    analysis: string;
    suggestions: string[];
  }> {
    if (!this.apiKey) {
      return this.getMockCompatibilityAnalysis(items);
    }

    const itemList = items
      .map(
        (item) =>
          `- ${item.name}: ${item.category}, colors: ${item.colors.join(', ')}`,
      )
      .join('\n');

    try {
      const message = await this.anthropic.messages.create({
        model: 'claude-opus-4-5',
        max_tokens: 600,
        messages: [
          {
            role: 'user',
            content: `Analyze the compatibility of this outfit and respond in JSON:\n\nItems:\n${itemList}\n\nRespond with: {"score": 0-100, "analysis": "...", "suggestions": ["..."]}`,
          },
        ],
      });

      const text = message.content[0].type === 'text' ? message.content[0].text : '{}';
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      return jsonMatch
        ? JSON.parse(jsonMatch[0])
        : this.getMockCompatibilityAnalysis(items);
    } catch {
      return this.getMockCompatibilityAnalysis(items);
    }
  }

  // ─── Mock 구현체 ──────────────────────────────────────────────────────────

  private getMockRecommendation(
    wardrobeItems: ClothingItem[],
    request: OutfitRecommendationRequest,
  ): AiOutfitRecommendation {
    const occasion = request.occasion ?? 'casual';
    const temp = request.weatherData?.temperature ?? 18;

    // 카테고리별로 분류
    const tops = wardrobeItems.filter(
      (i) => i.category === ClothingCategory.TOP || i.category === ClothingCategory.DRESS,
    );
    const bottoms = wardrobeItems.filter((i) => i.category === ClothingCategory.BOTTOM);
    const outerwear = wardrobeItems.filter((i) => i.category === ClothingCategory.OUTERWEAR);
    const shoes = wardrobeItems.filter((i) => i.category === ClothingCategory.SHOES);
    const accessories = wardrobeItems.filter(
      (i) =>
        i.category === ClothingCategory.ACCESSORY || i.category === ClothingCategory.BAG,
    );

    // occasion에 맞는 아이템 우선 선택
    const preferByOccasion = <T extends ClothingItem>(items: T[]): T[] => {
      const filtered = items.filter((i) => i.occasions?.includes(occasion as any));
      return filtered.length ? filtered : items;
    };

    const selected: ClothingItem[] = [];
    const roles: Record<string, 'primary' | 'layering' | 'accessory'> = {};

    const top = preferByOccasion(tops)[0];
    if (top) {
      selected.push(top);
      roles[top.id] = 'primary';
    }

    if (top?.category !== ClothingCategory.DRESS) {
      const bottom = preferByOccasion(bottoms)[0];
      if (bottom) {
        selected.push(bottom);
        roles[bottom.id] = 'primary';
      }
    }

    // 기온 15°C 미만이면 아우터 추가
    if (temp < 15 && outerwear.length) {
      const outer = preferByOccasion(outerwear)[0];
      if (outer) {
        selected.push(outer);
        roles[outer.id] = 'layering';
      }
    }

    const shoe = preferByOccasion(shoes)[0];
    if (shoe) {
      selected.push(shoe);
      roles[shoe.id] = 'accessory';
    }

    const acc = accessories[0];
    if (acc) {
      selected.push(acc);
      roles[acc.id] = 'accessory';
    }

    const occasionLabels: Record<string, string> = {
      work: '출근',
      casual: '캐주얼 외출',
      date: '데이트',
      formal: '공식 행사',
      sport: '운동',
      party: '파티',
      outdoor: '야외 활동',
    };
    const label = occasionLabels[occasion] ?? occasion;
    const weatherNote =
      temp < 10
        ? '추운 날씨에 맞게 보온성 있는 레이어링을 적용했습니다.'
        : temp < 18
          ? '선선한 날씨에 적합한 가벼운 레이어링 구성입니다.'
          : '따뜻한 날씨에 어울리는 가볍고 산뜻한 코디입니다.';

    return {
      selectedItemIds: selected.map((i) => i.id),
      roles,
      explanation: `${label}을 위한 코디를 추천드립니다. ${weatherNote} 현재 기온 ${temp}°C를 고려하여 착용감과 스타일을 모두 잡은 조합입니다.`,
      confidenceScore: 78,
      stylingTips: [
        '상의를 하의에 살짝 넣어 입으면 더 깔끔한 실루엣이 연출됩니다.',
        '신발 색상을 가방과 맞추면 코디가 더욱 완성도 있어 보입니다.',
        temp < 15
          ? '아우터를 반만 걸쳐 입어 캐주얼한 무드를 연출해 보세요.'
          : '가벼운 액세서리로 포인트를 줘보세요.',
      ],
      colorPalette: ['#1a1a1a', '#f5f0eb', '#8b7355'],
    };
  }

  private getMockStylingAdvice(items: ClothingItem[], context: string): string {
    return `[Mock] ${context} 상황에 맞는 스타일링 팁:\n1. 전체적인 톤을 맞춰 색상 조화를 이루세요.\n2. 핏에 집중하여 비율을 맞추세요.\n3. 포인트 아이템 하나로 스타일에 개성을 더해보세요.`;
  }

  private getMockCompatibilityAnalysis(items: ClothingItem[]): {
    score: number;
    analysis: string;
    suggestions: string[];
  } {
    return {
      score: 82,
      analysis: '[Mock] 선택한 아이템들은 색상과 스타일 면에서 잘 어울리는 조합입니다.',
      suggestions: [
        '신발 색상을 메인 아이템과 맞추면 더욱 완성도 높은 코디가 됩니다.',
        '액세서리를 추가하면 스타일이 더 풍부해집니다.',
        '계절감 있는 소재를 선택하면 착용감이 향상됩니다.',
      ],
    };
  }

  // ─── 실제 API용 헬퍼 ─────────────────────────────────────────────────────

  private buildSystemPrompt(): string {
    return `You are MoodFit's AI fashion stylist. Recommend outfits matching mood, occasion, and weather. Respond in valid JSON only.`;
  }

  private buildUserPrompt(
    items: ClothingItem[],
    request: OutfitRecommendationRequest,
    userPreferences?: { stylePreferences?: string[]; bodyType?: string },
  ): string {
    const itemsJson = items.map((item) => ({
      id: item.id,
      name: item.name,
      category: item.category,
      colors: item.colors,
      seasons: item.seasons,
      occasions: item.occasions,
      wearCount: item.wearCount,
    }));

    const weatherInfo = request.weatherData
      ? `${request.weatherData.temperature}°C, ${request.weatherData.condition}, 습도 ${request.weatherData.humidity}%`
      : '정보 없음';

    return `Create an outfit recommendation.

CONTEXT:
- Occasion: ${request.occasion}
- Mood: ${request.mood || '미지정'}
- Weather: ${weatherInfo}
- Notes: ${request.notes || 'none'}
${userPreferences?.stylePreferences?.length ? `- Style preferences: ${userPreferences.stylePreferences.join(', ')}` : ''}

WARDROBE ITEMS:
${JSON.stringify(itemsJson, null, 2)}

Respond with exactly:
{
  "selectedItemIds": ["id1", "id2"],
  "roles": {"id1": "primary", "id2": "accessory"},
  "explanation": "2-3 sentences",
  "confidenceScore": 0-100,
  "stylingTips": ["tip1", "tip2", "tip3"],
  "colorPalette": ["#hex1", "#hex2", "#hex3"]
}`;
  }

  private parseRecommendationResponse(
    responseText: string,
    availableItems: ClothingItem[],
  ): ParsedRecommendation {
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON found');

      const parsed = JSON.parse(jsonMatch[0]);
      const availableIds = new Set(availableItems.map((i) => i.id));
      const validIds = (parsed.selectedItemIds as string[]).filter((id) =>
        availableIds.has(id),
      );

      return {
        selectedItemIds: validIds,
        roles: parsed.roles || {},
        explanation: parsed.explanation || 'AI가 선택한 코디입니다.',
        confidenceScore: Math.min(100, Math.max(0, parsed.confidenceScore || 75)),
        stylingTips: Array.isArray(parsed.stylingTips) ? parsed.stylingTips.slice(0, 5) : [],
        colorPalette: Array.isArray(parsed.colorPalette)
          ? parsed.colorPalette.slice(0, 5)
          : ['#000000', '#ffffff'],
      };
    } catch (error) {
      this.logger.warn('AI 응답 파싱 실패, fallback 사용');
      return this.getMockRecommendation(availableItems, {} as any);
    }
  }
}
