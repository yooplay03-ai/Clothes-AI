'use client';

import { useState, useEffect } from 'react';
import {
  ClothingOccasion,
  OutfitMood,
  OutfitRecommendation,
  OutfitRecommendationRequest,
  WeatherData,
} from '@moodfit/shared';
import { api } from '@/lib/api';
import { getUserLocationWeather, getWeatherIcon } from '@/lib/weather';
import OutfitCard from '@/components/outfit/OutfitCard';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import Link from 'next/link';

const OCCASION_LABELS: Record<ClothingOccasion, { label: string; icon: string }> = {
  [ClothingOccasion.CASUAL]: { label: 'Casual', icon: '😊' },
  [ClothingOccasion.WORK]: { label: 'Work', icon: '💼' },
  [ClothingOccasion.FORMAL]: { label: 'Formal', icon: '🎩' },
  [ClothingOccasion.SPORT]: { label: 'Sport', icon: '🏃' },
  [ClothingOccasion.OUTDOOR]: { label: 'Outdoor', icon: '🌿' },
  [ClothingOccasion.PARTY]: { label: 'Party', icon: '🎉' },
  [ClothingOccasion.DATE]: { label: 'Date Night', icon: '💕' },
};

const MOOD_LABELS: Record<OutfitMood, { label: string; icon: string }> = {
  [OutfitMood.CONFIDENT]: { label: 'Confident', icon: '💪' },
  [OutfitMood.RELAXED]: { label: 'Relaxed', icon: '😌' },
  [OutfitMood.PROFESSIONAL]: { label: 'Professional', icon: '👔' },
  [OutfitMood.PLAYFUL]: { label: 'Playful', icon: '🎈' },
  [OutfitMood.ROMANTIC]: { label: 'Romantic', icon: '💝' },
  [OutfitMood.ENERGETIC]: { label: 'Energetic', icon: '⚡' },
  [OutfitMood.COZY]: { label: 'Cozy', icon: '🧣' },
  [OutfitMood.ADVENTUROUS]: { label: 'Adventurous', icon: '🧗' },
};

function SelectionCard({
  icon,
  label,
  selected,
  onClick,
}: {
  icon: string;
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`p-4 rounded-2xl text-center transition-all duration-200 border ${
        selected
          ? 'bg-brand-600/30 border-brand-500 text-white scale-[1.02]'
          : 'glass-card border-transparent text-gray-400 hover:text-white hover:border-white/20'
      }`}
    >
      <span className="text-2xl block mb-1">{icon}</span>
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
}

export default function RecommendPage() {
  const [step, setStep] = useState<'form' | 'loading' | 'results'>('form');
  const [occasion, setOccasion] = useState<ClothingOccasion | null>(null);
  const [mood, setMood] = useState<OutfitMood | null>(null);
  const [notes, setNotes] = useState('');
  const [useWeather, setUseWeather] = useState(true);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [recommendations, setRecommendations] = useState<OutfitRecommendation[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadWeather() {
      try {
        const data = await getUserLocationWeather();
        setWeather(data);
      } catch {
        const { getMockWeatherData: getMock } = await import('@/lib/weather');
        setWeather(getMock());
      }
    }
    loadWeather();
  }, []);

  const handleSubmit = async () => {
    if (!occasion) return;

    setStep('loading');
    setError(null);

    try {
      const request: OutfitRecommendationRequest = {
        occasion,
        ...(mood && { mood }),
        ...(useWeather && weather && {
          weatherData: {
            temperature: weather.current.temperature,
            condition: weather.current.condition,
            humidity: weather.current.humidity,
          },
        }),
        ...(notes && { notes }),
      };

      const rec = await api.outfits.requestRecommendation(request);
      setRecommendations([rec]);
      setStep('results');
    } catch (err) {
      setError('Failed to get recommendations. Please make sure you have items in your wardrobe.');
      setStep('form');
    }
  };

  if (step === 'loading') {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-brand-600/30 animate-ping" />
            <div className="absolute inset-2 rounded-full border-4 border-brand-500/50 animate-pulse" />
            <div className="absolute inset-0 flex items-center justify-center text-4xl">🤖</div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">AI is styling you...</h2>
          <p className="text-gray-400">Analyzing your wardrobe and crafting the perfect outfit</p>
          <div className="mt-6 space-y-2 text-sm text-gray-500">
            <p>✓ Analyzing weather conditions</p>
            <p>✓ Reviewing your wardrobe items</p>
            <p>⋯ Selecting the best combinations</p>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'results') {
    return (
      <div className="min-h-screen bg-gray-950">
        <nav className="sticky top-0 z-40 bg-gray-950/80 backdrop-blur-lg border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl">👗</span>
              <span className="text-xl font-bold gradient-text">MoodFit</span>
            </Link>
            <Button variant="secondary" size="sm" onClick={() => setStep('form')}>
              ← Try Again
            </Button>
          </div>
        </nav>
        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white">Your AI-Styled Outfit</h1>
            <p className="text-gray-400 mt-2">
              {occasion && OCCASION_LABELS[occasion].icon} {occasion} ·{' '}
              {mood && MOOD_LABELS[mood].icon} {mood}
            </p>
          </div>
          <div className="space-y-6">
            {recommendations.map((rec) => (
              <OutfitCard key={rec.id} recommendation={rec} expanded />
            ))}
          </div>
          <div className="mt-8 flex gap-4 justify-center">
            <Button variant="primary" onClick={() => {}}>
              📅 Schedule This Outfit
            </Button>
            <Button variant="secondary" onClick={handleSubmit}>
              🔄 Generate Another
            </Button>
          </div>
        </main>
      </div>
    );
  }

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
            <Link href="/recommend" className="nav-link-active">AI Stylist</Link>
            <Link href="/calendar" className="nav-link">Calendar</Link>
            <Link href="/community" className="nav-link">Community</Link>
          </div>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <span className="text-5xl block mb-4">🤖</span>
          <h1 className="text-3xl font-bold text-white">AI Outfit Stylist</h1>
          <p className="text-gray-400 mt-2">
            Tell me about your day and I&apos;ll pick the perfect outfit from your wardrobe.
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6 text-red-400 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {/* Occasion */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-white mb-4">
              What&apos;s the occasion? <span className="text-red-400">*</span>
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Object.entries(OCCASION_LABELS).map(([key, { label, icon }]) => (
                <SelectionCard
                  key={key}
                  icon={icon}
                  label={label}
                  selected={occasion === key}
                  onClick={() => setOccasion(key as ClothingOccasion)}
                />
              ))}
            </div>
          </Card>

          {/* Mood */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-white mb-4">How are you feeling?</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Object.entries(MOOD_LABELS).map(([key, { label, icon }]) => (
                <SelectionCard
                  key={key}
                  icon={icon}
                  label={label}
                  selected={mood === key}
                  onClick={() => setMood(mood === key ? null : (key as OutfitMood))}
                />
              ))}
            </div>
          </Card>

          {/* Weather */}
          {weather && (
            <Card className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-semibold text-white">Include Today&apos;s Weather?</h2>
                <label className="flex items-center gap-2 cursor-pointer">
                  <div
                    onClick={() => setUseWeather((v) => !v)}
                    className={`w-12 h-6 rounded-full transition-colors duration-200 relative ${
                      useWeather ? 'bg-brand-600' : 'bg-white/20'
                    }`}
                  >
                    <div
                      className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
                        useWeather ? 'translate-x-7' : 'translate-x-1'
                      }`}
                    />
                  </div>
                </label>
              </div>
              {useWeather && (
                <div className="flex items-center gap-3 text-gray-400 text-sm mt-3 glass-card p-3 rounded-xl">
                  <span className="text-2xl">{getWeatherIcon(weather.current.condition)}</span>
                  <div>
                    <span className="text-white font-medium">
                      {weather.current.temperature}°C
                    </span>{' '}
                    · {weather.current.description} in {weather.location.city}
                  </div>
                </div>
              )}
            </Card>
          )}

          {/* Notes */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-white mb-4">
              Any specific requests? <span className="text-gray-500 font-normal">(optional)</span>
            </h2>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., 'I want to look approachable but professional', 'avoid bright colors today', 'I have a presentation at 2pm'..."
              rows={3}
              className="input-field resize-none"
            />
          </Card>

          <Button
            variant="primary"
            size="lg"
            onClick={handleSubmit}
            disabled={!occasion}
            className="w-full"
          >
            ✨ Generate My Outfit
          </Button>
        </div>
      </main>
    </div>
  );
}
