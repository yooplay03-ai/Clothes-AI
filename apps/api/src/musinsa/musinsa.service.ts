import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MusinsaItemEntity } from './entities/musinsa-item.entity';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class MusinsaService {
  constructor(
    @InjectRepository(MusinsaItemEntity)
    private readonly itemRepo: Repository<MusinsaItemEntity>,
  ) {}

  async findAll(options: {
    page?: number;
    limit?: number;
    category?: string;
  } = {}) {
    const { page = 1, limit = 24, category } = options;

    const qb = this.itemRepo.createQueryBuilder('item');

    if (category) {
      qb.where('item.category = :category', { category });
    }

    qb.orderBy('item.createdAt', 'DESC');

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

  async findById(id: string): Promise<MusinsaItemEntity> {
    const item = await this.itemRepo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Musinsa item not found');
    return item;
  }

  async findByCategory(category: string): Promise<MusinsaItemEntity[]> {
    return this.itemRepo.find({ where: { category } });
  }

  /**
   * scripts/data/metadata.json 에서 크롤링 결과를 DB에 임포트합니다.
   * POST /musinsa/import 에서 호출됩니다.
   */
  async importFromMetadata(metadataPath?: string): Promise<{ imported: number; skipped: number }> {
    const filePath = metadataPath
      ? path.resolve(metadataPath)
      : path.resolve(process.cwd(), '../../scripts/data/metadata.json');

    if (!fs.existsSync(filePath)) {
      throw new NotFoundException(`metadata.json not found at: ${filePath}`);
    }

    const raw = fs.readFileSync(filePath, 'utf-8');
    const metadata = JSON.parse(raw);

    let imported = 0;
    let skipped = 0;

    for (const [category, catData] of Object.entries<any>(metadata.categories)) {
      for (const item of catData.items ?? []) {
        if (!item.id || !item.image_url) {
          skipped++;
          continue;
        }

        const existing = await this.itemRepo.findOne({ where: { musinsaId: item.id } });
        if (existing) {
          skipped++;
          continue;
        }

        await this.itemRepo.save(
          this.itemRepo.create({
            musinsaId: item.id,
            name: item.name ?? 'Unknown',
            brand: item.brand ?? null,
            price: item.price ?? 0,
            imageUrl: item.image_url,
            localPath: item.local_path ?? null,
            category,
          }),
        );
        imported++;
      }
    }

    return { imported, skipped };
  }
}
