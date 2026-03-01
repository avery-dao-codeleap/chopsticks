import { useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useCuratedLists, useUserLists, useUserVisits, useListRestaurants, useSearchRestaurants } from '@/lib/hooks/queries/useLists';
import { CreateListSheet } from '@/lib/components/lists/CreateListSheet';

// Progress bar for curated lists
function ProgressBar({ fraction }: { fraction: number }) {
  return (
    <View style={{ height: 4, backgroundColor: '#262626', borderRadius: 2, overflow: 'hidden' }}>
      <View style={{ height: 4, backgroundColor: '#f97316', borderRadius: 2, width: `${Math.min(fraction * 100, 100)}%` }} />
    </View>
  );
}

function CuratedListCard({ list, visitedIds }: {
  list: { id: string; title: string; category: string | null };
  visitedIds: Set<string>;
}) {
  const router = useRouter();
  const { data: items = [] } = useListRestaurants(list.id);
  const visitedCount = items.filter(r => visitedIds.has(r.restaurant_id)).length;
  const total = items.length;

  return (
    <TouchableOpacity
      onPress={() => router.push({ pathname: '/(screens)/list-detail', params: { listId: list.id, listType: 'curated' } })}
      style={{ backgroundColor: '#171717', borderRadius: 12, padding: 14, marginBottom: 10 }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
        <Text style={{ color: '#fff', fontSize: 15, fontWeight: '600', flex: 1 }}>🏆 {list.title}</Text>
        <FontAwesome name="chevron-right" size={12} color="#6b7280" style={{ marginTop: 3 }} />
      </View>
      <Text style={{ color: '#6b7280', fontSize: 12, marginBottom: 8 }}>
        {total} spots{list.category ? ` · ${list.category}` : ''}
      </Text>
      <ProgressBar fraction={total > 0 ? visitedCount / total : 0} />
      <Text style={{ color: '#6b7280', fontSize: 11, marginTop: 4 }}>
        <Text style={{ color: '#f97316', fontWeight: '600' }}>{visitedCount}</Text> of {total} visited
      </Text>
    </TouchableOpacity>
  );
}

function SearchResults({ query, onClose }: { query: string; onClose: () => void }) {
  const router = useRouter();
  const { data: results = [], isLoading } = useSearchRestaurants(query);

  if (isLoading) return <ActivityIndicator size="small" color="#f97316" style={{ marginTop: 20 }} />;
  if (!results.length) return <Text style={{ color: '#6b7280', textAlign: 'center', marginTop: 20 }}>No restaurants found</Text>;

  return (
    <FlatList
      data={results}
      keyExtractor={item => item.id}
      keyboardShouldPersistTaps="handled"
      renderItem={({ item }) => (
        <TouchableOpacity
          onPress={() => {
            onClose();
            router.push({ pathname: '/(screens)/restaurant-detail', params: { restaurantId: item.id } });
          }}
          style={{ paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#1f1f1f' }}
        >
          <Text style={{ color: '#fff', fontSize: 15 }}>{item.name}</Text>
          <Text style={{ color: '#6b7280', fontSize: 12, marginTop: 2 }}>📍 {item.district} · {item.cuisine_type.replace(/_/g, ' ')}</Text>
        </TouchableOpacity>
      )}
    />
  );
}

export default function ExploreTab() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showCreateList, setShowCreateList] = useState(false);

  const { data: curatedLists = [], isLoading: loadingCurated } = useCuratedLists();
  const { data: userLists = [], isLoading: loadingPersonal } = useUserLists();
  const { data: userVisits = [] } = useUserVisits();
  const visitedIds = new Set(userVisits.map(v => v.restaurant_id));

  const handleSearchFocus = useCallback(() => setIsSearching(true), []);
  const handleSearchClose = useCallback(() => {
    setIsSearching(false);
    setSearchQuery('');
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0a0a0a' }} edges={['bottom']}>
      {/* Search bar */}
      <View style={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#171717', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, gap: 8 }}>
          <FontAwesome name="search" size={14} color="#6b7280" />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFocus={handleSearchFocus}
            placeholder="Search restaurants, dishes..."
            placeholderTextColor="#6b7280"
            style={{ flex: 1, color: '#fff', fontSize: 14 }}
          />
          {isSearching && (
            <TouchableOpacity onPress={handleSearchClose}>
              <Text style={{ color: '#f97316', fontSize: 14 }}>Cancel</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Search results overlay */}
      {isSearching ? (
        <View style={{ flex: 1, paddingHorizontal: 16, paddingTop: 8 }}>
          {searchQuery.length > 1 && <SearchResults query={searchQuery} onClose={handleSearchClose} />}
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}>
          {/* My Lists section */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, marginBottom: 10 }}>
            <Text style={{ color: '#fff', fontSize: 17, fontWeight: '700' }}>My Lists</Text>
            <TouchableOpacity onPress={() => router.push('/(screens)/my-lists')}>
              <Text style={{ color: '#6b7280', fontSize: 13 }}>See all</Text>
            </TouchableOpacity>
          </View>

          {loadingPersonal ? (
            <ActivityIndicator size="small" color="#f97316" />
          ) : (
            <>
              {userLists.slice(0, 3).map(list => (
                <TouchableOpacity
                  key={list.id}
                  onPress={() => router.push({ pathname: '/(screens)/list-detail', params: { listId: list.id, listType: 'personal' } })}
                  style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#1f1f1f', gap: 12 }}
                >
                  <Text style={{ fontSize: 22 }}>{list.emoji ?? '📌'}</Text>
                  <Text style={{ flex: 1, color: '#fff', fontSize: 15 }}>{list.title}</Text>
                  <FontAwesome name="chevron-right" size={12} color="#6b7280" />
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                onPress={() => setShowCreateList(true)}
                style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 10 }}
              >
                <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: '#1f1f1f', alignItems: 'center', justifyContent: 'center' }}>
                  <FontAwesome name="plus" size={12} color="#f97316" />
                </View>
                <Text style={{ color: '#f97316', fontSize: 14, fontWeight: '500' }}>New List</Text>
              </TouchableOpacity>
            </>
          )}

          {/* Curated Lists section */}
          <Text style={{ color: '#fff', fontSize: 17, fontWeight: '700', marginTop: 24, marginBottom: 12 }}>Curated Lists</Text>

          {loadingCurated ? (
            <ActivityIndicator size="small" color="#f97316" />
          ) : (
            curatedLists.map(list => (
              <CuratedListCard key={list.id} list={list} visitedIds={visitedIds} />
            ))
          )}
        </ScrollView>
      )}

      <CreateListSheet visible={showCreateList} onClose={() => setShowCreateList(false)} />
    </SafeAreaView>
  );
}
