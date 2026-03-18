import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('musinsa_items')
@Index(['musinsaId'], { unique: true })
@Index(['category'])
export class MusinsaItemEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'musinsa_id' })
  musinsaId: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  brand: string;

  @Column({ type: 'real', default: 0 })
  price: number;

  @Column({ name: 'image_url', nullable: true })
  imageUrl: string;

  @Column({ name: 'local_path', nullable: true })
  localPath: string;

  @Column()
  category: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
