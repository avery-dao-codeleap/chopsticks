import { useState, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useListRestaurants, useUserVisits, useToggleVisit, useCuratedLists, useUserLists } from '@/lib/hooks/queries/useLists';
import { SaveToListSheet } from '@/lib/components/lists/SaveToListSheet';
import { mediumHaptic } from '@/lib/haptics';

const CUISINE_EMOJIS: Record<string, string> = {
  noodles_congee: '🍜', rice: '🍚', hotpot_grill: '🍲', seafood: '🦐',
  bread: '🥖', vietnamese_cakes: '🍰', snack: '🍿', dessert: '🍨',
  drinks: '☕', fast_food: '🍔', international: '🌍', healthy: '🥗',
  veggie: '🥦', others: '🍽️',
};

type ListFilters = {
  cuisines: string[];
  districts: string[];
  status: 'all' | 'visited' | 'not_visited';
};

function FilterPill({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, marginRight: 8,
        backgroundColor: active ? '#f97316' : '#262626',
      }}
    >
      <Text style={{ color: active ? '#fff' : '#9ca3af', fontSize: 13, fontWeight: active ? '600' : '400' }}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function ProgressHeader({ visited, total }: { visited: number; total: number }) {
  const pct = total > 0 ? (visited / total) * 100 : 0;
  return (
    <View style={{ backgroundColor: '#171717', padding: 14, marginBottom: 8, borderRadius: 10 }}>
      <Text style={{ color: '#9ca3af', fontSize: 12, marginBottom: 6 }}>Your progress</Text>
      <View style={{ height: 6, backgroundColor: '#262626', borderRadius: 3, overflow: 'hidden', marginBottom: 6 }}>
        <View style={{ height: 6, backgroundColor: '#f97316', borderRadius: 3, width: `${pct}%` }} />
      </View>
      <Text style={{ color: '#6b7280', fontSize: 12 }}>
        <Text style={{ color: '#f97316', fontWeight: '600' }}>{visited}</Text> of {total} visited
      </Text>
    </View>
  );
}

export default function ListDetailScreen() {
  const { listId, listType } = useLocalSearchParams<{ listId: string; listType: string }>();
  const router = useRouter();
  const isCurated = listType === 'curated';

  const { data: items = [], isLoading } = useListRestaurants(listId);
  const { data: userVisits = [] } = useUserVisits();
  const toggleVisit = useToggleVisit();

  const { data: curatedLists = [] } = useCuratedLists();
  const { data: userLists = [] } = useUserLists();
  const listInfo = isCurated
    ? curatedLists.find(l => l.id === listId)
    : userLists.find(l => l.id === listId);

  const visitedIds = new Set(userVisits.map(v => v.restaurant_id));

  const [filters, setFilters] = useState<ListFilters>({ cuisines: [], districts: [], status: 'all' });
  const [saveSheetRestaurant, setSaveSheetRestaurant] = useState<{ id: string; name: string; cuisine_type: string } | null>(null);

  const availableCuisines = useMemo(() => [...new Set(items.map(i => i.restaurants.cuisine_type))], [items]);
  const availableDistricts = useMemo(() => [...new Set(items.map(i => i.restaurants.district))], [items]);

  const toggleFilter = <K extends 'cuisines' | 'districts'>(key: K, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: prev[key].includes(value) ? prev[key].filter(v => v !== value) : [...prev[key], value],
    }));
  };

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const { cuisine_type, district } = item.restaurants;
      if (filters.cuisines.length && !filters.cuisines.includes(cuisine_type)) return false;
      if (filters.districts.length && !filters.districts.includes(district)) return false;
      if (filters.status === 'visited' && !visitedIds.has(item.restaurant_id)) return false;
      if (filters.status === 'not_visited' && visitedIds.has(item.restaurant_id)) return false;
      return true;
    });
  }, [items, filters, visitedIds]);

  const visitedCount = items.filter(i => visitedIds.has(i.restaurant_id)).length;

  const handleToggleVisit = async (restaurantId: string) => {
    mediumHaptic();
    await toggleVisit.mutateAsync({ restaurantId, currentlyVisited: visitedIds.has(restaurantId) });
  };

  const title = listInfo
    ? (isCurated ? `🏆 ${listInfo.title}` : `${(listInfo as { emoji?: string | null }).emoji ?? '📌'} ${listInfo.title}`)
    : '...';

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0a0a0a', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#f97316" />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0a0a0a' }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#1f1f1f' }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
          <FontAwesome name="chevron-left" size={18} color="#fff" />
        </TouchableOpacity>
        <Text style={{ flex: 1, color: '#fff', fontSize: 16, fontWeight: '700' }} numberOfLines={1}>{title}</Text>
      </View>

      <FlatList
        data={filteredItems}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingBottom: 40 }}
        ListHeaderComponent={
          <View style={{ padding: 16 }}>
            {isCurated && <ProgressHeader visited={visitedCount} total={items.length} />}

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
              {isCurated && (
                <>
                  <FilterPill label="All" active={filters.status === 'all'} onPress={() => setFilters(f => ({ ...f, status: 'all' }))} />
                  <FilterPill label="Been There" active={filters.status === 'visited'} onPress={() => setFilters(f => ({ ...f, status: 'visited' }))} />
                  <FilterPill label="Not Yet" active={filters.status === 'not_visited'} onPress={() => setFilters(f => ({ ...f, status: 'not_visited' }))} />
                  <View style={{ width: 1, backgroundColor: '#262626', marginRight: 8 }} />
                </>
              )}
              {availableCuisines.length > 1 && availableCuisines.map(c => (
                <FilterPill key={c} label={c.replace(/_/g, ' ')} active={filters.cuisines.includes(c)} onPress={() => toggleFilter('cuisines', c)} />
              ))}
              {availableDistricts.length > 1 && availableDistricts.map(d => (
                <FilterPill key={d} label={d} active={filters.districts.includes(d)} onPress={() => toggleFilter('districts', d)} />
              ))}
            </ScrollView>

            <Text style={{ color: '#6b7280', fontSize: 12 }}>
              {filteredItems.length} restaurant{filteredItems.length !== 1 ? 's' : ''}
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const isVisited = visitedIds.has(item.restaurant_id);
          const emoji = CUISINE_EMOJIS[item.restaurants.cuisine_type] ?? '🍽️';

          return (
            <View style={{ paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#1f1f1f', flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
              {isCurated && item.rank != null && (
                <Text style={{ color: '#f97316', fontWeight: '700', fontSize: 15, minWidth: 24 }}>#{item.rank}</Text>
              )}
              {!isCurated && <Text style={{ fontSize: 22 }}>{emoji}</Text>}

              <View style={{ flex: 1 }}>
                <TouchableOpacity onPress={() => router.push({ pathname: '/(screens)/restaurant-detail', params: { restaurantId: item.restaurant_id } })}>
                  <Text style={{ color: '#fff', fontSize: 15, fontWeight: '600', marginBottom: 2 }}>{item.restaurants.name}</Text>
                </TouchableOpacity>
                <Text style={{ color: '#6b7280', fontSize: 12 }}>📍 {item.restaurants.district}</Text>

                <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
                  {isCurated ? (
                    <>
                      <TouchableOpacity
                        onPress={() => handleToggleVisit(item.restaurant_id)}
                        style={{
                          paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8,
                          backgroundColor: isVisited ? '#f97316' : '#262626',
                        }}
                      >
                        <Text style={{ color: '#fff', fontSize: 12, fontWeight: '500' }}>
                          {isVisited ? '✓ Been There' : 'Mark Visited'}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => setSaveSheetRestaurant({ ...item.restaurants, id: item.restaurant_id })}
                        style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: '#262626' }}
                      >
                        <Text style={{ color: '#9ca3af', fontSize: 12 }}>📌 Save ▾</Text>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <TouchableOpacity
                      onPress={() => router.push({ pathname: '/(screens)/create-request', params: { restaurantId: item.restaurant_id } })}
                      style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: '#262626' }}
                    >
                      <Text style={{ color: '#f97316', fontSize: 12, fontWeight: '500' }}>🍽️ Create Request</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          );
        }}
      />

      <SaveToListSheet
        visible={!!saveSheetRestaurant}
        restaurant={saveSheetRestaurant}
        onClose={() => setSaveSheetRestaurant(null)}
      />
    </SafeAreaView>
  );
}
