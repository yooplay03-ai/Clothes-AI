'use client';

import { useEffect, useState, useCallback } from 'react';
import { OutfitPost, ClothingOccasion, OutfitMood } from '@moodfit/shared';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import Link from 'next/link';

function PostCard({ post, onLike }: { post: OutfitPost; onLike: (id: string) => void }) {
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState('');

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <Card className="overflow-hidden">
      {/* Post header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
            {post.userProfile?.displayName?.[0] || post.userProfile?.username?.[0] || '?'}
          </div>
          <div>
            <p className="font-medium text-white text-sm">
              {post.userProfile?.displayName || post.userProfile?.username}
            </p>
            <p className="text-gray-500 text-xs">
              {timeAgo(post.createdAt)}{' '}
              {post.weatherInfo && (
                <>· {post.weatherInfo.temperature}°C in {post.weatherInfo.location}</>
              )}
            </p>
          </div>
        </div>
        <button className="text-gray-500 hover:text-white transition-colors">···</button>
      </div>

      {/* Post image */}
      {post.imageUrl ? (
        <div className="aspect-[4/5] bg-gray-800 relative overflow-hidden">
          <img
            src={post.imageUrl}
            alt={post.caption || 'Outfit post'}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="aspect-[4/5] bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
          <span className="text-6xl">👗</span>
        </div>
      )}

      {/* Post actions */}
      <div className="p-4">
        <div className="flex items-center gap-4 mb-3">
          <button
            onClick={() => onLike(post.id)}
            className={`flex items-center gap-1.5 transition-colors ${
              post.isLiked ? 'text-red-400' : 'text-gray-400 hover:text-red-400'
            }`}
          >
            <span className="text-lg">{post.isLiked ? '❤️' : '🤍'}</span>
            <span className="text-sm font-medium">{post.likesCount}</span>
          </button>
          <button
            onClick={() => setShowComments((v) => !v)}
            className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors"
          >
            <span className="text-lg">💬</span>
            <span className="text-sm font-medium">{post.commentsCount}</span>
          </button>
          <button className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors ml-auto">
            <span className="text-lg">{post.isBookmarked ? '🔖' : '📌'}</span>
          </button>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-2">
          <span className="px-2 py-0.5 bg-brand-600/20 text-brand-300 rounded-full text-xs">
            #{post.occasion}
          </span>
          {post.mood && (
            <span className="px-2 py-0.5 bg-purple-600/20 text-purple-300 rounded-full text-xs">
              #{post.mood}
            </span>
          )}
          {post.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 bg-white/10 text-gray-400 rounded-full text-xs"
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* Caption */}
        {post.caption && (
          <p className="text-gray-300 text-sm">
            <span className="font-semibold text-white">
              {post.userProfile?.username}
            </span>{' '}
            {post.caption}
          </p>
        )}

        {/* Comments section */}
        {showComments && (
          <div className="mt-3 pt-3 border-t border-white/10">
            <div className="flex gap-2 mt-2">
              <input
                type="text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add a comment..."
                className="input-field py-2 text-sm flex-1"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && comment.trim()) {
                    setComment('');
                  }
                }}
              />
              <Button variant="primary" size="sm" disabled={!comment.trim()}>
                Post
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

export default function CommunityPage() {
  const [posts, setPosts] = useState<OutfitPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [filter, setFilter] = useState<'trending' | 'following' | 'recent'>('trending');

  // Mock posts for demo
  const mockPosts: OutfitPost[] = [
    {
      id: '1',
      userId: 'user1',
      userProfile: { username: 'stylequeen', displayName: 'Style Queen', avatarUrl: undefined },
      items: [],
      occasion: ClothingOccasion.CASUAL,
      mood: OutfitMood.CONFIDENT,
      tags: ['ootd', 'casual', 'minimalist'],
      likesCount: 142,
      commentsCount: 23,
      isLiked: false,
      isBookmarked: false,
      caption: "Minimalist Monday done right 🤍 Less is truly more.",
      weatherInfo: { temperature: 22, condition: 'sunny' as any, location: 'NYC' },
      wornDate: new Date().toISOString(),
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '2',
      userId: 'user2',
      userProfile: { username: 'fashionforward', displayName: 'Fashion Forward', avatarUrl: undefined },
      items: [],
      occasion: ClothingOccasion.WORK,
      mood: OutfitMood.PROFESSIONAL,
      tags: ['workwear', 'officestyle', 'professional'],
      likesCount: 87,
      commentsCount: 11,
      isLiked: true,
      isBookmarked: false,
      caption: "Power dressing for that big presentation today! Feeling unstoppable 💪",
      wornDate: new Date().toISOString(),
      createdAt: new Date(Date.now() - 7200000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const loadPosts = useCallback(async () => {
    setLoading(true);
    try {
      const result = await api.community.getFeed(page);
      if (page === 1) {
        setPosts(result.data);
      } else {
        setPosts((prev) => [...prev, ...result.data]);
      }
      setHasMore(page < result.totalPages);
    } catch {
      // Show mock posts if API not available
      setPosts(mockPosts);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const handleLike = async (postId: string) => {
    const post = posts.find((p) => p.id === postId);
    if (!post) return;

    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, isLiked: !p.isLiked, likesCount: p.isLiked ? p.likesCount - 1 : p.likesCount + 1 }
          : p,
      ),
    );

    try {
      if (post.isLiked) {
        await api.community.unlikePost(postId);
      } else {
        await api.community.likePost(postId);
      }
    } catch {
      // Revert on error
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, isLiked: post.isLiked, likesCount: post.likesCount }
            : p,
        ),
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-950">
      <nav className="sticky top-0 z-40 bg-gray-950/80 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">👗</span>
            <span className="text-xl font-bold gradient-text">MoodFit</span>
          </Link>
          <div className="hidden md:flex items-center gap-1">
            <Link href="/" className="nav-link">Home</Link>
            <Link href="/wardrobe" className="nav-link">Wardrobe</Link>
            <Link href="/recommend" className="nav-link">AI Stylist</Link>
            <Link href="/calendar" className="nav-link">Calendar</Link>
            <Link href="/community" className="nav-link-active">Community</Link>
          </div>
          <Button variant="primary" size="sm">+ Share Outfit</Button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white">Community</h1>
            <p className="text-gray-400 mt-1">Discover styles from the MoodFit community.</p>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6">
          {(['trending', 'following', 'recent'] as const).map((f) => (
            <button
              key={f}
              onClick={() => {
                setFilter(f);
                setPage(1);
              }}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all capitalize ${
                filter === f
                  ? 'bg-brand-600 text-white'
                  : 'bg-white/10 text-gray-400 hover:text-white hover:bg-white/20'
              }`}
            >
              {f === 'trending' ? '🔥 Trending' : f === 'following' ? '👥 Following' : '🕒 Recent'}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading && page === 1 ? (
            [...Array(6)].map((_, i) => (
              <div key={i} className="glass-card animate-pulse">
                <div className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/10" />
                  <div className="flex-1">
                    <div className="h-3 bg-white/10 rounded w-24 mb-1" />
                    <div className="h-2 bg-white/10 rounded w-16" />
                  </div>
                </div>
                <div className="aspect-[4/5] bg-white/5" />
                <div className="p-4 space-y-2">
                  <div className="h-3 bg-white/10 rounded w-full" />
                  <div className="h-3 bg-white/10 rounded w-3/4" />
                </div>
              </div>
            ))
          ) : (
            posts.map((post) => (
              <PostCard key={post.id} post={post} onLike={handleLike} />
            ))
          )}
        </div>

        {hasMore && (
          <div className="mt-8 text-center">
            <Button
              variant="secondary"
              onClick={() => setPage((p) => p + 1)}
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Load More'}
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
