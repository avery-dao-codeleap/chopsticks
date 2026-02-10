import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { useUser, useUpdatePreferences } from '@/hooks/queries/useUser';
import { CUISINE_CATEGORIES, BUDGET_RANGES } from '@/lib/constants';
import { supabase } from '@/services/supabase';
import { useI18n } from '@/lib/i18n';

const BUDGET_OPTIONS = BUDGET_RANGES.map(br => ({
  label: br.label,
  value: br.id,
  emoji: br.id === 'under_50k' ? '💵' : br.id === '50k_150k' ? '💰' : br.id === '150k_500k' ? '💳' : '💎',
  desc: br.label,
}));

export default function EditPreferencesScreen() {
  const router = useRouter();
  const { t } = useI18n();

  const [currentUserId, setCurrentUserId] = useState<string>('');
  const { data: user, isLoading } = useUser(currentUserId);
  const updatePreferencesMutation = useUpdatePreferences();

  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);
  const [selectedBudgets, setSelectedBudgets] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Get current user ID
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setCurrentUserId(data.user.id);
    });
  }, []);

  // Pre-populate form with current preferences
  useEffect(() => {
    if (user?.user_preferences) {
      setSelectedCuisines(user.user_preferences.cuisines || []);
      setSelectedBudgets(user.user_preferences.budget_ranges || []);
    }
  }, [user]);

  const toggle = (item: string, list: string[], setList: (v: string[]) => void) => {
    setList(list.includes(item) ? list.filter(i => i !== item) : [...list, item]);
  };

  const handleSave = async () => {
    if (selectedCuisines.length === 0) {
      Alert.alert('Cuisines Required', 'Please select at least one cuisine preference', [
        { text: 'OK' },
      ]);
      return;
    }

    if (selectedBudgets.length === 0) {
      Alert.alert('Budget Required', 'Please select at least one budget range', [{ text: 'OK' }]);
      return;
    }

    setIsProcessing(true);
    try {
      await updatePreferencesMutation.mutateAsync({
        userId: currentUserId,
        preferences: {
          cuisines: selectedCuisines,
          budget_ranges: selectedBudgets,
        },
      });

      Alert.alert('Success', 'Preferences updated successfully', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to save preferences. Please try again.', [{ text: 'OK' }]);
      console.error('Preferences save error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={s.container} edges={['left', 'right']}>
        <Stack.Screen
          options={{
            headerTitle: t('preferences') || 'Food Preferences',
            headerBackTitle: 'Back',
          }}
        />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color="#f97316" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.container} edges={['left', 'right']}>
      <Stack.Screen
        options={{
          headerTitle: t('preferences') || 'Food Preferences',
          headerBackTitle: 'Back',
        }}
      />
      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
        <View style={s.content}>
          {/* Cuisines */}
          <Text style={s.sectionTitle}>What do you like to eat?</Text>
          <View style={s.chipWrap}>
            {CUISINE_CATEGORIES.map(c => (
              <TouchableOpacity
                key={c.id}
                style={[s.chip, selectedCuisines.includes(c.id) && s.chipActive]}
                onPress={() => toggle(c.id, selectedCuisines, setSelectedCuisines)}
              >
                <Text style={{ color: selectedCuisines.includes(c.id) ? '#fff' : '#d1d5db' }}>
                  {c.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Budget */}
          <Text style={s.sectionTitle}>Budget per meal</Text>
          <View style={{ gap: 8, marginBottom: 32 }}>
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
                    <Text style={{ color: active ? '#fff' : '#d1d5db', fontWeight: '500' }}>
                      {o.label}
                    </Text>
                    <Text style={{ color: active ? 'rgba(255,255,255,0.7)' : '#6b7280', fontSize: 12 }}>
                      {o.desc}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={[s.button, isProcessing && { opacity: 0.6 }]}
            onPress={handleSave}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text style={s.buttonText}>Save Changes</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  scroll: { flex: 1, paddingHorizontal: 24 },
  content: { paddingVertical: 24 },
  sectionTitle: { color: '#fff', fontSize: 17, fontWeight: '600', marginBottom: 12 },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 28 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#171717',
  },
  chipActive: { backgroundColor: '#f97316' },
  budgetCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#171717',
  },
  budgetCardActive: { backgroundColor: '#f97316' },
  button: {
    backgroundColor: '#f97316',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 18 },
});
