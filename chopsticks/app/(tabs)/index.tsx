import { useState, useRef, useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { CUISINE_CATEGORIES, BUDGET_RANGES, HCMC_DISTRICTS } from '@/lib/constants';
import { useRequests } from '@/hooks/queries/useRequests';
import { useI18n } from '@/lib/i18n';
import { FilterSection } from '@/components/request/FilterBar';
import { RequestList } from '@/components/request/RequestList';
import { mediumHaptic } from '@/lib/haptics';

const ALL_OPTION = { id: '__all__', label: 'All' };

export default function HomeScreen() {
  const router = useRouter();
  const { t, language } = useI18n();

  const [activeDistrict, setActiveDistrict] = useState('__all__');
  const [activeCuisine, setActiveCuisine] = useState('__all__');
  const [activeBudget, setActiveBudget] = useState('__all__');

  // Build filter options
  const districtOptions = useMemo(() => [
    { id: '__all__', label: language === 'vi' ? 'Tất cả' : 'All Areas' },
    ...HCMC_DISTRICTS.map(d => ({ id: d.id, label: language === 'vi' ? d.nameVi : d.name })),
  ], [language]);

  const cuisineOptions = useMemo(() => [
    { id: '__all__', label: language === 'vi' ? 'Tất cả' : 'All' },
    ...CUISINE_CATEGORIES.map(c => ({ id: c.id, label: language === 'vi' ? c.labelVi : c.label })),
  ], [language]);

  const budgetOptions = useMemo(() => [
    { id: '__all__', label: language === 'vi' ? 'Tất cả' : 'Any' },
    ...BUDGET_RANGES.map(b => ({ id: b.id, label: language === 'vi' ? b.labelVi : b.label })),
  ], [language]);

  // Build API filters (undefined means no filter)
  const filters = useMemo(() => ({
    district: activeDistrict !== '__all__' ? activeDistrict : undefined,
    cuisine: activeCuisine !== '__all__' ? activeCuisine : undefined,
    budget_range: activeBudget !== '__all__' ? activeBudget : undefined,
  }), [activeDistrict, activeCuisine, activeBudget]);

  const { data: requests, isLoading } = useRequests(filters);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0a0a0a' }} edges={['left', 'right']}>
      <RequestList
        requests={requests ?? []}
        isLoading={isLoading}
        onPressRequest={(id) => router.push({ pathname: '/(screens)/request-detail', params: { requestId: id } })}
        language={language}
        emptyTitle={t('noMatchingRequests')}
        emptySubtitle={t('tryAdjustingFilters')}
        header={
          <View style={{ paddingTop: 8, paddingBottom: 8 }}>
            <FilterSection
              title={t('filterArea')}
              options={districtOptions}
              active={activeDistrict}
              onSelect={setActiveDistrict}
            />
            <FilterSection
              title={t('filterCuisine')}
              options={cuisineOptions}
              active={activeCuisine}
              onSelect={setActiveCuisine}
            />
            <FilterSection
              title={t('filterBudget')}
              options={budgetOptions}
              active={activeBudget}
              onSelect={setActiveBudget}
            />
          </View>
        }
      />

      {/* FAB create request */}
      <PulsingFAB onPress={() => {
        mediumHaptic();
        router.push('/(screens)/create-request');
      }} />
    </SafeAreaView>
  );
}

function PulsingFAB({ onPress }: { onPress: () => void }) {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.08, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        bottom: 24,
        right: 16,
        transform: [{ scale: pulseAnim }],
      }}
    >
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.8}
        style={{
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: '#f97316',
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: '#f97316',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.4,
          shadowRadius: 8,
          elevation: 8,
        }}
      >
        <Text style={{ color: '#fff', fontSize: 28, fontWeight: '300', marginTop: -2 }}>+</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}
