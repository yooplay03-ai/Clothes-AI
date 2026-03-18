import { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Dimensions,
  Image,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ClothingItem, ClothingCategory } from '@moodfit/shared';

const { width } = Dimensions.get('window');
const ITEM_SIZE = (width - 48) / 3;

const CATEGORY_LABELS: Partial<Record<ClothingCategory | 'all', string>> = {
  all: 'All',
  [ClothingCategory.TOP]: 'Tops',
  [ClothingCategory.BOTTOM]: 'Bottoms',
  [ClothingCategory.DRESS]: 'Dresses',
  [ClothingCategory.OUTERWEAR]: 'Outerwear',
  [ClothingCategory.SHOES]: 'Shoes',
  [ClothingCategory.ACCESSORY]: 'Accessories',
};

const CATEGORY_EMOJI: Partial<Record<ClothingCategory | 'all', string>> = {
  all: '👗',
  [ClothingCategory.TOP]: '👕',
  [ClothingCategory.BOTTOM]: '👖',
  [ClothingCategory.DRESS]: '👗',
  [ClothingCategory.OUTERWEAR]: '🧥',
  [ClothingCategory.SHOES]: '👟',
  [ClothingCategory.ACCESSORY]: '💍',
};

function ClothingItemCard({ item }: { item: ClothingItem }) {
  return (
    <TouchableOpacity style={styles.itemCard} activeOpacity={0.8}>
      {item.imageUrl ? (
        <Image source={{ uri: item.imageUrl }} style={styles.itemImage} resizeMode="cover" />
      ) : (
        <View style={styles.itemPlaceholder}>
          <Text style={styles.itemEmoji}>
            {CATEGORY_EMOJI[item.category] || '👕'}
          </Text>
        </View>
      )}
      <View style={styles.itemInfo}>
        <Text style={styles.itemName} numberOfLines={1}>
          {item.name}
        </Text>
        {item.brand && (
          <Text style={styles.itemBrand} numberOfLines={1}>
            {item.brand}
          </Text>
        )}
      </View>
      {item.isFavorite && (
        <View style={styles.favoriteBadge}>
          <Text style={{ fontSize: 10 }}>⭐</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

export default function WardrobeScreen() {
  const [items] = useState<ClothingItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<ClothingCategory | 'all'>('all');
  const [refreshing, setRefreshing] = useState(false);

  const categories: Array<ClothingCategory | 'all'> = [
    'all',
    ClothingCategory.TOP,
    ClothingCategory.BOTTOM,
    ClothingCategory.DRESS,
    ClothingCategory.OUTERWEAR,
    ClothingCategory.SHOES,
    ClothingCategory.ACCESSORY,
  ];

  const filteredItems = items.filter((item) => {
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    const matchesSearch =
      !searchQuery ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.brand?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const onRefresh = async () => {
    setRefreshing(true);
    // Reload items from API
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>My Wardrobe</Text>
          <Text style={styles.subtitle}>{items.length} items</Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/wardrobe/add' as any)}
        >
          <Ionicons name="add" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={16} color="#6b7280" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search items..."
          placeholderTextColor="#6b7280"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={16} color="#6b7280" />
          </TouchableOpacity>
        )}
      </View>

      {/* Category tabs */}
      <FlatList
        horizontal
        data={categories}
        keyExtractor={(item) => item}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryTabs}
        renderItem={({ item: cat }) => (
          <TouchableOpacity
            style={[
              styles.categoryTab,
              activeCategory === cat && styles.categoryTabActive,
            ]}
            onPress={() => setActiveCategory(cat)}
          >
            <Text style={styles.categoryTabEmoji}>{CATEGORY_EMOJI[cat]}</Text>
            <Text
              style={[
                styles.categoryTabText,
                activeCategory === cat && styles.categoryTabTextActive,
              ]}
            >
              {CATEGORY_LABELS[cat]}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* Grid */}
      {filteredItems.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>👗</Text>
          <Text style={styles.emptyTitle}>
            {searchQuery ? 'No items found' : 'Your wardrobe is empty'}
          </Text>
          <Text style={styles.emptySubtitle}>
            {searchQuery
              ? 'Try a different search term'
              : 'Start adding your clothes to get personalized outfit recommendations'}
          </Text>
          {!searchQuery && (
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => router.push('/wardrobe/add' as any)}
            >
              <Text style={styles.emptyButtonText}>+ Add First Item</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={filteredItems}
          keyExtractor={(item) => item.id}
          numColumns={3}
          contentContainerStyle={styles.grid}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#d946ef"
            />
          }
          renderItem={({ item }) => <ClothingItemCard item={item} />}
        />
      )}
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
  subtitle: { color: '#6b7280', fontSize: 13, marginTop: 2 },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#d946ef',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Search
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, color: '#fff', fontSize: 14 },

  // Categories
  categoryTabs: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  categoryTabActive: {
    backgroundColor: 'rgba(217,70,239,0.2)',
    borderColor: 'rgba(217,70,239,0.4)',
  },
  categoryTabEmoji: { fontSize: 14 },
  categoryTabText: { color: '#9ca3af', fontSize: 13, fontWeight: '500' },
  categoryTabTextActive: { color: '#e879f9' },

  // Grid
  grid: { paddingHorizontal: 12, paddingBottom: 24 },
  itemCard: {
    width: ITEM_SIZE,
    margin: 4,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  itemImage: { width: '100%', aspectRatio: 1 },
  itemPlaceholder: {
    width: '100%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  itemEmoji: { fontSize: 32 },
  itemInfo: { padding: 8 },
  itemName: { color: '#e5e7eb', fontSize: 11, fontWeight: '500' },
  itemBrand: { color: '#6b7280', fontSize: 10, marginTop: 1 },
  favoriteBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 8,
    padding: 2,
  },

  // Empty state
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyEmoji: { fontSize: 56, marginBottom: 16 },
  emptyTitle: { color: '#fff', fontSize: 18, fontWeight: '600', marginBottom: 8 },
  emptySubtitle: {
    color: '#6b7280',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: '#d946ef',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  emptyButtonText: { color: '#fff', fontWeight: '600', fontSize: 14 },
});
