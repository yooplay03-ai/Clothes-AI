import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
  Index,
} from 'typeorm';
import { ClothingItemEntity } from '../../wardrobe/entities/clothing-item.entity';

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

export enum StylePreference {
  CASUAL = 'casual',
  FORMAL = 'formal',
  SPORTY = 'sporty',
  BOHEMIAN = 'bohemian',
  MINIMALIST = 'minimalist',
  STREETWEAR = 'streetwear',
  VINTAGE = 'vintage',
  PREPPY = 'preppy',
}

export enum BodyType {
  SLIM = 'slim',
  ATHLETIC = 'athletic',
  AVERAGE = 'average',
  CURVY = 'curvy',
  PLUS = 'plus',
}

@Entity('users')
@Index(['email'], { unique: true })
@Index(['username'], { unique: true })
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true, length: 30 })
  username: string;

  @Column({ select: false })
  password: string;

  @Column({ name: 'display_name', nullable: true })
  displayName: string;

  @Column({ name: 'avatar_url', nullable: true })
  avatarUrl: string;

  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column({
    type: 'simple-enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @Column({
    name: 'style_preferences',
    type: 'simple-array',
    nullable: true,
    default: '',
  })
  stylePreferences: StylePreference[];

  @Column({
    name: 'body_type',
    type: 'simple-enum',
    enum: BodyType,
    nullable: true,
  })
  bodyType: BodyType;

  @Column({ type: 'int', nullable: true })
  height: number;

  @Column({ type: 'int', nullable: true })
  weight: number;

  @Column({ nullable: true })
  location: string;

  @Column({ name: 'is_public', default: true })
  isPublic: boolean;

  @Column({ name: 'followers_count', default: 0 })
  followersCount: number;

  @Column({ name: 'following_count', default: 0 })
  followingCount: number;

  @Column({ name: 'refresh_token', nullable: true, select: false })
  refreshToken: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @OneToMany(() => ClothingItemEntity, (item) => item.user)
  clothingItems: ClothingItemEntity[];

  @ManyToMany(() => UserEntity, (user) => user.followers)
  @JoinTable({
    name: 'user_follows',
    joinColumn: { name: 'follower_id' },
    inverseJoinColumn: { name: 'following_id' },
  })
  following: UserEntity[];

  @ManyToMany(() => UserEntity, (user) => user.following)
  followers: UserEntity[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
