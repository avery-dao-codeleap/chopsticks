import { useState, useRef, useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { CUISINE_CATEGORIES, BUDGET_RANGES, HCMC_DISTRICTS } from '@/lib/constants';
import { useRequests } from '@/hooks/queries/useRequests';
import { useI18n } from '@/lib/i18n';
import { FilterSection, MultiSelectFilterSection } from '@/components/request/FilterBar';
import { RequestList } from '@/components/request/RequestList';
import { mediumHaptic } from '@/lib/haptics';

const ALL_OPTION = { id: '__all__', label: 'All' };

export default function HomeScreen() {
  const router = useRouter();
  const { t, language } = useI18n();

  const [selectedDistricts, setSelectedDistricts] = useState<string[]>(['__all__']);
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>(['__all__']);
  const [selectedBudgets, setSelectedBudgets] = useState<string[]>(['__all__']);
  const [selectedTimes, setSelectedTimes] = useState<string[]>(['__all__']);
  const [activeAvailability, setActiveAvailability] = useState('all');

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

  const timeOptions = useMemo(() => [
    { id: '__all__', label: language === 'vi' ? 'Tất cả' : 'All' },
    { id: 'asap', label: language === 'vi' ? '🕐 Ngay' : '🕐 ASAP' },
    { id: 'breakfast', label: language === 'vi' ? '🍳 Sáng' : '🍳 Breakfast' },
    { id: 'lunch', label: language === 'vi' ? '🍜 Trưa' : '🍜 Lunch' },
    { id: 'dinner', label: language === 'vi' ? '🍲 Tối' : '🍲 Dinner' },
  ], [language]);

  const availabilityOptions = useMemo(() => [
    { id: 'all', label: language === 'vi' ? 'Tất cả' : 'All' },
    { id: 'available', label: language === 'vi' ? '✅ Còn chỗ' : '✅ Has Spots' },
    { id: 'open', label: language === 'vi' ? '🚪 Vào tự do' : '🚪 Open Join' },
  ], [language]);

  // Toggle handlers for multi-select filters
  const toggleFilter = (selected: string[], setSelected: (val: string[]) => void, id: string, allOptions: any[]) => {
    if (id === '__all__') {
      // If "All" is clicked, select only "All"
      setSelected(['__all__']);
    } else {
      // Remove "All" if it's selected
      let newSelected = selected.filter(s => s !== '__all__');

      if (newSelected.includes(id)) {
        // Deselect this option
        newSelected = newSelected.filter(s => s !== id);
        // If nothing selected, revert to "All"
        if (newSelected.length === 0) {
          newSelected = ['__all__'];
        }
      } else {
        // Select this option
        newSelected = [...newSelected, id];
      }

      setSelected(newSelected);
    }
  };

  const handleToggleDistrict = (id: string) => toggleFilter(selectedDistricts, setSelectedDistricts, id, districtOptions);
  const handleToggleCuisine = (id: string) => toggleFilter(selectedCuisines, setSelectedCuisines, id, cuisineOptions);
  const handleToggleBudget = (id: string) => toggleFilter(selectedBudgets, setSelectedBudgets, id, budgetOptions);
  const handleToggleTime = (id: string) => toggleFilter(selectedTimes, setSelectedTimes, id, timeOptions);

  // Build API filters (undefined means no filter)
  // Note: API doesn't support multi-value filters, so we'll filter client-side for multi-select
  const filters = useMemo(() => ({
    district: undefined, // Will filter client-side
    cuisine: undefined, // Will filter client-side
    budget_range: undefined, // Will filter client-side
  }), []);

  const { data: requests, isLoading } = useRequests(filters);

  // Client-side filtering for all filters
  const filteredRequests = useMemo(() => {
    if (!requests) return [];

    let filtered = [...requests];

    // Filter by district (multi-select)
    if (!selectedDistricts.includes('__all__')) {
      filtered = filtered.filter(r => selectedDistricts.includes(r.restaurants.district));
    }

    // Filter by cuisine (multi-select)
    if (!selectedCuisines.includes('__all__')) {
      filtered = filtered.filter(r => selectedCuisines.includes(r.cuisine));
    }

    // Filter by budget (multi-select)
    if (!selectedBudgets.includes('__all__')) {
      filtered = filtered.filter(r => selectedBudgets.includes(r.budget_range));
    }

    // Filter by time (multi-select)
    if (!selectedTimes.includes('__all__')) {
      const now = new Date();
      filtered = filtered.filter(r => {
        const mealTime = new Date(r.time_window);
        const hoursDiff = (mealTime.getTime() - now.getTime()) / (1000 * 60 * 60);
        const mealHour = mealTime.getHours();

        return selectedTimes.some(timeFilter => {
          switch (timeFilter) {
            case 'asap':
              return hoursDiff >= 0 && hoursDiff <= 2; // Within next 2 hours
            case 'breakfast':
              return mealHour >= 6 && mealHour < 11;
            case 'lunch':
              return mealHour >= 11 && mealHour < 15;
            case 'dinner':
              return mealHour >= 17 && mealHour < 22;
            default:
              return false;
          }
        });
      });
    }

    // Filter by availability (single-select)
    if (activeAvailability === 'available') {
      // Only show requests with available spots
      filtered = filtered.filter(r => {
        const spotsLeft = r.group_size - r.participant_count - 1; // -1 for requester
        return spotsLeft > 0;
      });
    } else if (activeAvailability === 'open') {
      // Only show open join requests
      filtered = filtered.filter(r => r.join_type === 'open');
    }

    return filtered;
  }, [requests, selectedDistricts, selectedCuisines, selectedBudgets, selectedTimes, activeAvailability]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0a0a0a' }} edges={['left', 'right']}>
      <RequestList
        requests={filteredRequests}
        isLoading={isLoading}
        onPressRequest={(id) => router.push({ pathname: '/(screens)/request-detail', params: { requestId: id } })}
        language={language}
        emptyTitle={t('noMatchingRequests')}
        emptySubtitle={t('tryAdjustingFilters')}
        header={
          <View style={{ paddingTop: 8, paddingBottom: 8 }}>
            <MultiSelectFilterSection
              title={language === 'vi' ? '⏰ Thời gian' : '⏰ Time'}
              options={timeOptions}
              selected={selectedTimes}
              onToggle={handleToggleTime}
            />
            <MultiSelectFilterSection
              title={language === 'vi' ? '📍 Khu vực' : '📍 Area'}
              options={districtOptions}
              selected={selectedDistricts}
              onToggle={handleToggleDistrict}
            />
            <MultiSelectFilterSection
              title={language === 'vi' ? '🍽️ Món ăn' : '🍽️ Cuisine'}
              options={cuisineOptions}
              selected={selectedCuisines}
              onToggle={handleToggleCuisine}
            />
            <MultiSelectFilterSection
              title={language === 'vi' ? '💰 Ngân sách' : '💰 Budget'}
              options={budgetOptions}
              selected={selectedBudgets}
              onToggle={handleToggleBudget}
            />
            <FilterSection
              title={language === 'vi' ? '👥 Chỗ trống' : '👥 Availability'}
              options={availabilityOptions}
              active={activeAvailability}
              onSelect={setActiveAvailability}
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
