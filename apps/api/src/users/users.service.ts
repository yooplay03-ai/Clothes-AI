import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { UserEntity } from './entities/user.entity';
import { CreateUserDto, UpdateUserDto } from '@moodfit/shared';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
  ) {}

  async create(dto: CreateUserDto): Promise<UserEntity> {
    const existing = await this.userRepo.findOne({
      where: [{ email: dto.email }, { username: dto.username }],
    });

    if (existing) {
      if (existing.email === dto.email) {
        throw new ConflictException('Email already in use');
      }
      throw new ConflictException('Username already taken');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 12);

    const user = this.userRepo.create({
      email: dto.email.toLowerCase().trim(),
      username: dto.username.toLowerCase().trim(),
      password: hashedPassword,
      displayName: dto.displayName || dto.username,
    });

    return this.userRepo.save(user);
  }

  async findById(id: string): Promise<UserEntity> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    return this.userRepo
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.email = :email', { email: email.toLowerCase() })
      .getOne();
  }

  async findByUsername(username: string): Promise<UserEntity> {
    const user = await this.userRepo.findOne({
      where: { username: username.toLowerCase() },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async update(id: string, dto: UpdateUserDto): Promise<UserEntity> {
    const user = await this.findById(id);
    Object.assign(user, dto);
    return this.userRepo.save(user);
  }

  async updateRefreshToken(id: string, refreshToken: string | null): Promise<void> {
    const hashed = refreshToken ? await bcrypt.hash(refreshToken, 10) : undefined;
    await this.userRepo.update(id, { refreshToken: hashed });
  }

  async validateRefreshToken(id: string, refreshToken: string): Promise<boolean> {
    const user = await this.userRepo
      .createQueryBuilder('user')
      .addSelect('user.refreshToken')
      .where('user.id = :id', { id })
      .getOne();

    if (!user?.refreshToken) return false;
    return bcrypt.compare(refreshToken, user.refreshToken);
  }

  async follow(followerId: string, targetId: string): Promise<void> {
    if (followerId === targetId) return;

    const [follower, target] = await Promise.all([
      this.userRepo.findOne({ where: { id: followerId }, relations: ['following'] }),
      this.findById(targetId),
    ]);

    if (!follower) throw new NotFoundException('User not found');

    const alreadyFollowing = follower.following.some((u) => u.id === targetId);
    if (alreadyFollowing) return;

    follower.following.push(target);
    follower.followingCount += 1;
    target.followersCount += 1;

    await this.userRepo.save([follower, target]);
  }

  async unfollow(followerId: string, targetId: string): Promise<void> {
    const follower = await this.userRepo.findOne({
      where: { id: followerId },
      relations: ['following'],
    });

    if (!follower) throw new NotFoundException('User not found');

    const target = await this.findById(targetId);
    follower.following = follower.following.filter((u) => u.id !== targetId);
    follower.followingCount = Math.max(0, follower.followingCount - 1);
    target.followersCount = Math.max(0, target.followersCount - 1);

    await this.userRepo.save([follower, target]);
  }

  toPublicProfile(user: UserEntity) {
    const { password, refreshToken, ...profile } = user as any;
    return profile;
  }
}
