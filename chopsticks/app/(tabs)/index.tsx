import { useState, useRef, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, FlatList, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MOCK_REQUESTS, TIME_FILTERS, BUDGET_FILTERS, DISTRICT_FILTERS, type MealRequest } from '@/lib/mockData';
import { CUISINE_CATEGORIES } from '@/lib/constants';
import { useI18n, getFilterLabelMap } from '@/lib/i18n';

const CUISINE_FILTERS = ['All', ...CUISINE_CATEGORIES.map(c => c.label)];

const GROUP_SIZE_FILTERS = ['Any Size', '2', '3', '4'];

function FilterSection({ title, options, active, onSelect, labelMap }: {
  title: string;
  options: string[];
  active: string;
  onSelect: (option: string) => void;
  labelMap?: Record<string, string>;
}) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ color: '#9ca3af', fontSize: 12, fontWeight: '600', marginBottom: 8, marginLeft: 4 }}>
        {title}
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {options.map(option => (
          <TouchableOpacity
            key={option}
            onPress={() => onSelect(option)}
            style={{
              paddingHorizontal: 14,
              paddingVertical: 8,
              borderRadius: 20,
              marginRight: 8,
              backgroundColor: active === option ? '#f97316' : '#262626',
            }}
          >
            <Text style={{ color: active === option ? '#fff' : '#9ca3af', fontSize: 13, fontWeight: '500' }}>
              {labelMap?.[option] ?? option}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}


function RequestListItem({ request, onPress }: { request: MealRequest; onPress: () => void }) {
  const { t } = useI18n();
  const spotsLeft = request.spotsTotal - request.spotsTaken;
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={{
        backgroundColor: '#171717',
        borderRadius: 12,
        padding: 14,
        marginBottom: 10,
        flexDirection: 'row',
        alignItems: 'center',
      }}
    >
      <View style={{
        width: 48, height: 48, borderRadius: 24,
        backgroundColor: '#262626', alignItems: 'center', justifyContent: 'center', marginRight: 12,
      }}>
        <Text style={{ fontSize: 22 }}>{request.cuisineEmoji}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ color: '#fff', fontSize: 15, fontWeight: '600' }}>{request.restaurant.name}</Text>
        <Text style={{ color: '#9ca3af', fontSize: 12, marginTop: 2 }}>
          {request.cuisine} · {request.timeWindow} · {spotsLeft} {t('spots').toLowerCase()}
        </Text>
        <Text style={{ color: '#6b7280', fontSize: 12, marginTop: 2 }}>
          {t('by')} {request.requester.name} · {request.joinType === 'open' ? t('openJoin') : t('approvalNeeded')}
        </Text>
      </View>
      <Text style={{ color: '#4b5563', fontSize: 18 }}>›</Text>
    </TouchableOpacity>
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

export default function HomeScreen() {
  const router = useRouter();
  const { t, language } = useI18n();
  const filterLabels = getFilterLabelMap(language);
  const [activeDistrict, setActiveDistrict] = useState('All Areas');
  const [activeTime, setActiveTime] = useState('Any Time');
  const [activeBudget, setActiveBudget] = useState('Any');
  const [activeGroupSize, setActiveGroupSize] = useState('Any Size');
  const [activeCuisine, setActiveCuisine] = useState('All');

  const filteredRequests = MOCK_REQUESTS.filter(request => {
    // District filter
    if (activeDistrict !== 'All Areas' && request.restaurant.district !== activeDistrict) {
      return false;
    }

    // Budget filter
    if (activeBudget !== 'Any') {
      const budgetMap: Record<string, string> = {
        'Under 50k': 'under_50k',
        '50k-150k': '50k_150k',
        '150k-500k': '150k_500k',
        '500k+': '500k_plus',
      };
      const budgetRangeValue = budgetMap[activeBudget];
      if (budgetRangeValue && request.restaurant.budgetRange !== budgetRangeValue) {
        return false;
      }
    }

    // Time filter
    if (activeTime !== 'Any Time') {
      const timeStr = request.timeWindow;
      const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
      if (match) {
        let hour = parseInt(match[1]);
        const ampm = match[3].toUpperCase();
        if (ampm === 'PM' && hour !== 12) hour += 12;
        if (ampm === 'AM' && hour === 12) hour = 0;
        const isToday = timeStr.toLowerCase().startsWith('today');
        let slot: string;
        if (isToday && hour >= 0 && hour <= 2) slot = 'ASAP';
        else if (hour >= 5 && hour < 9) slot = 'Morning';
        else if (hour >= 9 && hour < 14) slot = 'Midday';
        else if (hour >= 14 && hour < 18) slot = 'Afternoon';
        else if (hour >= 18 && hour < 22) slot = 'Evening';
        else slot = 'Late Night';
        if (activeTime === 'ASAP' && !isToday) return false;
        else if (activeTime !== 'ASAP' && slot !== activeTime) return false;
      }
    }

    // Cuisine filter
    if (activeCuisine !== 'All') {
      const matchedCat = CUISINE_CATEGORIES.find(c => c.label === activeCuisine);
      if (matchedCat && request.cuisineId !== matchedCat.id) return false;
    }

    // Group size filter
    if (activeGroupSize !== 'Any Size') {
      const totalGroup = request.spotsTotal;
      const targetSize = parseInt(activeGroupSize);
      if (!isNaN(targetSize) && totalGroup !== targetSize) return false;
    }

    return true;
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0a0a0a' }} edges={['left', 'right']}>
      <FlatList
        data={filteredRequests}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
        ListHeaderComponent={
          <View style={{ paddingTop: 8, paddingBottom: 8 }}>
            <FilterSection
              title={t('filterArea')}
              options={DISTRICT_FILTERS}
              active={activeDistrict}
              onSelect={setActiveDistrict}
              labelMap={filterLabels.district}
            />
            <FilterSection
              title={t('filterTime')}
              options={TIME_FILTERS}
              active={activeTime}
              onSelect={setActiveTime}
              labelMap={filterLabels.time}
            />
            <FilterSection
              title={t('filterCuisine')}
              options={CUISINE_FILTERS}
              active={activeCuisine}
              onSelect={setActiveCuisine}
              labelMap={filterLabels.cuisine}
            />
            <FilterSection
              title={t('filterBudget')}
              options={BUDGET_FILTERS}
              active={activeBudget}
              onSelect={setActiveBudget}
              labelMap={filterLabels.budget}
            />
            <FilterSection
              title={t('filterGroupSize')}
              options={GROUP_SIZE_FILTERS}
              active={activeGroupSize}
              onSelect={setActiveGroupSize}
              labelMap={filterLabels.groupSize}
            />
          </View>
        }
        renderItem={({ item }) => (
          <RequestListItem request={item} onPress={() => router.push({ pathname: '/(screens)/request-detail', params: { requestId: item.id } })} />
        )}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', paddingTop: 40 }}>
            <Text style={{ fontSize: 40, marginBottom: 12 }}>🍜</Text>
            <Text style={{ color: '#fff', fontSize: 18, fontWeight: '600' }}>{t('noMatchingRequests')}</Text>
            <Text style={{ color: '#6b7280', marginTop: 4, textAlign: 'center' }}>
              {t('tryAdjustingFilters')}
            </Text>
          </View>
        }
      />

      {/* FAB create request with pulse animation */}
      <PulsingFAB onPress={() => router.push('/(screens)/create-request')} />
    </SafeAreaView>
  );
}
