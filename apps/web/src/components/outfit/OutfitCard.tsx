'use client';

import { useState } from 'react';
import { OutfitRecommendation, ClothingOccasion, OutfitMood } from '@moodfit/shared';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { api } from '@/lib/api';

interface OutfitCardProps {
  recommendation: OutfitRecommendation;
  expanded?: boolean;
  onSave?: (id: string) => void;
}

const OCCASION_ICONS: Record<ClothingOccasion, string> = {
  [ClothingOccasion.CASUAL]: '😊',
  [ClothingOccasion.WORK]: '💼',
  [ClothingOccasion.FORMAL]: '🎩',
  [ClothingOccasion.SPORT]: '🏃',
  [ClothingOccasion.OUTDOOR]: '🌿',
  [ClothingOccasion.PARTY]: '🎉',
  [ClothingOccasion.DATE]: '💕',
};

const MOOD_ICONS: Record<OutfitMood, string> = {
  [OutfitMood.CONFIDENT]: '💪',
  [OutfitMood.RELAXED]: '😌',
  [OutfitMood.PROFESSIONAL]: '👔',
  [OutfitMood.PLAYFUL]: '🎈',
  [OutfitMood.ROMANTIC]: '💝',
  [OutfitMood.ENERGETIC]: '⚡',
  [OutfitMood.COZY]: '🧣',
  [OutfitMood.ADVENTUROUS]: '🧗',
};

function ConfidenceBar({ score }: { score: number }) {
  const color =
    score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="text-xs text-gray-500 w-8 text-right">{score}%</span>
    </div>
  );
}

export default function OutfitCard({ recommendation, expanded = false, onSave }: OutfitCardProps) {
  const [saved, setSaved] = useState(recommendation.isSaved);
  const [saving, setSaving] = useState(false);
  const [isExpanded, setIsExpanded] = useState(expanded);

  const handleSave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (saved || saving) return;

    setSaving(true);
    try {
      await api.outfits.saveRecommendation(recommendation.id);
      setSaved(true);
      onSave?.(recommendation.id);
    } catch {
      // Handle error
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card
      className={`overflow-hidden transition-all duration-300 ${
        !expanded ? 'cursor-pointer hover:bg-white/8' : ''
      }`}
      onClick={() => !expanded && setIsExpanded((v) => !v)}
    >
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
              <span>{OCCASION_ICONS[recommendation.occasion]}</span>
              <span className="capitalize">{recommendation.occasion}</span>
              <span className="text-gray-600">·</span>
              <span>{MOOD_ICONS[recommendation.mood]}</span>
              <span className="capitalize">{recommendation.mood}</span>
            </div>
            <p className="text-xs text-gray-500">
              {new Date(recommendation.createdAt).toLocaleDateString('en', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
          <button
            onClick={handleSave}
            disabled={saved || saving}
            className={`text-lg transition-all ${
              saved
                ? 'opacity-100 text-yellow-400'
                : 'opacity-50 hover:opacity-100 text-gray-400 hover:text-yellow-400'
            }`}
            title={saved ? 'Saved' : 'Save outfit'}
          >
            {saved ? '🔖' : '📌'}
          </button>
        </div>

        {/* Confidence score */}
        <div className="mt-2">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
            <span>AI Confidence</span>
          </div>
          <ConfidenceBar score={recommendation.aiConfidenceScore} />
        </div>
      </div>

      {/* Outfit items */}
      <div className="p-4">
        {recommendation.items.length > 0 ? (
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            {recommendation.items.map((item, idx) => (
              <div
                key={idx}
                className={`flex-shrink-0 rounded-xl overflow-hidden border ${
                  item.role === 'primary'
                    ? 'border-brand-500/50 w-20 h-20'
                    : 'border-white/10 w-16 h-16'
                } bg-white flex items-center justify-center`}
              >
                {item.clothingItem?.imageUrl ? (
                  <img
                    src={item.clothingItem.imageUrl.startsWith('/') ? `http://localhost:3001${item.clothingItem.imageUrl}` : item.clothingItem.imageUrl}
                    alt={item.clothingItem.name}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <span className="text-2xl">👗</span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="h-16 flex items-center justify-center text-gray-600 text-sm">
            No items selected
          </div>
        )}
      </div>

      {/* AI Explanation */}
      <div className="px-4 pb-4">
        <p className="text-gray-400 text-sm leading-relaxed line-clamp-3">
          {recommendation.aiExplanation}
        </p>
      </div>

      {/* Expanded details */}
      {(isExpanded || expanded) && (
        <div className="border-t border-white/10">
          {/* Styling tips */}
          {recommendation.stylingTips.length > 0 && (
            <div className="p-4 border-b border-white/10">
              <h4 className="text-sm font-semibold text-white mb-2">💡 Styling Tips</h4>
              <ul className="space-y-1.5">
                {recommendation.stylingTips.map((tip, idx) => (
                  <li key={idx} className="text-gray-400 text-sm flex items-start gap-2">
                    <span className="text-brand-400 mt-0.5">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Color palette */}
          {recommendation.colorPalette.length > 0 && (
            <div className="p-4 border-b border-white/10">
              <h4 className="text-sm font-semibold text-white mb-2">🎨 Color Palette</h4>
              <div className="flex items-center gap-2">
                {recommendation.colorPalette.map((color, idx) => (
                  <div key={idx} className="flex items-center gap-1.5">
                    <div
                      className="w-5 h-5 rounded-full border border-white/20"
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-gray-500 text-xs capitalize">{color}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="p-4 flex gap-2">
            <Button
              variant="primary"
              size="sm"
              className="flex-1"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              📅 Schedule
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="flex-1"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              📤 Share
            </Button>
          </div>
        </div>
      )}

      {!expanded && (
        <div className="px-4 pb-3">
          <button
            className="text-xs text-gray-600 hover:text-gray-400 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded((v) => !v);
            }}
          >
            {isExpanded ? '↑ Show less' : '↓ Show more'}
          </button>
        </div>
      )}
    </Card>
  );
}
