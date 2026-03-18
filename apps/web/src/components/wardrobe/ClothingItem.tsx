'use client';

import { useState } from 'react';
import { ClothingItem, ClothingCategory, ClothingColor } from '@moodfit/shared';
import { api } from '@/lib/api';

interface ClothingItemProps {
  item: ClothingItem;
  onUpdate?: () => void;
  selectable?: boolean;
  selected?: boolean;
  onSelect?: (item: ClothingItem) => void;
}

const CATEGORY_EMOJI: Record<ClothingCategory, string> = {
  [ClothingCategory.TOP]: '👕',
  [ClothingCategory.BOTTOM]: '👖',
  [ClothingCategory.DRESS]: '👗',
  [ClothingCategory.OUTERWEAR]: '🧥',
  [ClothingCategory.SHOES]: '👟',
  [ClothingCategory.ACCESSORY]: '💍',
  [ClothingCategory.BAG]: '👜',
  [ClothingCategory.UNDERWEAR]: '🩲',
  [ClothingCategory.ACTIVEWEAR]: '🏃',
};

const COLOR_HEX: Partial<Record<ClothingColor, string>> = {
  [ClothingColor.BLACK]: '#0a0a0a',
  [ClothingColor.WHITE]: '#f5f5f5',
  [ClothingColor.GRAY]: '#6b7280',
  [ClothingColor.RED]: '#ef4444',
  [ClothingColor.ORANGE]: '#f97316',
  [ClothingColor.YELLOW]: '#eab308',
  [ClothingColor.GREEN]: '#22c55e',
  [ClothingColor.BLUE]: '#3b82f6',
  [ClothingColor.PURPLE]: '#a855f7',
  [ClothingColor.PINK]: '#ec4899',
  [ClothingColor.BROWN]: '#92400e',
  [ClothingColor.BEIGE]: '#d2b48c',
  [ClothingColor.NAVY]: '#1e3a5f',
};

export default function ClothingItemComponent({
  item,
  onUpdate,
  selectable = false,
  selected = false,
  onSelect,
}: ClothingItemProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setLoading(true);
    try {
      await api.wardrobe.updateItem(item.id, { isFavorite: !item.isFavorite });
      onUpdate?.();
    } catch {
      // Handle error
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`Delete "${item.name}"?`)) return;
    setLoading(true);
    try {
      await api.wardrobe.deleteItem(item.id);
      onUpdate?.();
    } catch {
      // Handle error
    } finally {
      setLoading(false);
    }
    setShowMenu(false);
  };

  const handleClick = () => {
    if (selectable && onSelect) {
      onSelect(item);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`group relative rounded-2xl overflow-hidden bg-white/5 border transition-all duration-200 ${
        selected
          ? 'border-brand-500 bg-brand-600/10'
          : 'border-white/10 hover:border-white/20 hover:bg-white/8'
      } ${selectable || onUpdate ? 'cursor-pointer' : ''}`}
    >
      {/* Image area */}
      <div className="relative bg-white" style={{ aspectRatio: '3/4' }}>
        {item.imageUrl ? (
          <img
            src={item.imageUrl.startsWith('/') ? `http://localhost:3001${item.imageUrl}` : item.imageUrl}
            alt={item.name}
            className="w-full h-full object-cover object-top"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
            <span className="text-3xl">{CATEGORY_EMOJI[item.category]}</span>
          </div>
        )}

        {/* Color dots */}
        {item.colors.length > 0 && (
          <div className="absolute bottom-2 left-2 flex gap-1">
            {item.colors.slice(0, 4).map((color) => (
              <div
                key={color}
                className="w-3 h-3 rounded-full border border-white/30"
                style={{ backgroundColor: COLOR_HEX[color] || '#888' }}
                title={color}
              />
            ))}
          </div>
        )}

        {/* Favorite badge */}
        {item.isFavorite && (
          <div className="absolute top-2 left-2">
            <span className="text-yellow-400 text-xs">⭐</span>
          </div>
        )}

        {/* Selection indicator */}
        {selectable && (
          <div
            className={`absolute top-2 right-2 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
              selected
                ? 'bg-brand-600 border-brand-500'
                : 'border-white/40 bg-black/40'
            }`}
          >
            {selected && <span className="text-white text-xs">✓</span>}
          </div>
        )}

        {/* Hover overlay with actions */}
        {!selectable && (
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              onClick={handleFavorite}
              disabled={loading}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              title={item.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <span>{item.isFavorite ? '⭐' : '☆'}</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu((v) => !v);
              }}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            >
              <span className="text-white text-sm">⋯</span>
            </button>
          </div>
        )}

        {/* Dropdown menu */}
        {showMenu && (
          <div
            className="absolute top-8 right-2 bg-gray-900 border border-white/20 rounded-xl shadow-xl z-10 overflow-hidden min-w-[140px]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-white/10 transition-colors"
              onClick={() => setShowMenu(false)}
            >
              ✏️ Edit
            </button>
            <button
              className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-white/10 transition-colors"
              onClick={() => setShowMenu(false)}
            >
              📤 Share
            </button>
            <button
              className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
              onClick={handleDelete}
            >
              🗑️ Delete
            </button>
          </div>
        )}
      </div>

      {/* Item info */}
      <div className="p-2.5">
        <p className="text-white text-xs font-medium truncate" title={item.name}>
          {item.name}
        </p>
        {item.brand && (
          <p className="text-gray-500 text-xs truncate">{item.brand}</p>
        )}
        <div className="flex items-center justify-between mt-1">
          <span className="text-gray-600 text-xs capitalize">{item.category}</span>
          {item.wearCount > 0 && (
            <span className="text-gray-600 text-xs">{item.wearCount}×</span>
          )}
        </div>
      </div>
    </div>
  );
}
