import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRestaurantDetail, useToggleVisit } from '@/lib/hooks/queries/useLists';
import { SaveToListSheet } from '@/lib/components/lists/SaveToListSheet';
import { mediumHaptic } from '@/lib/haptics';

const CUISINE_EMOJIS: Record<string, string> = {
  noodles_congee: '🍜', rice: '🍚', hotpot_grill: '🍲', seafood: '🦐',
  bread: '🥖', vietnamese_cakes: '🍰', snack: '🍿', dessert: '🍨',
  drinks: '☕', fast_food: '🍔', international: '🌍', healthy: '🥗',
  veggie: '🥦', others: '🍽️',
};

function formatTime(iso: string) {
  const d = new Date(iso);
  const isToday = d.toDateString() === new Date().toDateString();
  const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  return isToday ? `Today · ${time}` : `${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · ${time}`;
}

export default function RestaurantDetailScreen() {
  const { restaurantId } = useLocalSearchParams<{ restaurantId: string }>();
  const router = useRouter();
  const { data: restaurant, isLoading } = useRestaurantDetail(restaurantId);
  const toggleVisit = useToggleVisit();
  const [showSaveSheet, setShowSaveSheet] = useState(false);

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0a0a0a', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#f97316" />
      </View>
    );
  }

  if (!restaurant) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0a0a0a', justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: '#6b7280' }}>Restaurant not found</Text>
      </View>
    );
  }

  const emoji = CUISINE_EMOJIS[restaurant.cuisine_type] ?? '🍽️';
  const spotsLeft = (req: { group_size: number; participant_count: number }) =>
    Math.max(0, req.group_size - req.participant_count);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${restaurant.name} — ${restaurant.district} · ${restaurant.cuisine_type.replace(/_/g, ' ')} | Chopsticks`,
      });
    } catch { /* ignore */ }
  };

  const handleBeenHere = () => {
    mediumHaptic();
    toggleVisit.mutate({ restaurantId: restaurant.id, currentlyVisited: restaurant.user_has_visited });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0a0a0a' }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#1f1f1f' }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
          <FontAwesome name="chevron-left" size={18} color="#fff" />
        </TouchableOpacity>
        <Text style={{ flex: 1, color: '#fff', fontSize: 16, fontWeight: '700' }} numberOfLines={1}>{restaurant.name}</Text>
        <TouchableOpacity onPress={handleShare}>
          <FontAwesome name="share" size={18} color="#6b7280" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 48 }}>
        {/* Hero */}
        <View style={{ alignItems: 'center', paddingVertical: 24, gap: 6 }}>
          <Text style={{ fontSize: 56 }}>{emoji}</Text>
          <Text style={{ color: '#fff', fontSize: 20, fontWeight: '700' }}>{restaurant.name}</Text>
          <Text style={{ color: '#6b7280', fontSize: 13 }}>📍 {restaurant.district} · {restaurant.cuisine_type.replace(/_/g, ' ')}</Text>
          {restaurant.stats.avg_rating != null && (
            <Text style={{ color: '#f97316', fontSize: 14, fontWeight: '600' }}>
              ⭐ {restaurant.stats.avg_rating}
              <Text style={{ color: '#6b7280', fontWeight: '400' }}> ({restaurant.stats.diner_count} Chopstickers)</Text>
            </Text>
          )}
        </View>

        {/* Action buttons */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 12, paddingHorizontal: 20, marginBottom: 16 }}>
          <TouchableOpacity
            onPress={() => setShowSaveSheet(true)}
            style={{ flex: 1, alignItems: 'center', backgroundColor: '#171717', borderRadius: 10, paddingVertical: 12, gap: 4 }}
          >
            <FontAwesome name="bookmark-o" size={18} color="#9ca3af" />
            <Text style={{ color: '#9ca3af', fontSize: 11 }}>Save ▾</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleBeenHere}
            style={{ flex: 1, alignItems: 'center', backgroundColor: restaurant.user_has_visited ? '#f97316' : '#171717', borderRadius: 10, paddingVertical: 12, gap: 4 }}
          >
            <FontAwesome name="check" size={18} color={restaurant.user_has_visited ? '#fff' : '#9ca3af'} />
            <Text style={{ color: restaurant.user_has_visited ? '#fff' : '#9ca3af', fontSize: 11 }}>Been Here</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleShare}
            style={{ flex: 1, alignItems: 'center', backgroundColor: '#171717', borderRadius: 10, paddingVertical: 12, gap: 4 }}
          >
            <FontAwesome name="share" size={18} color="#9ca3af" />
            <Text style={{ color: '#9ca3af', fontSize: 11 }}>Share</Text>
          </TouchableOpacity>
        </View>

        {/* Create Meal Request CTA */}
        <TouchableOpacity
          onPress={() => router.push({ pathname: '/(screens)/create-request', params: { restaurantId: restaurant.id } })}
          style={{ marginHorizontal: 20, backgroundColor: '#f97316', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginBottom: 24 }}
        >
          <Text style={{ color: '#fff', fontSize: 15, fontWeight: '700' }}>🍽️ Create Meal Request Here</Text>
        </TouchableOpacity>

        {/* On Chopsticks stats */}
        {restaurant.stats.meal_count > 0 && (
          <View style={{ marginHorizontal: 20, marginBottom: 20 }}>
            <Text style={{ color: '#fff', fontSize: 15, fontWeight: '700', marginBottom: 12 }}>On Chopsticks</Text>
            <View style={{ flexDirection: 'row', backgroundColor: '#171717', borderRadius: 12, padding: 16 }}>
              {[
                { num: restaurant.stats.meal_count, label: 'Meals' },
                { num: restaurant.stats.diner_count, label: 'Diners' },
                { num: restaurant.stats.avg_rating ?? '—', label: 'Avg Rating' },
              ].map((s, i) => (
                <View key={s.label} style={{ flex: 1, alignItems: 'center', borderLeftWidth: i > 0 ? 1 : 0, borderLeftColor: '#262626' }}>
                  <Text style={{ color: '#f97316', fontSize: 20, fontWeight: '700' }}>{s.num}</Text>
                  <Text style={{ color: '#6b7280', fontSize: 11, marginTop: 2 }}>{s.label}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Active Requests */}
        {restaurant.active_requests.length > 0 && (
          <View style={{ marginHorizontal: 20, marginBottom: 20 }}>
            <Text style={{ color: '#fff', fontSize: 15, fontWeight: '700', marginBottom: 10 }}>Active Requests Now</Text>
            {restaurant.active_requests.map(req => (
              <TouchableOpacity
                key={req.id}
                onPress={() => router.push({ pathname: '/(screens)/request-detail', params: { requestId: req.id } })}
                style={{ backgroundColor: '#171717', borderRadius: 10, padding: 12, marginBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 10 }}
              >
                <View style={{ flex: 1 }}>
                  <Text style={{ color: '#fff', fontSize: 13, fontWeight: '500' }}>{formatTime(req.time_window)}</Text>
                  <Text style={{ color: '#6b7280', fontSize: 12, marginTop: 2 }}>
                    {spotsLeft(req)} spot{spotsLeft(req) !== 1 ? 's' : ''} left · by {req.requester.name ?? 'Someone'} · {req.join_type === 'open' ? 'Open join' : 'Approval'}
                  </Text>
                </View>
                <View style={{ backgroundColor: '#f97316', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 }}>
                  <Text style={{ color: '#fff', fontSize: 13, fontWeight: '600' }}>Join</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Part of Lists */}
        {(restaurant.curated_list_memberships.length > 0 || restaurant.user_list_memberships.length > 0) && (
          <View style={{ marginHorizontal: 20 }}>
            <Text style={{ color: '#fff', fontSize: 15, fontWeight: '700', marginBottom: 10 }}>Part of Lists</Text>
            {restaurant.curated_list_memberships.map(m => (
              <TouchableOpacity
                key={m.list_id}
                onPress={() => router.push({ pathname: '/(screens)/list-detail', params: { listId: m.list_id, listType: 'curated' } })}
                style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 8, gap: 8 }}
              >
                <Text style={{ fontSize: 16 }}>🏆</Text>
                <Text style={{ color: '#9ca3af', fontSize: 13, flex: 1 }}>
                  {m.list_title}{m.rank != null ? ` (#${m.rank} of list)` : ''}
                </Text>
                <FontAwesome name="chevron-right" size={10} color="#374151" />
              </TouchableOpacity>
            ))}
            {restaurant.user_list_memberships.map(m => (
              <TouchableOpacity
                key={m.list_id}
                onPress={() => router.push({ pathname: '/(screens)/list-detail', params: { listId: m.list_id, listType: 'personal' } })}
                style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 8, gap: 8 }}
              >
                <Text style={{ fontSize: 16 }}>{m.emoji ?? '📌'}</Text>
                <Text style={{ color: '#9ca3af', fontSize: 13, flex: 1 }}>Your "{m.list_title}"</Text>
                <FontAwesome name="chevron-right" size={10} color="#374151" />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      <SaveToListSheet
        visible={showSaveSheet}
        restaurant={restaurant}
        onClose={() => setShowSaveSheet(false)}
      />
    </SafeAreaView>
  );
}
