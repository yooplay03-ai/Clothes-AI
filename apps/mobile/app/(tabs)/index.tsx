import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
  Dimensions,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { WeatherData, WeatherCondition, OutfitRecommendation } from '@moodfit/shared';

const { width } = Dimensions.get('window');

const WEATHER_ICONS: Record<string, string> = {
  [WeatherCondition.SUNNY]: '☀️',
  [WeatherCondition.PARTLY_CLOUDY]: '⛅',
  [WeatherCondition.CLOUDY]: '☁️',
  [WeatherCondition.RAINY]: '🌧️',
  [WeatherCondition.HEAVY_RAIN]: '⛈️',
  [WeatherCondition.THUNDERSTORM]: '⛈️',
  [WeatherCondition.SNOWY]: '❄️',
  [WeatherCondition.BLIZZARD]: '🌨️',
  [WeatherCondition.FOGGY]: '🌫️',
  [WeatherCondition.WINDY]: '💨',
  [WeatherCondition.HOT]: '🔥',
  [WeatherCondition.HUMID]: '💧',
};

function WeatherCard({ weather }: { weather: WeatherData }) {
  const icon = WEATHER_ICONS[weather.current.condition] || '🌤️';

  return (
    <View style={styles.weatherCard}>
      <View style={styles.weatherMain}>
        <View>
          <Text style={styles.weatherCity}>
            📍 {weather.location.city}, {weather.location.country}
          </Text>
          <View style={styles.weatherTempRow}>
            <Text style={styles.weatherTemp}>{weather.current.temperature}°C</Text>
            <Text style={styles.weatherIcon}>{icon}</Text>
          </View>
          <Text style={styles.weatherDesc}>{weather.current.description}</Text>
        </View>
        <View style={styles.weatherDetails}>
          <Text style={styles.weatherDetailText}>💧 {weather.current.humidity}%</Text>
          <Text style={styles.weatherDetailText}>💨 {weather.current.windSpeed}km/h</Text>
          <Text style={styles.weatherDetailText}>
            Feels {weather.current.feelsLike}°C
          </Text>
        </View>
      </View>
      {/* Mini forecast */}
      <View style={styles.forecastRow}>
        {weather.forecast.slice(0, 3).map((day) => (
          <View key={day.date} style={styles.forecastDay}>
            <Text style={styles.forecastDayName}>
              {new Date(day.date).toLocaleDateString('en', { weekday: 'short' })}
            </Text>
            <Text style={styles.forecastIcon}>
              {WEATHER_ICONS[day.condition] || '🌤️'}
            </Text>
            <Text style={styles.forecastTemp}>
              {day.tempMax}°{' '}
              <Text style={styles.forecastTempMin}>{day.tempMin}°</Text>
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function QuickActionButton({
  icon,
  label,
  onPress,
  color,
}: {
  icon: string;
  label: string;
  onPress: () => void;
  color: string;
}) {
  return (
    <TouchableOpacity style={[styles.quickAction, { borderColor: color + '40' }]} onPress={onPress}>
      <View style={[styles.quickActionIcon, { backgroundColor: color + '20' }]}>
        <Text style={styles.quickActionEmoji}>{icon}</Text>
      </View>
      <Text style={styles.quickActionLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [greeting, setGreeting] = useState('Good morning');
  const hour = new Date().getHours();

  useEffect(() => {
    if (hour >= 12 && hour < 17) setGreeting('Good afternoon');
    else if (hour >= 17) setGreeting('Good evening');
    else setGreeting('Good morning');
  }, []);

  const loadWeather = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        // Use mock data
        setWeather(getMockWeather());
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      // In production, call your weather API
      // For now, use mock data with real coordinates
      setWeather(getMockWeather());
    } catch {
      setWeather(getMockWeather());
    }
  }, []);

  useEffect(() => {
    loadWeather();
  }, [loadWeather]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadWeather();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#d946ef"
            colors={['#d946ef']}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Greeting */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{greeting}! 👋</Text>
            <Text style={styles.subGreeting}>What are you wearing today?</Text>
          </View>
          <TouchableOpacity style={styles.avatarButton}>
            <Text style={styles.avatarText}>👤</Text>
          </TouchableOpacity>
        </View>

        {/* Weather */}
        {weather ? (
          <WeatherCard weather={weather} />
        ) : (
          <View style={[styles.weatherCard, styles.loadingCard]}>
            <Text style={styles.loadingText}>Loading weather...</Text>
          </View>
        )}

        {/* AI Recommend CTA */}
        <TouchableOpacity
          style={styles.aiCta}
          onPress={() => router.push('/(tabs)/recommend')}
          activeOpacity={0.85}
        >
          <View style={styles.aiCtaContent}>
            <Text style={styles.aiCtaEmoji}>🤖</Text>
            <View style={styles.aiCtaText}>
              <Text style={styles.aiCtaTitle}>Get AI Outfit Suggestion</Text>
              <Text style={styles.aiCtaSubtitle}>
                Based on today's weather & your mood
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#d946ef" />
          </View>
        </TouchableOpacity>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          <QuickActionButton
            icon="👗"
            label="Add Item"
            onPress={() => router.push('/(tabs)/wardrobe')}
            color="#d946ef"
          />
          <QuickActionButton
            icon="📅"
            label="Calendar"
            onPress={() => {}}
            color="#8b5cf6"
          />
          <QuickActionButton
            icon="🌍"
            label="Community"
            onPress={() => router.push('/(tabs)/community')}
            color="#06b6d4"
          />
          <QuickActionButton
            icon="📊"
            label="Stats"
            onPress={() => {}}
            color="#10b981"
          />
        </View>

        {/* Style tip */}
        <View style={styles.tipCard}>
          <Text style={styles.tipIcon}>💡</Text>
          <View style={styles.tipContent}>
            <Text style={styles.tipTitle}>Style Tip of the Day</Text>
            <Text style={styles.tipText}>
              {weather && weather.current.temperature < 15
                ? 'Layering is key today! Start with a lightweight base and add a cozy cardigan or jacket you can remove throughout the day.'
                : 'Neutral tones like beige, white, and cream create timeless looks that pair effortlessly with any accessory or accent color.'}
            </Text>
          </View>
        </View>

        {/* Recent Recommendations placeholder */}
        <Text style={styles.sectionTitle}>Recent Recommendations</Text>
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>✨</Text>
          <Text style={styles.emptyTitle}>No recommendations yet</Text>
          <Text style={styles.emptySubtitle}>
            Add items to your wardrobe and get your first AI outfit recommendation!
          </Text>
          <TouchableOpacity
            style={styles.emptyButton}
            onPress={() => router.push('/(tabs)/recommend')}
          >
            <Text style={styles.emptyButtonText}>Get Started</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function getMockWeather(): WeatherData {
  return {
    location: { city: '서울', country: 'KR', lat: 37.5665, lon: 126.978 },
    current: {
      temperature: 18,
      feelsLike: 16,
      humidity: 65,
      windSpeed: 14,
      windDirection: 220,
      condition: WeatherCondition.PARTLY_CLOUDY,
      description: 'partly cloudy',
      iconCode: '02d',
      uvIndex: 5,
      visibility: 10,
      pressure: 1015,
    },
    forecast: [
      {
        date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        tempMin: 12,
        tempMax: 22,
        condition: WeatherCondition.SUNNY,
        description: 'clear sky',
        precipitationChance: 5,
        humidity: 55,
        windSpeed: 10,
      },
      {
        date: new Date(Date.now() + 172800000).toISOString().split('T')[0],
        tempMin: 14,
        tempMax: 20,
        condition: WeatherCondition.CLOUDY,
        description: 'overcast clouds',
        precipitationChance: 20,
        humidity: 68,
        windSpeed: 18,
      },
      {
        date: new Date(Date.now() + 259200000).toISOString().split('T')[0],
        tempMin: 10,
        tempMax: 16,
        condition: WeatherCondition.RAINY,
        description: 'light rain',
        precipitationChance: 75,
        humidity: 80,
        windSpeed: 22,
      },
    ],
    updatedAt: new Date().toISOString(),
  };
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#030712' },
  scrollContent: { paddingBottom: 24 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  greeting: { fontSize: 24, fontWeight: '700', color: '#fff' },
  subGreeting: { fontSize: 14, color: '#6b7280', marginTop: 2 },
  avatarButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 18 },

  // Weather
  weatherCard: {
    marginHorizontal: 20,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    padding: 16,
    marginBottom: 16,
  },
  loadingCard: { height: 120, alignItems: 'center', justifyContent: 'center' },
  loadingText: { color: '#6b7280' },
  weatherMain: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  weatherCity: { color: '#9ca3af', fontSize: 13, marginBottom: 4 },
  weatherTempRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  weatherTemp: { fontSize: 42, fontWeight: '700', color: '#fff' },
  weatherIcon: { fontSize: 28 },
  weatherDesc: { color: '#9ca3af', fontSize: 14, textTransform: 'capitalize', marginTop: 2 },
  weatherDetails: { alignItems: 'flex-end', justifyContent: 'space-evenly' },
  weatherDetailText: { color: '#6b7280', fontSize: 12, marginBottom: 4 },
  forecastRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
    paddingTop: 12,
  },
  forecastDay: { alignItems: 'center' },
  forecastDayName: { color: '#6b7280', fontSize: 11, marginBottom: 4 },
  forecastIcon: { fontSize: 20, marginBottom: 4 },
  forecastTemp: { color: '#fff', fontSize: 12, fontWeight: '500' },
  forecastTempMin: { color: '#6b7280' },

  // AI CTA
  aiCta: {
    marginHorizontal: 20,
    borderRadius: 16,
    backgroundColor: 'rgba(217,70,239,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(217,70,239,0.3)',
    padding: 16,
    marginBottom: 20,
  },
  aiCtaContent: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  aiCtaEmoji: { fontSize: 28 },
  aiCtaText: { flex: 1 },
  aiCtaTitle: { color: '#fff', fontWeight: '600', fontSize: 15 },
  aiCtaSubtitle: { color: '#9ca3af', fontSize: 12, marginTop: 2 },

  // Section
  sectionTitle: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
    paddingHorizontal: 20,
    marginBottom: 12,
  },

  // Quick actions
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 20,
  },
  quickAction: {
    width: (width - 48) / 2,
    borderRadius: 16,
    borderWidth: 1,
    backgroundColor: 'rgba(255,255,255,0.03)',
    padding: 14,
    alignItems: 'flex-start',
  },
  quickActionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  quickActionEmoji: { fontSize: 20 },
  quickActionLabel: { color: '#d1d5db', fontSize: 13, fontWeight: '500' },

  // Tip
  tipCard: {
    marginHorizontal: 20,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 14,
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  tipIcon: { fontSize: 24 },
  tipContent: { flex: 1 },
  tipTitle: { color: '#fff', fontWeight: '600', fontSize: 13, marginBottom: 4 },
  tipText: { color: '#9ca3af', fontSize: 12, lineHeight: 18 },

  // Empty state
  emptyState: {
    marginHorizontal: 20,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 32,
    alignItems: 'center',
  },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { color: '#fff', fontSize: 16, fontWeight: '600', marginBottom: 8 },
  emptySubtitle: {
    color: '#6b7280',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  emptyButton: {
    backgroundColor: '#d946ef',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  emptyButtonText: { color: '#fff', fontWeight: '600', fontSize: 14 },
});
