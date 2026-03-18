import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';

export enum ClothingCategory {
  TOP = 'top',
  BOTTOM = 'bottom',
  DRESS = 'dress',
  OUTERWEAR = 'outerwear',
  SHOES = 'shoes',
  ACCESSORY = 'accessory',
  BAG = 'bag',
  UNDERWEAR = 'underwear',
  ACTIVEWEAR = 'activewear',
}

export enum ClothingColor {
  BLACK = 'black',
  WHITE = 'white',
  GRAY = 'gray',
  RED = 'red',
  ORANGE = 'orange',
  YELLOW = 'yellow',
  GREEN = 'green',
  BLUE = 'blue',
  PURPLE = 'purple',
  PINK = 'pink',
  BROWN = 'brown',
  BEIGE = 'beige',
  NAVY = 'navy',
  MULTICOLOR = 'multicolor',
}

export enum ClothingSeason {
  SPRING = 'spring',
  SUMMER = 'summer',
  AUTUMN = 'autumn',
  WINTER = 'winter',
  ALL_SEASON = 'all_season',
}

export enum ClothingOccasion {
  CASUAL = 'casual',
  WORK = 'work',
  FORMAL = 'formal',
  SPORT = 'sport',
  OUTDOOR = 'outdoor',
  PARTY = 'party',
  DATE = 'date',
}

@Entity('clothing_items')
@Index(['userId', 'category'])
@Index(['userId', 'isArchived'])
export class ClothingItemEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => UserEntity, (user) => user.clothingItems, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Column()
  name: string;

  @Column({ nullable: true })
  brand: string;

  @Column({ type: 'simple-enum', enum: ClothingCategory })
  category: ClothingCategory;

  @Column({ type: 'simple-array', default: '' })
  colors: ClothingColor[];

  @Column({ name: 'seasons', type: 'simple-array', default: '' })
  seasons: ClothingSeason[];

  @Column({ name: 'occasions', type: 'simple-array', default: '' })
  occasions: ClothingOccasion[];

  @Column({ name: 'image_url', nullable: true })
  imageUrl: string;

  @Column({ name: 'thumbnail_url', nullable: true })
  thumbnailUrl: string;

  @Column({ nullable: true })
  material: string;

  @Column({ nullable: true })
  size: string;

  @Column({ name: 'purchase_price', type: 'real', nullable: true })
  purchasePrice: number;

  @Column({ name: 'purchase_date', nullable: true })
  purchaseDate: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'simple-array', default: '' })
  tags: string[];

  @Column({ name: 'wear_count', default: 0 })
  wearCount: number;

  @Column({ name: 'last_worn_at', type: 'datetime', nullable: true })
  lastWornAt: Date;

  @Column({ name: 'is_favorite', default: false })
  isFavorite: boolean;

  @Column({ name: 'is_archived', default: false })
  isArchived: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
