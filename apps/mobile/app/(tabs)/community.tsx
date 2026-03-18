import { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
  RefreshControl,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { OutfitPost } from '@moodfit/shared';

const { width } = Dimensions.get('window');

const MOCK_POSTS: OutfitPost[] = [
  {
    id: '1',
    userId: 'user1',
    userProfile: { username: 'fashionista_nyc', displayName: 'Fashion NYC' },
    items: [],
    occasion: 'casual' as any,
    mood: 'confident' as any,
    tags: ['ootd', 'minimalist'],
    caption: 'Monday motivation 🤍 Keeping it clean and minimal today.',
    likesCount: 234,
    commentsCount: 18,
    isLiked: false,
    isBookmarked: false,
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    userId: 'user2',
    userProfile: { username: 'stylebyemma', displayName: 'Emma Style' },
    items: [],
    occasion: 'work' as any,
    mood: 'professional' as any,
    tags: ['workwear', 'blazer'],
    caption: 'Power dressing for the boardroom! 💼 Never underestimate a great blazer.',
    likesCount: 187,
    commentsCount: 24,
    isLiked: true,
    isBookmarked: false,
    createdAt: new Date(Date.now() - 3600000 * 10).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    userId: 'user3',
    userProfile: { username: 'streetstyle_la', displayName: 'Street Style LA' },
    items: [],
    occasion: 'casual' as any,
    mood: 'energetic' as any,
    tags: ['streetwear', 'sneakers'],
    caption: 'Weekend vibes in LA ☀️ Fresh kicks and good energy.',
    likesCount: 412,
    commentsCount: 56,
    isLiked: false,
    isBookmarked: false,
    weatherInfo: { temperature: 28, condition: 'sunny' as any, location: 'Los Angeles' },
    createdAt: new Date(Date.now() - 3600000 * 20).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

function timeAgo(date: string): string {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 60) return `${mins}m`;
  if (hours < 24) return `${hours}h`;
  return `${days}d`;
}

function PostCard({
  post,
  onLike,
}: {
  post: OutfitPost;
  onLike: (id: string, isLiked: boolean) => void;
}) {
  return (
    <View style={styles.postCard}>
      {/* Post header */}
      <View style={styles.postHeader}>
        <View style={styles.postAvatar}>
          <Text style={styles.postAvatarText}>
            {post.userProfile?.displayName?.[0] || '?'}
          </Text>
        </View>
        <View style={styles.postHeaderInfo}>
          <Text style={styles.postUsername}>{post.userProfile?.displayName}</Text>
          <Text style={styles.postTime}>
            @{post.userProfile?.username} · {timeAgo(post.createdAt)}
            {post.weatherInfo && ` · ${post.weatherInfo.temperature}°C`}
          </Text>
        </View>
        <TouchableOpacity>
          <Ionicons name="ellipsis-horizontal" size={20} color="#6b7280" />
        </TouchableOpacity>
      </View>

      {/* Post image placeholder */}
      <View style={styles.postImage}>
        <Text style={styles.postImageEmoji}>👗</Text>
      </View>

      {/* Actions */}
      <View style={styles.postActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => onLike(post.id, !post.isLiked)}
        >
          <Ionicons
            name={post.isLiked ? 'heart' : 'heart-outline'}
            size={22}
            color={post.isLiked ? '#ef4444' : '#9ca3af'}
          />
          <Text style={[styles.actionCount, post.isLiked && styles.actionCountLiked]}>
            {post.likesCount}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="chatbubble-outline" size={22} color="#9ca3af" />
          <Text style={styles.actionCount}>{post.commentsCount}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="paper-plane-outline" size={22} color="#9ca3af" />
        </TouchableOpacity>
        <View style={{ flex: 1 }} />
        <TouchableOpacity>
          <Ionicons
            name={post.isBookmarked ? 'bookmark' : 'bookmark-outline'}
            size={22}
            color={post.isBookmarked ? '#d946ef' : '#9ca3af'}
          />
        </TouchableOpacity>
      </View>

      {/* Tags */}
      <View style={styles.tagRow}>
        {post.tags.slice(0, 3).map((tag) => (
          <View key={tag} style={styles.tag}>
            <Text style={styles.tagText}>#{tag}</Text>
          </View>
        ))}
      </View>

      {/* Caption */}
      {post.caption && (
        <View style={styles.captionContainer}>
          <Text style={styles.captionUsername}>{post.userProfile?.username} </Text>
          <Text style={styles.captionText}>{post.caption}</Text>
        </View>
      )}
    </View>
  );
}

export default function CommunityScreen() {
  const [posts, setPosts] = useState<OutfitPost[]>(MOCK_POSTS);
  const [filter, setFilter] = useState<'trending' | 'following' | 'recent'>('trending');
  const [refreshing, setRefreshing] = useState(false);

  const handleLike = (postId: string, isLiked: boolean) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, isLiked, likesCount: isLiked ? p.likesCount + 1 : p.likesCount - 1 }
          : p,
      ),
    );
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise((r) => setTimeout(r, 800));
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Community</Text>
        <TouchableOpacity style={styles.shareButton}>
          <Ionicons name="add-circle-outline" size={28} color="#d946ef" />
        </TouchableOpacity>
      </View>

      {/* Filter tabs */}
      <View style={styles.filterRow}>
        {(['trending', 'following', 'recent'] as const).map((f) => (
          <TouchableOpacity
            key={f}
            onPress={() => setFilter(f)}
            style={[styles.filterTab, filter === f && styles.filterTabActive]}
          >
            <Text style={[styles.filterTabText, filter === f && styles.filterTabTextActive]}>
              {f === 'trending' ? '🔥 Trending' : f === 'following' ? '👥 Following' : '🕒 Recent'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Feed */}
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#d946ef"
          />
        }
        renderItem={({ item }) => <PostCard post={item} onLike={handleLike} />}
        contentContainerStyle={styles.feedContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#030712' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  title: { fontSize: 24, fontWeight: '700', color: '#fff' },
  shareButton: {},

  // Filter
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 8,
  },
  filterTab: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  filterTabActive: {
    backgroundColor: 'rgba(217,70,239,0.2)',
    borderColor: 'rgba(217,70,239,0.35)',
  },
  filterTabText: { color: '#9ca3af', fontSize: 13, fontWeight: '500' },
  filterTabTextActive: { color: '#e879f9' },

  // Feed
  feedContent: { paddingBottom: 24 },
  separator: { height: 1, backgroundColor: 'rgba(255,255,255,0.06)', marginVertical: 4 },

  // Post card
  postCard: {
    backgroundColor: '#030712',
    paddingVertical: 12,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
    gap: 10,
  },
  postAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#d946ef',
    alignItems: 'center',
    justifyContent: 'center',
  },
  postAvatarText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  postHeaderInfo: { flex: 1 },
  postUsername: { color: '#fff', fontWeight: '600', fontSize: 14 },
  postTime: { color: '#6b7280', fontSize: 11, marginTop: 1 },

  // Post image
  postImage: {
    width: '100%',
    aspectRatio: 4 / 5,
    backgroundColor: 'rgba(255,255,255,0.04)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  postImageEmoji: { fontSize: 64 },

  // Actions
  postActions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
    gap: 16,
  },
  actionButton: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  actionCount: { color: '#9ca3af', fontSize: 13 },
  actionCountLiked: { color: '#ef4444' },

  // Tags
  tagRow: { flexDirection: 'row', gap: 6, paddingHorizontal: 16, marginBottom: 8 },
  tag: {
    backgroundColor: 'rgba(217,70,239,0.12)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  tagText: { color: '#e879f9', fontSize: 11 },

  // Caption
  captionContainer: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  captionUsername: { color: '#fff', fontWeight: '600', fontSize: 13 },
  captionText: { color: '#d1d5db', fontSize: 13 },
});
