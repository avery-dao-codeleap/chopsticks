import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native';
import { useAuthStore } from '@/stores/auth';
import { CUISINE_CATEGORIES, BUDGET_RANGES } from '@/lib/constants';

const BUDGET_OPTIONS = BUDGET_RANGES.map(br => ({
  label: br.label,
  value: br.id,
  emoji: br.id === 'under_50k' ? '💵' : br.id === '50k_150k' ? '💰' : br.id === '150k_500k' ? '💳' : '💎',
  desc: br.label,
}));

export default function PreferencesScreen() {
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);
  const [selectedBudgets, setSelectedBudgets] = useState<string[]>([]);
  const { updatePreferences, setOnboarded } = useAuthStore();

  const toggle = (item: string, list: string[], setList: (v: string[]) => void) => {
    setList(list.includes(item) ? list.filter(i => i !== item) : [...list, item]);
  };

  const handleFinish = async () => {
    await updatePreferences({
      cuisines: selectedCuisines.length > 0 ? selectedCuisines : ['noodles_congee'],
      budget_ranges: selectedBudgets.length > 0 ? selectedBudgets : ['50k_150k'],
    });
    setOnboarded(true);
  };

  return (
    <SafeAreaView style={s.container}>
      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
        <View style={s.content}>
          <Text style={s.heading}>Food Preferences</Text>
          <Text style={s.subtext}>Help us find better matches for you</Text>

          {/* Cuisines */}
          <Text style={s.sectionTitle}>What do you like to eat?</Text>
          <View style={s.chipWrap}>
            {CUISINE_CATEGORIES.map(c => (
              <TouchableOpacity
                key={c.id}
                style={[s.chip, selectedCuisines.includes(c.id) && s.chipActive]}
                onPress={() => toggle(c.id, selectedCuisines, setSelectedCuisines)}
              >
                <Text style={{ color: selectedCuisines.includes(c.id) ? '#fff' : '#d1d5db' }}>{c.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Budget */}
          <Text style={s.sectionTitle}>Budget per meal (select one or more)</Text>
          <View style={{ gap: 8, marginBottom: 28 }}>
            {BUDGET_OPTIONS.map(o => {
              const active = selectedBudgets.includes(o.value);
              return (
                <TouchableOpacity
                  key={o.label}
                  style={[s.budgetCard, active && s.budgetCardActive]}
                  onPress={() => toggle(o.value, selectedBudgets, setSelectedBudgets)}
                >
                  <Text style={{ fontSize: 22, marginRight: 12 }}>{o.emoji}</Text>
                  <View>
                    <Text style={{ color: active ? '#fff' : '#d1d5db', fontWeight: '500' }}>{o.label}</Text>
                    <Text style={{ color: active ? 'rgba(255,255,255,0.7)' : '#6b7280', fontSize: 12 }}>{o.desc}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Finish */}
          <TouchableOpacity style={s.button} onPress={handleFinish}>
            <Text style={s.buttonText}>Let's Go!</Text>
          </TouchableOpacity>

          <View style={s.progressRow}>
            <View style={[s.progressDot, s.progressActive]} />
            <View style={[s.progressDot, s.progressActive]} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  scroll: { flex: 1, paddingHorizontal: 24 },
  content: { paddingVertical: 32 },
  heading: { color: '#fff', fontSize: 28, fontWeight: '800', marginBottom: 8 },
  subtext: { color: '#9ca3af', fontSize: 15, marginBottom: 32 },
  sectionTitle: { color: '#fff', fontSize: 17, fontWeight: '600', marginBottom: 12 },
  optional: { color: '#6b7280', fontSize: 13, marginBottom: 10, marginTop: -8 },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 28 },
  chip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, backgroundColor: '#171717' },
  chipActive: { backgroundColor: '#f97316' },
  budgetCard: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16,
    paddingVertical: 14, borderRadius: 12, backgroundColor: '#171717',
  },
  budgetCardActive: { backgroundColor: '#f97316' },
  button: { backgroundColor: '#f97316', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 18 },
  progressRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 28, gap: 8 },
  progressDot: { width: 32, height: 6, borderRadius: 3, backgroundColor: '#262626' },
  progressActive: { backgroundColor: '#f97316' },
});
