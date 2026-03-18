import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import * as fs from 'fs';
import * as path from 'path';
import { UserEntity } from '../users/entities/user.entity';
import { ClothingItemEntity, ClothingCategory, ClothingColor, ClothingSeason, ClothingOccasion } from '../wardrobe/entities/clothing-item.entity';

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    @InjectRepository(ClothingItemEntity)
    private readonly itemRepo: Repository<ClothingItemEntity>,
  ) {}

  async onApplicationBootstrap() {
    const seedEnabled = this.configService.get('SEED_DATA', 'false') === 'true';
    if (!seedEnabled) return;

    this.logger.log('테스트 시드 데이터 생성 중...');
    await this.seed();
    this.logger.log('시드 완료!');
  }

  async seed() {
    const user = await this.seedTestUser();
    await this.seedWardrobe(user.id);
    await this.updateImagesFromUploads(user.id);
  }

  private async seedTestUser(): Promise<UserEntity> {
    const email = 'test@moodfit.com';
    const existing = await this.userRepo
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.email = :email', { email })
      .getOne();

    if (existing) {
      this.logger.log(`테스트 유저 이미 존재: ${email}`);
      return existing;
    }

    const user = this.userRepo.create({
      email,
      username: 'testuser',
      password: await bcrypt.hash('test1234', 10),
      displayName: '테스트 유저',
      location: '서울',
      isPublic: true,
    });

    const saved = await this.userRepo.save(user);
    this.logger.log(`테스트 유저 생성: ${email} / test1234`);
    return saved;
  }

  private async seedWardrobe(userId: string) {
    const count = await this.itemRepo.count({ where: { userId } });
    if (count > 0) {
      this.logger.log(`옷장 데이터 이미 존재 (${count}개)`);
      return;
    }

    const items: Partial<ClothingItemEntity>[] = [
      // ── 상의 ──────────────────────────────────────────────────────
      {
        userId, name: '화이트 셔츠', brand: 'Uniqlo',
        category: ClothingCategory.TOP,
        colors: [ClothingColor.WHITE],
        seasons: [ClothingSeason.SPRING, ClothingSeason.SUMMER, ClothingSeason.AUTUMN],
        occasions: [ClothingOccasion.WORK, ClothingOccasion.CASUAL, ClothingOccasion.DATE],
        material: '면 100%', size: 'M', tags: ['베이직', '셔츠'], wearCount: 12,
        imageUrl: '/uploads/clothing/top_5990312.jpg',
      },
      {
        userId, name: '블랙 티셔츠', brand: '무지',
        category: ClothingCategory.TOP,
        colors: [ClothingColor.BLACK],
        seasons: [ClothingSeason.ALL_SEASON],
        occasions: [ClothingOccasion.CASUAL, ClothingOccasion.SPORT],
        material: '면 100%', size: 'M', tags: ['베이직', '반팔'], wearCount: 20,
        imageUrl: '/uploads/clothing/top_6069409.jpg',
      },
      {
        userId, name: '스트라이프 블라우스', brand: 'Zara',
        category: ClothingCategory.TOP,
        colors: [ClothingColor.WHITE, ClothingColor.NAVY],
        seasons: [ClothingSeason.SPRING, ClothingSeason.SUMMER],
        occasions: [ClothingOccasion.WORK, ClothingOccasion.CASUAL, ClothingOccasion.DATE],
        material: '폴리 혼방', size: 'S', tags: ['스트라이프', '블라우스'], wearCount: 8,
        imageUrl: '/uploads/clothing/top_6015673.jpg',
      },
      {
        userId, name: '크림 니트 스웨터', brand: 'H&M',
        category: ClothingCategory.TOP,
        colors: [ClothingColor.BEIGE],
        seasons: [ClothingSeason.AUTUMN, ClothingSeason.WINTER],
        occasions: [ClothingOccasion.CASUAL, ClothingOccasion.DATE],
        material: '울 혼방', size: 'M', tags: ['니트', '따뜻함'], wearCount: 6,
        imageUrl: '/uploads/clothing/top_5861714.jpg',
      },
      {
        userId, name: '그레이 후드 집업', brand: '나이키',
        category: ClothingCategory.TOP,
        colors: [ClothingColor.GRAY],
        seasons: [ClothingSeason.SPRING, ClothingSeason.AUTUMN],
        occasions: [ClothingOccasion.CASUAL, ClothingOccasion.SPORT],
        material: '면 폴리 혼방', size: 'L', tags: ['후드', '스포티'], wearCount: 15,
        imageUrl: '/uploads/clothing/top_5453617.jpg',
      },

      // ── 하의 ──────────────────────────────────────────────────────
      {
        userId, name: '블랙 슬랙스', brand: 'Zara',
        category: ClothingCategory.BOTTOM,
        colors: [ClothingColor.BLACK],
        seasons: [ClothingSeason.ALL_SEASON],
        occasions: [ClothingOccasion.WORK, ClothingOccasion.FORMAL, ClothingOccasion.DATE],
        material: '폴리 혼방', size: '28', tags: ['슬랙스', '포멀'], wearCount: 18,
        imageUrl: '/uploads/clothing/bottom_5746361.jpg',
      },
      {
        userId, name: '인디고 청바지', brand: 'Levi\'s',
        category: ClothingCategory.BOTTOM,
        colors: [ClothingColor.BLUE],
        seasons: [ClothingSeason.ALL_SEASON],
        occasions: [ClothingOccasion.CASUAL, ClothingOccasion.DATE],
        material: '데님', size: '28', tags: ['청바지', '캐주얼'], wearCount: 25,
        imageUrl: '/uploads/clothing/bottom_5960038.jpg',
      },
      {
        userId, name: '베이지 치노 팬츠', brand: 'Uniqlo',
        category: ClothingCategory.BOTTOM,
        colors: [ClothingColor.BEIGE],
        seasons: [ClothingSeason.SPRING, ClothingSeason.SUMMER, ClothingSeason.AUTUMN],
        occasions: [ClothingOccasion.CASUAL, ClothingOccasion.WORK, ClothingOccasion.DATE],
        material: '면 혼방', size: '28', tags: ['치노', '베이직'], wearCount: 10,
        imageUrl: '/uploads/clothing/bottom_5864297.jpg',
      },
      {
        userId, name: '블랙 미니 스커트', brand: 'H&M',
        category: ClothingCategory.BOTTOM,
        colors: [ClothingColor.BLACK],
        seasons: [ClothingSeason.SPRING, ClothingSeason.SUMMER],
        occasions: [ClothingOccasion.CASUAL, ClothingOccasion.DATE, ClothingOccasion.PARTY],
        material: '폴리', size: 'S', tags: ['스커트', '미니'], wearCount: 5,
        imageUrl: '/uploads/clothing/bottom_5825929.jpg',
      },
      {
        userId, name: '네이비 와이드 팬츠', brand: 'Cos',
        category: ClothingCategory.BOTTOM,
        colors: [ClothingColor.NAVY],
        seasons: [ClothingSeason.SPRING, ClothingSeason.AUTUMN],
        occasions: [ClothingOccasion.CASUAL, ClothingOccasion.WORK],
        material: '린넨 혼방', size: 'M', tags: ['와이드', '편안함'], wearCount: 7,
        imageUrl: '/uploads/clothing/bottom_5773115.jpg',
      },

      // ── 아우터 ─────────────────────────────────────────────────────
      {
        userId, name: '베이지 트렌치코트', brand: 'Burberry 레플리카',
        category: ClothingCategory.OUTERWEAR,
        colors: [ClothingColor.BEIGE],
        seasons: [ClothingSeason.SPRING, ClothingSeason.AUTUMN],
        occasions: [ClothingOccasion.WORK, ClothingOccasion.FORMAL, ClothingOccasion.DATE],
        material: '면 혼방', size: 'M', tags: ['트렌치', '클래식'], wearCount: 9,
        imageUrl: '/uploads/clothing/outer_5215532.jpg',
      },
      {
        userId, name: '블랙 패딩 점퍼', brand: '노스페이스',
        category: ClothingCategory.OUTERWEAR,
        colors: [ClothingColor.BLACK],
        seasons: [ClothingSeason.WINTER],
        occasions: [ClothingOccasion.CASUAL, ClothingOccasion.OUTDOOR],
        material: '나일론/다운', size: 'M', tags: ['패딩', '보온'], wearCount: 30,
        imageUrl: '/uploads/clothing/outer_5309552.jpg',
      },
      {
        userId, name: '그레이 울 코트', brand: 'Mango',
        category: ClothingCategory.OUTERWEAR,
        colors: [ClothingColor.GRAY],
        seasons: [ClothingSeason.AUTUMN, ClothingSeason.WINTER],
        occasions: [ClothingOccasion.WORK, ClothingOccasion.FORMAL, ClothingOccasion.DATE],
        material: '울 혼방', size: 'M', tags: ['코트', '포멀'], wearCount: 11,
        imageUrl: '/uploads/clothing/outer_5316905.jpg',
      },

      // ── 신발 ──────────────────────────────────────────────────────
      {
        userId, name: '화이트 스니커즈', brand: '아디다스 스탠스미스',
        category: ClothingCategory.SHOES,
        colors: [ClothingColor.WHITE],
        seasons: [ClothingSeason.SPRING, ClothingSeason.SUMMER, ClothingSeason.AUTUMN],
        occasions: [ClothingOccasion.CASUAL, ClothingOccasion.DATE],
        size: '250', tags: ['스니커즈', '캐주얼'], wearCount: 40,
        imageUrl: '/uploads/clothing/shoes_5858881.jpg',
      },
      {
        userId, name: '블랙 로퍼', brand: 'Vagabond',
        category: ClothingCategory.SHOES,
        colors: [ClothingColor.BLACK],
        seasons: [ClothingSeason.ALL_SEASON],
        occasions: [ClothingOccasion.WORK, ClothingOccasion.FORMAL, ClothingOccasion.DATE],
        size: '250', tags: ['로퍼', '포멀', '편안함'], wearCount: 22,
        imageUrl: '/uploads/clothing/shoes_5987818.jpg',
      },
      {
        userId, name: '런닝화', brand: '뉴발란스',
        category: ClothingCategory.SHOES,
        colors: [ClothingColor.GRAY, ClothingColor.WHITE],
        seasons: [ClothingSeason.ALL_SEASON],
        occasions: [ClothingOccasion.SPORT, ClothingOccasion.CASUAL],
        size: '250', tags: ['운동화', '스포티'], wearCount: 35,
        imageUrl: '/uploads/clothing/shoes_5892458.jpg',
      },

      // ── 액세서리/가방 ───────────────────────────────────────────────
      {
        userId, name: '블랙 숄더백', brand: 'COS',
        category: ClothingCategory.BAG,
        colors: [ClothingColor.BLACK],
        seasons: [ClothingSeason.ALL_SEASON],
        occasions: [ClothingOccasion.WORK, ClothingOccasion.CASUAL, ClothingOccasion.DATE],
        material: '가죽', tags: ['가방', '데일리'], wearCount: 28,
        imageUrl: '/uploads/clothing/bag_5629243.jpg',
      },
      {
        userId, name: '베이지 크로스백', brand: '찰스앤키스',
        category: ClothingCategory.BAG,
        colors: [ClothingColor.BEIGE],
        seasons: [ClothingSeason.SPRING, ClothingSeason.SUMMER, ClothingSeason.AUTUMN],
        occasions: [ClothingOccasion.CASUAL, ClothingOccasion.DATE],
        material: '인조 가죽', tags: ['크로스백', '미니'], wearCount: 12,
        imageUrl: '/uploads/clothing/bag_5873825.jpg',
      },
      {
        userId, name: '실버 귀걸이 세트', brand: '스타일난다',
        category: ClothingCategory.ACCESSORY,
        colors: [ClothingColor.GRAY],
        seasons: [ClothingSeason.ALL_SEASON],
        occasions: [ClothingOccasion.CASUAL, ClothingOccasion.DATE, ClothingOccasion.PARTY],
        tags: ['귀걸이', '실버', '미니멀'], wearCount: 20,
      },
      {
        userId, name: '네이비 울 머플러', brand: 'Uniqlo',
        category: ClothingCategory.ACCESSORY,
        colors: [ClothingColor.NAVY],
        seasons: [ClothingSeason.AUTUMN, ClothingSeason.WINTER],
        occasions: [ClothingOccasion.CASUAL, ClothingOccasion.WORK],
        material: '울 혼방', tags: ['머플러', '보온'], wearCount: 8,
      },
    ];

    await this.itemRepo.save(items.map((i) => this.itemRepo.create(i)));
    this.logger.log(`의류 ${items.length}개 시드 완료`);
  }

  // 크롤링된 이미지를 기존 시드 아이템에 연결
  private async updateImagesFromUploads(userId: string) {
    const uploadsDir = path.join(process.cwd(), 'uploads', 'clothing');
    if (!fs.existsSync(uploadsDir)) return;

    const files = fs.readdirSync(uploadsDir).filter((f) => f.endsWith('.jpg') || f.endsWith('.png'));
    if (files.length === 0) return;

    // 카테고리별 이미지 파일 분류
    const byCategory: Record<string, string[]> = {};
    for (const file of files) {
      const cat = file.split('_')[0]; // "top_12345.jpg" → "top"
      if (!byCategory[cat]) byCategory[cat] = [];
      byCategory[cat].push(`/uploads/clothing/${file}`);
    }

    const categoryMap: Record<string, ClothingCategory> = {
      top: ClothingCategory.TOP,
      bottom: ClothingCategory.BOTTOM,
      outer: ClothingCategory.OUTERWEAR,
      shoes: ClothingCategory.SHOES,
      bag: ClothingCategory.BAG,
      accessory: ClothingCategory.ACCESSORY,
    };

    let updated = 0;
    for (const [catKey, imagePaths] of Object.entries(byCategory)) {
      const nestCat = categoryMap[catKey];
      if (!nestCat) continue;

      // imageUrl이 없는 해당 카테고리 아이템 조회
      const items = await this.itemRepo.find({
        where: { userId, category: nestCat },
      });
      const itemsWithoutImage = items.filter((i) => !i.imageUrl);

      for (let idx = 0; idx < itemsWithoutImage.length && idx < imagePaths.length; idx++) {
        itemsWithoutImage[idx].imageUrl = imagePaths[idx];
        await this.itemRepo.save(itemsWithoutImage[idx]);
        updated++;
      }
    }

    if (updated > 0) {
      this.logger.log(`크롤링 이미지 ${updated}개 시드 아이템에 연결 완료`);
    }
  }
}
