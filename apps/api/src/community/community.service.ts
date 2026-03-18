import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { OutfitPost, OutfitComment } from '@moodfit/shared';

@Injectable()
export class CommunityService {
  // In-memory store for demo; replace with TypeORM entities in production
  private posts: (OutfitPost & { userId: string })[] = this.getSeedPosts();
  private comments: (OutfitComment & { userId: string })[] = [];
  private likes: Set<string> = new Set(); // "postId:userId"
  private bookmarks: Set<string> = new Set(); // "postId:userId"

  async getFeed(
    userId: string | null,
    filter: 'trending' | 'following' | 'recent' = 'trending',
    page = 1,
    limit = 20,
  ) {
    let sorted = [...this.posts].filter((p) => (p as any).isPublic !== false);

    switch (filter) {
      case 'recent':
        sorted.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
        break;
      case 'trending':
        sorted.sort((a, b) => b.likesCount - a.likesCount);
        break;
      case 'following':
        // Would filter by followed users; return all for now
        sorted.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
        break;
    }

    const total = sorted.length;
    const data = sorted.slice((page - 1) * limit, page * limit).map((post) => ({
      ...post,
      isLiked: userId ? this.likes.has(`${post.id}:${userId}`) : false,
      isBookmarked: userId ? this.bookmarks.has(`${post.id}:${userId}`) : false,
    }));

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getPost(id: string, userId?: string): Promise<OutfitPost> {
    const post = this.posts.find((p) => p.id === id);
    if (!post) throw new NotFoundException('Post not found');

    return {
      ...post,
      isLiked: userId ? this.likes.has(`${id}:${userId}`) : false,
      isBookmarked: userId ? this.bookmarks.has(`${id}:${userId}`) : false,
    };
  }

  async createPost(userId: string, userProfile: any, data: Partial<OutfitPost>): Promise<OutfitPost> {
    const now = new Date().toISOString();
    const post: OutfitPost & { userId: string } = {
      id: crypto.randomUUID(),
      userId,
      userProfile,
      items: data.items || [],
      caption: data.caption,
      occasion: data.occasion!,
      mood: data.mood,
      tags: data.tags || [],
      likesCount: 0,
      commentsCount: 0,
      isLiked: false,
      isBookmarked: false,
      weatherInfo: data.weatherInfo,
      wornDate: data.wornDate || now,
      createdAt: now,
      updatedAt: now,
    };

    this.posts.unshift(post);
    return post;
  }

  async likePost(postId: string, userId: string): Promise<void> {
    const post = this.posts.find((p) => p.id === postId);
    if (!post) throw new NotFoundException('Post not found');

    const key = `${postId}:${userId}`;
    if (!this.likes.has(key)) {
      this.likes.add(key);
      post.likesCount += 1;
    }
  }

  async unlikePost(postId: string, userId: string): Promise<void> {
    const post = this.posts.find((p) => p.id === postId);
    if (!post) throw new NotFoundException('Post not found');

    const key = `${postId}:${userId}`;
    if (this.likes.has(key)) {
      this.likes.delete(key);
      post.likesCount = Math.max(0, post.likesCount - 1);
    }
  }

  async bookmarkPost(postId: string, userId: string): Promise<void> {
    const post = this.posts.find((p) => p.id === postId);
    if (!post) throw new NotFoundException('Post not found');
    this.bookmarks.add(`${postId}:${userId}`);
  }

  async unbookmarkPost(postId: string, userId: string): Promise<void> {
    this.bookmarks.delete(`${postId}:${userId}`);
  }

  async getComments(postId: string, page = 1, limit = 20) {
    const postComments = this.comments
      .filter((c) => c.postId === postId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const total = postComments.length;
    const data = postComments.slice((page - 1) * limit, page * limit);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async addComment(
    postId: string,
    userId: string,
    userProfile: any,
    content: string,
  ): Promise<OutfitComment> {
    const post = this.posts.find((p) => p.id === postId);
    if (!post) throw new NotFoundException('Post not found');

    const now = new Date().toISOString();
    const comment: OutfitComment & { userId: string } = {
      id: crypto.randomUUID(),
      postId,
      userId,
      userProfile,
      content,
      likesCount: 0,
      isLiked: false,
      createdAt: now,
      updatedAt: now,
    };

    this.comments.unshift(comment);
    post.commentsCount += 1;
    return comment;
  }

  async deleteComment(commentId: string, userId: string): Promise<void> {
    const idx = this.comments.findIndex((c) => c.id === commentId);
    if (idx === -1) throw new NotFoundException('Comment not found');
    if (this.comments[idx].userId !== userId) throw new ForbiddenException();

    const { postId } = this.comments[idx];
    this.comments.splice(idx, 1);

    const post = this.posts.find((p) => p.id === postId);
    if (post) post.commentsCount = Math.max(0, post.commentsCount - 1);
  }

  private getSeedPosts(): (OutfitPost & { userId: string })[] {
    const now = new Date();
    return [
      {
        id: 'seed-1',
        userId: 'seed-user-1',
        userProfile: {
          username: 'fashionista_nyc',
          displayName: 'Fashion NYC',
          avatarUrl: undefined,
        },
        items: [],
        occasion: 'casual' as any,
        mood: 'confident' as any,
        tags: ['ootd', 'minimalist', 'casual'],
        caption: 'Monday motivation outfit 🤍 Keeping it clean and minimal today.',
        likesCount: 234,
        commentsCount: 18,
        isLiked: false,
        isBookmarked: false,
        weatherInfo: { temperature: 22, condition: 'sunny' as any, location: '서울, KR' },
        wornDate: new Date(now.getTime() - 86400000).toISOString(),
        createdAt: new Date(now.getTime() - 3600000 * 5).toISOString(),
        updatedAt: new Date(now.getTime() - 3600000 * 5).toISOString(),
      },
      {
        id: 'seed-2',
        userId: 'seed-user-2',
        userProfile: {
          username: 'stylebyemma',
          displayName: 'Emma Style',
          avatarUrl: undefined,
        },
        items: [],
        occasion: 'work' as any,
        mood: 'professional' as any,
        tags: ['workwear', 'officestyle', 'blazer'],
        caption: 'Power dressing for the boardroom. Never underestimate the power of a great blazer! 💼',
        likesCount: 187,
        commentsCount: 24,
        isLiked: false,
        isBookmarked: false,
        wornDate: now.toISOString(),
        createdAt: new Date(now.getTime() - 3600000 * 10).toISOString(),
        updatedAt: new Date(now.getTime() - 3600000 * 10).toISOString(),
      },
      {
        id: 'seed-3',
        userId: 'seed-user-3',
        userProfile: {
          username: 'streetstyle_la',
          displayName: 'Street Style LA',
          avatarUrl: undefined,
        },
        items: [],
        occasion: 'casual' as any,
        mood: 'energetic' as any,
        tags: ['streetwear', 'sneakers', 'urban'],
        caption: 'Weekend vibes in LA ☀️ Nothing like fresh kicks and good vibes.',
        likesCount: 412,
        commentsCount: 56,
        isLiked: false,
        isBookmarked: false,
        weatherInfo: { temperature: 28, condition: 'sunny' as any, location: 'Los Angeles, US' },
        wornDate: new Date(now.getTime() - 172800000).toISOString(),
        createdAt: new Date(now.getTime() - 3600000 * 20).toISOString(),
        updatedAt: new Date(now.getTime() - 3600000 * 20).toISOString(),
      },
    ];
  }
}
