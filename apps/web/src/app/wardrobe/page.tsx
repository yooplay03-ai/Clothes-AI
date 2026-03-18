'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  ClothingItem,
  ClothingCategory,
  ClothingColor,
  ClothingSeason,
  ClothingOccasion,
} from '@moodfit/shared';
import { api } from '@/lib/api';
import ClothingItemComponent from '@/components/wardrobe/ClothingItem';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { FilterOptions } from '@/types';
import Link from 'next/link';

const CATEGORY_LABELS: Record<ClothingCategory, string> = {
  [ClothingCategory.TOP]: 'Tops',
  [ClothingCategory.BOTTOM]: 'Bottoms',
  [ClothingCategory.DRESS]: 'Dresses',
  [ClothingCategory.OUTERWEAR]: 'Outerwear',
  [ClothingCategory.SHOES]: 'Shoes',
  [ClothingCategory.ACCESSORY]: 'Accessories',
  [ClothingCategory.BAG]: 'Bags',
  [ClothingCategory.UNDERWEAR]: 'Underwear',
  [ClothingCategory.ACTIVEWEAR]: 'Activewear',
};

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
        active
          ? 'bg-brand-600 text-white'
          : 'bg-white/10 text-gray-400 hover:bg-white/20 hover:text-white'
      }`}
    >
      {label}
    </button>
  );
}

function EmptyWardrobe() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <span className="text-6xl mb-4">👗</span>
      <h3 className="text-xl font-semibold text-white mb-2">Your wardrobe is empty</h3>
      <p className="text-gray-400 max-w-md mb-6">
        Start adding your clothes to get personalized AI outfit recommendations tailored to your
        actual wardrobe.
      </p>
      <Button variant="primary" onClick={() => {}}>
        + Add First Item
      </Button>
    </div>
  );
}

export default function WardrobePage() {
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<ClothingCategory | 'all'>('all');
  const [activeSeason, setActiveSeason] = useState<ClothingSeason | 'all'>('all');
  const [sortBy, setSortBy] = useState<FilterOptions['sortBy']>('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const LIMIT = 24;

  const loadItems = useCallback(async () => {
    setLoading(true);
    try {
      const filters: FilterOptions & { page: number; limit: number } = {
        page,
        limit: LIMIT,
        sortBy,
        ...(activeCategory !== 'all' && { categories: [activeCategory] }),
        ...(activeSeason !== 'all' && { seasons: [activeSeason] }),
      };
      const result = await api.wardrobe.getItems(filters);
      setItems(result.data);
      setTotalItems(result.total);
    } catch {
      // If not authenticated, show empty state
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [page, sortBy, activeCategory, activeSeason]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const filteredItems = items.filter(
    (item) =>
      !searchQuery ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  const categoryCount = (cat: ClothingCategory) => items.filter((i) => i.category === cat).length;

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Navigation */}
      <nav className="sticky top-0 z-40 bg-gray-950/80 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <Link href="/" className="flex items-center gap-2">
                <span className="text-2xl">👗</span>
                <span className="text-xl font-bold gradient-text">MoodFit</span>
              </Link>
            </div>
            <div className="hidden md:flex items-center gap-1">
              <Link href="/" className="nav-link">Home</Link>
              <Link href="/wardrobe" className="nav-link-active">Wardrobe</Link>
              <Link href="/recommend" className="nav-link">AI Stylist</Link>
              <Link href="/calendar" className="nav-link">Calendar</Link>
              <Link href="/community" className="nav-link">Community</Link>
            </div>
            <Button variant="primary" size="sm">+ Add Item</Button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white">My Wardrobe</h1>
            <p className="text-gray-400 mt-1">
              {totalItems} {totalItems === 1 ? 'item' : 'items'} in your collection
            </p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as FilterOptions['sortBy'])}
              className="input-field py-2 text-sm w-auto"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="most_worn">Most Worn</option>
              <option value="least_worn">Least Worn</option>
              <option value="name">A–Z</option>
            </select>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <input
            type="search"
            placeholder="Search by name, brand, or tag..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-10"
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">🔍</span>
        </div>

        {/* Category tabs */}
        <div className="flex gap-2 flex-wrap mb-4">
          <FilterChip
            label={`All (${totalItems})`}
            active={activeCategory === 'all'}
            onClick={() => setActiveCategory('all')}
          />
          {Object.values(ClothingCategory).map((cat) => (
            <FilterChip
              key={cat}
              label={`${CATEGORY_LABELS[cat]} (${categoryCount(cat)})`}
              active={activeCategory === cat}
              onClick={() => setActiveCategory(cat)}
            />
          ))}
        </div>

        {/* Season filters */}
        <div className="flex gap-2 flex-wrap mb-6">
          {(['all', ...Object.values(ClothingSeason)] as const).map((season) => (
            <FilterChip
              key={season}
              label={season === 'all' ? 'All Seasons' : season.replace('_', ' ')}
              active={activeSeason === season}
              onClick={() => setActiveSeason(season)}
            />
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="glass-card aspect-square animate-pulse" />
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <EmptyWardrobe />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {filteredItems.map((item) => (
              <ClothingItemComponent
                key={item.id}
                item={item}
                onUpdate={loadItems}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalItems > LIMIT && (
          <div className="flex items-center justify-center gap-4 mt-8">
            <Button
              variant="secondary"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              ← Previous
            </Button>
            <span className="text-gray-400 text-sm">
              Page {page} of {Math.ceil(totalItems / LIMIT)}
            </span>
            <Button
              variant="secondary"
              disabled={page >= Math.ceil(totalItems / LIMIT)}
              onClick={() => setPage((p) => p + 1)}
            >
              Next →
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
