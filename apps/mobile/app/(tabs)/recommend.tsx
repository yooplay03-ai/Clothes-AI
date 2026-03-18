import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ClothingOccasion, OutfitMood } from '@moodfit/shared';

const { width } = Dimensions.get('window');

const OCCASIONS = [
  { key: ClothingOccasion.CASUAL, label: 'Casual', icon: '😊' },
  { key: ClothingOccasion.WORK, label: 'Work', icon: '💼' },
  { key: ClothingOccasion.FORMAL, label: 'Formal', icon: '🎩' },
  { key: ClothingOccasion.SPORT, label: 'Sport', icon: '🏃' },
  { key: ClothingOccasion.OUTDOOR, label: 'Outdoor', icon: '🌿' },
  { key: ClothingOccasion.PARTY, label: 'Party', icon: '🎉' },
  { key: ClothingOccasion.DATE, label: 'Date Night', icon: '💕' },
];

const MOODS = [
  { key: OutfitMood.CONFIDENT, label: 'Confident', icon: '💪' },
  { key: OutfitMood.RELAXED, label: 'Relaxed', icon: '😌' },
  { key: OutfitMood.PROFESSIONAL, label: 'Professional', icon: '👔' },
  { key: OutfitMood.PLAYFUL, label: 'Playful', icon: '🎈' },
  { key: OutfitMood.ROMANTIC, label: 'Romantic', icon: '💝' },
  { key: OutfitMood.ENERGETIC, label: 'Energetic', icon: '⚡' },
  { key: OutfitMood.COZY, label: 'Cozy', icon: '🧣' },
  { key: OutfitMood.ADVENTUROUS, label: 'Adventurous', icon: '🧗' },
];

function SelectionChip({
  icon,
  label,
  selected,
  onPress,
}: {
  icon: string;
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.chip, selected && styles.chipSelected]}
      activeOpacity={0.7}
    >
      <Text style={styles.chipEmoji}>{icon}</Text>
      <Text style={[styles.chipLabel, selected && styles.chipLabelSelected]}>{label}</Text>
    </TouchableOpacity>
  );
}

export default function RecommendScreen() {
  const [occasion, setOccasion] = useState<ClothingOccasion | null>(null);
  const [mood, setMood] = useState<OutfitMood | null>(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [useWeather, setUseWeather] = useState(true);

  const handleGenerate = async () => {
    if (!occasion) return;
    setLoading(true);
    try {
      // Call API
      await new Promise((r) => setTimeout(r, 2000)); // Simulate API call
      // Navigate to results
    } catch (err) {
      // Handle error
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#d946ef" style={{ marginBottom: 20 }} />
        <Text style={styles.loadingTitle}>AI is styling you...</Text>
        <Text style={styles.loadingSubtitle}>
          Analyzing your wardrobe for the perfect outfit
        </Text>
        <View style={styles.loadingSteps}>
          <Text style={styles.loadingStep}>✓ Analyzing weather conditions</Text>
          <Text style={styles.loadingStep}>✓ Reviewing your wardrobe</Text>
          <Text style={styles.loadingStepActive}>⋯ Crafting your outfit</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerEmoji}>🤖</Text>
          <Text style={styles.title}>AI Outfit Stylist</Text>
          <Text style={styles.subtitle}>
            Tell me about your day and I'll pick the perfect outfit from your wardrobe.
          </Text>
        </View>

        {/* Occasion */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            What's the occasion?{' '}
            <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.chipGrid}>
            {OCCASIONS.map((item) => (
              <SelectionChip
                key={item.key}
                icon={item.icon}
                label={item.label}
                selected={occasion === item.key}
                onPress={() => setOccasion(item.key)}
              />
            ))}
          </View>
        </View>

        {/* Mood */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How are you feeling?</Text>
          <View style={styles.chipGrid}>
            {MOODS.map((item) => (
              <SelectionChip
                key={item.key}
                icon={item.icon}
                label={item.label}
                selected={mood === item.key}
                onPress={() => setMood(mood === item.key ? null : item.key)}
              />
            ))}
          </View>
        </View>

        {/* Weather toggle */}
        <View style={styles.section}>
          <View style={styles.weatherToggleRow}>
            <View>
              <Text style={styles.sectionTitle}>Use Today's Weather</Text>
              <Text style={styles.weatherSubtext}>⛅ 구름 조금 · 18°C in 서울</Text>
            </View>
            <TouchableOpacity
              style={[styles.toggle, useWeather && styles.toggleActive]}
              onPress={() => setUseWeather((v) => !v)}
            >
              <View style={[styles.toggleThumb, useWeather && styles.toggleThumbActive]} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Notes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Any specific requests?{' '}
            <Text style={styles.optional}>(optional)</Text>
          </Text>
          <TextInput
            style={styles.notesInput}
            placeholder="e.g., 'Want to look approachable', 'avoid bright colors'..."
            placeholderTextColor="#6b7280"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Generate button */}
        <TouchableOpacity
          style={[styles.generateButton, !occasion && styles.generateButtonDisabled]}
          onPress={handleGenerate}
          disabled={!occasion}
          activeOpacity={0.8}
        >
          <Text style={styles.generateButtonText}>✨ Generate My Outfit</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#030712' },
  loadingContainer: { alignItems: 'center', justifyContent: 'center' },
  loadingTitle: { color: '#fff', fontSize: 22, fontWeight: '700', marginBottom: 8 },
  loadingSubtitle: { color: '#9ca3af', fontSize: 14, textAlign: 'center', marginBottom: 24 },
  loadingSteps: { gap: 8, alignItems: 'flex-start' },
  loadingStep: { color: '#6b7280', fontSize: 14 },
  loadingStepActive: { color: '#d946ef', fontSize: 14 },

  scrollContent: { padding: 20, paddingBottom: 40 },

  // Header
  header: { alignItems: 'center', marginBottom: 28, paddingTop: 8 },
  headerEmoji: { fontSize: 48, marginBottom: 12 },
  title: { fontSize: 26, fontWeight: '700', color: '#fff', marginBottom: 8 },
  subtitle: {
    color: '#9ca3af',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },

  // Section
  section: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  sectionTitle: { color: '#fff', fontSize: 15, fontWeight: '600', marginBottom: 12 },
  required: { color: '#ef4444' },
  optional: { color: '#6b7280', fontWeight: '400', fontSize: 13 },

  // Chips
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  chipSelected: {
    backgroundColor: 'rgba(217,70,239,0.2)',
    borderColor: 'rgba(217,70,239,0.5)',
  },
  chipEmoji: { fontSize: 16 },
  chipLabel: { color: '#9ca3af', fontSize: 13, fontWeight: '500' },
  chipLabelSelected: { color: '#e879f9' },

  // Weather toggle
  weatherToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  weatherSubtext: { color: '#6b7280', fontSize: 12, marginTop: 2 },
  toggle: {
    width: 48,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.15)',
    padding: 3,
    justifyContent: 'center',
  },
  toggleActive: { backgroundColor: '#d946ef' },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
  },
  toggleThumbActive: { alignSelf: 'flex-end' },

  // Notes
  notesInput: {
    color: '#fff',
    fontSize: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 12,
    minHeight: 80,
    textAlignVertical: 'top',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },

  // Generate button
  generateButton: {
    backgroundColor: '#d946ef',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#d946ef',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  generateButtonDisabled: {
    backgroundColor: 'rgba(217,70,239,0.3)',
    shadowOpacity: 0,
    elevation: 0,
  },
  generateButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
