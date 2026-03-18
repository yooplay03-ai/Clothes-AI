import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions, ILike } from 'typeorm';
import { ClothingItemEntity } from './entities/clothing-item.entity';
import { CreateClothingItemDto, UpdateClothingItemDto, WardrobeStats } from '@moodfit/shared';

@Injectable()
export class WardrobeService {
  constructor(
    @InjectRepository(ClothingItemEntity)
    private readonly itemRepo: Repository<ClothingItemEntity>,
  ) {}

  async findAll(
    userId: string,
    options: {
      page?: number;
      limit?: number;
      categories?: string[];
      seasons?: string[];
      occasions?: string[];
      colors?: string[];
      sortBy?: string;
      search?: string;
    } = {},
  ) {
    const {
      page = 1,
      limit = 24,
      categories,
      seasons,
      sortBy = 'newest',
    } = options;

    const qb = this.itemRepo
      .createQueryBuilder('item')
      .where('item.userId = :userId', { userId })
      .andWhere('item.isArchived = false');

    if (categories?.length) {
      qb.andWhere('item.category IN (:...categories)', { categories });
    }

    if (seasons?.length) {
      // Simple-array columns need LIKE queries
      qb.andWhere(
        seasons.map((s) => `item.seasons LIKE :season_${s}`).join(' OR '),
        Object.fromEntries(seasons.map((s) => [`season_${s}`, `%${s}%`])),
      );
    }

    // Sorting
    switch (sortBy) {
      case 'oldest':
        qb.orderBy('item.createdAt', 'ASC');
        break;
      case 'most_worn':
        qb.orderBy('item.wearCount', 'DESC');
        break;
      case 'least_worn':
        qb.orderBy('item.wearCount', 'ASC');
        break;
      case 'name':
        qb.orderBy('item.name', 'ASC');
        break;
      default: // newest
        qb.orderBy('item.createdAt', 'DESC');
    }

    const total = await qb.getCount();
    const data = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: string, userId: string): Promise<ClothingItemEntity> {
    const item = await this.itemRepo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Clothing item not found');
    if (item.userId !== userId) throw new ForbiddenException('Access denied');
    return item;
  }

  async findByIds(ids: string[], userId: string): Promise<ClothingItemEntity[]> {
    if (!ids.length) return [];
    return this.itemRepo
      .createQueryBuilder('item')
      .where('item.id IN (:...ids)', { ids })
      .andWhere('item.userId = :userId', { userId })
      .getMany();
  }

  async create(userId: string, dto: CreateClothingItemDto): Promise<ClothingItemEntity> {
    const item = this.itemRepo.create({
      userId,
      ...dto,
      colors: dto.colors || [],
      seasons: dto.seasons || [],
      occasions: dto.occasions || [],
      tags: dto.tags || [],
    });
    return this.itemRepo.save(item);
  }

  async update(
    id: string,
    userId: string,
    dto: UpdateClothingItemDto,
  ): Promise<ClothingItemEntity> {
    const item = await this.findById(id, userId);
    Object.assign(item, dto);
    return this.itemRepo.save(item);
  }

  async remove(id: string, userId: string): Promise<void> {
    const item = await this.findById(id, userId);
    await this.itemRepo.remove(item);
  }

  async incrementWearCount(id: string): Promise<void> {
    await this.itemRepo
      .createQueryBuilder()
      .update(ClothingItemEntity)
      .set({
        wearCount: () => 'wear_count + 1',
        lastWornAt: new Date(),
      })
      .where('id = :id', { id })
      .execute();
  }

  async getStats(userId: string): Promise<WardrobeStats> {
    const items = await this.itemRepo.find({
      where: { userId, isArchived: false },
      order: { wearCount: 'DESC' },
    });

    const byCategory = {} as any;
    const byColor = {} as any;
    const bySeason = {} as any;

    items.forEach((item) => {
      byCategory[item.category] = (byCategory[item.category] || 0) + 1;
      item.colors.forEach((c) => {
        byColor[c] = (byColor[c] || 0) + 1;
      });
      item.seasons.forEach((s) => {
        bySeason[s] = (bySeason[s] || 0) + 1;
      });
    });

    return {
      totalItems: items.length,
      byCategory,
      byColor,
      bySeason,
      mostWorn: items.slice(0, 5) as any,
      leastWorn: items
        .filter((i) => i.wearCount === 0)
        .slice(0, 5) as any,
      recentlyAdded: items
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, 5) as any,
    };
  }
}
