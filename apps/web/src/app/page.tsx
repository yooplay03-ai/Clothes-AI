'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { WeatherData, WeatherCondition, OutfitRecommendation, ClothingOccasion, OutfitMood } from '@moodfit/shared';
import { getUserLocationWeather, getWeatherIcon, getTemperatureColor } from '@/lib/weather';
import { api } from '@/lib/api';
import OutfitCard from '@/components/outfit/OutfitCard';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

function WeatherWidget({ weather }: { weather: WeatherData }) {
  const icon = getWeatherIcon(weather.current.condition);
  const tempColor = getTemperatureColor(weather.current.temperature);

  return (
    <div className="glass-card p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-400 text-sm font-medium">
            {weather.location.city}, {weather.location.country}
          </p>
          <div className="flex items-end gap-2 mt-1">
            <span className={`text-5xl font-bold ${tempColor}`}>
              {weather.current.temperature}°C
            </span>
            <span className="text-2xl mb-1">{icon}</span>
          </div>
          <p className="text-gray-400 capitalize mt-1">{weather.current.description}</p>
          <p className="text-gray-500 text-sm mt-1">
            Feels like {weather.current.feelsLike}°C · {weather.current.humidity}% humidity
          </p>
        </div>
        <div className="text-right text-sm text-gray-500 space-y-1">
          <p>💨 {weather.current.windSpeed} km/h</p>
          <p>👁 {weather.current.visibility} km</p>
          <p>📊 {weather.current.pressure} hPa</p>
        </div>
      </div>

      {/* 3-day forecast strip */}
      <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-3 gap-2">
        {weather.forecast.slice(0, 3).map((day) => (
          <div key={day.date} className="text-center">
            <p className="text-gray-500 text-xs">
              {new Date(day.date).toLocaleDateString('en', { weekday: 'short' })}
            </p>
            <p className="text-lg my-1">{getWeatherIcon(day.condition)}</p>
            <p className="text-white text-xs font-medium">
              {day.tempMax}° <span className="text-gray-500">{day.tempMin}°</span>
            </p>
            {day.precipitationChance > 20 && (
              <p className="text-blue-400 text-xs">💧{day.precipitationChance}%</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function QuickActionCard({
  icon,
  title,
  description,
  href,
  color,
}: {
  icon: string;
  title: string;
  description: string;
  href: string;
  color: string;
}) {
  return (
    <Link href={href}>
      <div
        className={`glass-card p-5 cursor-pointer hover:bg-white/10 transition-all duration-200 hover:scale-[1.02] group`}
      >
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-3 ${color}`}
        >
          {icon}
        </div>
        <h3 className="font-semibold text-white group-hover:text-brand-300 transition-colors">
          {title}
        </h3>
        <p className="text-gray-500 text-sm mt-1">{description}</p>
      </div>
    </Link>
  );
}

export default function HomePage() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [recommendations, setRecommendations] = useState<OutfitRecommendation[]>([]);
  const [recsLoading, setRecsLoading] = useState(false);
  const [greeting, setGreeting] = useState('Good morning');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 12 && hour < 17) setGreeting('Good afternoon');
    else if (hour >= 17) setGreeting('Good evening');
    else setGreeting('Good morning');
  }, []);

  useEffect(() => {
    async function loadWeather() {
      try {
        const data = await getUserLocationWeather();
        setWeather(data);
      } catch {
        // Fall back to mock data if geolocation denied
        const { getMockWeatherData: getMock } = await import('@/lib/weather');
        setWeather(getMock());
      } finally {
        setWeatherLoading(false);
      }
    }
    loadWeather();
  }, []);

  useEffect(() => {
    async function loadRecommendations() {
      setRecsLoading(true);
      try {
        const result = await api.outfits.getRecommendations(1, 4);
        setRecommendations(result.data);
      } catch {
        // Not logged in or no recommendations yet
      } finally {
        setRecsLoading(false);
      }
    }
    loadRecommendations();
  }, []);

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Navigation */}
      <nav className="sticky top-0 z-40 bg-gray-950/80 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <span className="text-2xl">👗</span>
              <span className="text-xl font-bold gradient-text">MoodFit</span>
            </div>
            <div className="hidden md:flex items-center gap-1">
              <Link href="/" className="nav-link-active">Home</Link>
              <Link href="/wardrobe" className="nav-link">Wardrobe</Link>
              <Link href="/recommend" className="nav-link">AI Stylist</Link>
              <Link href="/calendar" className="nav-link">Calendar</Link>
              <Link href="/community" className="nav-link">Community</Link>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/login"><Button variant="ghost" size="sm">Sign In</Button></Link>
              <Link href="/login"><Button variant="primary" size="sm">Get Started</Button></Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">
            {greeting}! 👋
          </h1>
          <p className="text-gray-400 mt-1">
            Here&apos;s what&apos;s happening with your style today.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Weather widget */}
            {weatherLoading ? (
              <div className="glass-card p-6 animate-pulse">
                <div className="h-24 bg-white/5 rounded-xl" />
              </div>
            ) : weather ? (
              <WeatherWidget weather={weather} />
            ) : null}

            {/* AI Recommendations */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white">Today&apos;s Recommendations</h2>
                <Link href="/recommend">
                  <Button variant="ghost" size="sm">View All →</Button>
                </Link>
              </div>

              {recsLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[...Array(2)].map((_, i) => (
                    <div key={i} className="glass-card p-4 animate-pulse">
                      <div className="h-40 bg-white/5 rounded-xl" />
                    </div>
                  ))}
                </div>
              ) : recommendations.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {recommendations.slice(0, 4).map((rec) => (
                    <OutfitCard key={rec.id} recommendation={rec} />
                  ))}
                </div>
              ) : (
                <Card className="p-8 text-center">
                  <span className="text-4xl block mb-3">✨</span>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Get Your First AI Outfit
                  </h3>
                  <p className="text-gray-400 mb-4 text-sm">
                    Tell us your mood and occasion and our AI will craft the perfect outfit from your wardrobe.
                  </p>
                  <Link href="/recommend">
                    <Button variant="primary">Get AI Recommendations</Button>
                  </Link>
                </Card>
              )}
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-6">
            {/* Quick actions */}
            <div>
              <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 gap-3">
                <QuickActionCard
                  icon="🤖"
                  title="AI Stylist"
                  description="Get outfit recommendations"
                  href="/recommend"
                  color="bg-brand-600/20"
                />
                <QuickActionCard
                  icon="👗"
                  title="Wardrobe"
                  description="Manage your clothes"
                  href="/wardrobe"
                  color="bg-purple-600/20"
                />
                <QuickActionCard
                  icon="📅"
                  title="Calendar"
                  description="Plan your outfits"
                  href="/calendar"
                  color="bg-blue-600/20"
                />
                <QuickActionCard
                  icon="🌍"
                  title="Community"
                  description="Share & discover styles"
                  href="/community"
                  color="bg-green-600/20"
                />
              </div>
            </div>

            {/* Style tip */}
            <Card className="p-5">
              <div className="flex items-start gap-3">
                <span className="text-2xl">💡</span>
                <div>
                  <h3 className="font-semibold text-white text-sm">Style Tip of the Day</h3>
                  <p className="text-gray-400 text-sm mt-1 leading-relaxed">
                    {weather && weather.current.temperature < 15
                      ? 'Layering is key today! Start with a lightweight base and add a cozy cardigan or jacket that you can remove as the day warms up.'
                      : 'Neutral tones like beige and white create a timeless look that pairs well with any accessory. Try building your outfit around a versatile neutral piece.'}
                  </p>
                </div>
              </div>
            </Card>

            {/* Wardrobe stats teaser */}
            <Card className="p-5">
              <h3 className="font-semibold text-white mb-3">Your Wardrobe At a Glance</h3>
              <div className="space-y-2">
                {[
                  { label: 'Total Items', value: '0', icon: '👗' },
                  { label: 'Outfits Logged', value: '0', icon: '📝' },
                  { label: 'AI Recommendations', value: '0', icon: '🤖' },
                ].map((stat) => (
                  <div key={stat.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                      <span>{stat.icon}</span>
                      <span>{stat.label}</span>
                    </div>
                    <span className="text-white font-semibold">{stat.value}</span>
                  </div>
                ))}
              </div>
              <Link href="/wardrobe" className="block mt-4">
                <Button variant="secondary" size="sm" className="w-full">
                  Add Your First Item
                </Button>
              </Link>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
