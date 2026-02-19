import { View, Text, TouchableOpacity } from 'react-native';
import type { MealRequestWithDetails } from '@/lib/services/api/requests';
import { CUISINE_CATEGORIES, HCMC_DISTRICTS, BUDGET_RANGES } from '@/lib/constants';

const CUISINE_EMOJIS: Record<string, string> = {
  noodles_congee: '🍜', rice: '🍚', hotpot_grill: '🍲', seafood: '🦐',
  bread: '🥖', vietnamese_cakes: '🍰', snack: '🍿', dessert: '🍨',
  drinks: '🧋', fast_food: '🍔', international: '🌍', healthy: '🥗',
  veggie: '🥦', others: '🍽️',
};

function formatTimeWindow(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const dayStr = isToday ? 'Today' : 'Tomorrow';
  const timeStr = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  return `${dayStr}, ${timeStr}`;
}

interface RequestCardProps {
  request: MealRequestWithDetails;
  onPress: () => void;
  language?: 'en' | 'vi';
}

export function RequestCard({ request, onPress, language = 'en' }: RequestCardProps) {
  const spotsLeft = request.group_size - request.participant_count - 1; // -1 for the requester
  const isFull = spotsLeft <= 0;
  const emoji = CUISINE_EMOJIS[request.cuisine] ?? '🍽️';
  const cuisineCat = CUISINE_CATEGORIES.find(c => c.id === request.cuisine);
  const cuisineLabel = cuisineCat
    ? (language === 'vi' ? cuisineCat.labelVi : cuisineCat.label)
    : request.cuisine;

  const budgetCat = BUDGET_RANGES.find(b => b.id === request.budget_range);
  const budgetLabel = budgetCat
    ? (language === 'vi' ? budgetCat.labelVi : budgetCat.label)
    : request.budget_range;

  const district = HCMC_DISTRICTS.find(d => d.id === request.restaurants.district);
  const districtLabel = district ? (language === 'vi' ? district.nameVi : district.name) : request.restaurants.district;

  const joinedCount = request.participant_count; // doesn't include requester

  return (
    <TouchableOpacity
      onPress={isFull ? undefined : onPress}
      activeOpacity={isFull ? 1 : 0.8}
      disabled={isFull}
      style={{
        backgroundColor: '#171717',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        opacity: isFull ? 0.6 : 1,
      }}
    >
      {/* Top row: restaurant name + spots badge */}
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
        <View style={{ flex: 1, marginRight: 10 }}>
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }} numberOfLines={1}>
            {request.join_type === 'approval' ? districtLabel : request.restaurants.name}
          </Text>
          {request.join_type === 'open' && request.restaurants.address && (
            <Text style={{ color: '#6b7280', fontSize: 12, marginTop: 2 }} numberOfLines={1}>
              📍 {request.restaurants.address}
            </Text>
          )}
        </View>
        <View style={{
          backgroundColor: isFull ? '#ef444420' : '#10b98120',
          paddingHorizontal: 10,
          paddingVertical: 5,
          borderRadius: 10,
        }}>
          <Text style={{ color: isFull ? '#ef4444' : '#10b981', fontSize: 12, fontWeight: '700' }}>
            {isFull ? '🔒 Full' : `${spotsLeft} spot${spotsLeft !== 1 ? 's' : ''}`}
          </Text>
        </View>
      </View>

      {/* Meta chips */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
        <View style={{ backgroundColor: '#262626', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Text style={{ fontSize: 13 }}>{emoji}</Text>
          <Text style={{ color: '#9ca3af', fontSize: 12 }}>{cuisineLabel}</Text>
        </View>
        <View style={{ backgroundColor: '#262626', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 }}>
          <Text style={{ color: '#9ca3af', fontSize: 12 }}>🕐 {formatTimeWindow(request.time_window)}</Text>
        </View>
        <View style={{ backgroundColor: '#262626', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 }}>
          <Text style={{ color: '#9ca3af', fontSize: 12 }}>💰 {budgetLabel}/pp</Text>
        </View>
      </View>

      {/* Description */}
      {request.description && (
        <Text style={{ color: '#6b7280', fontSize: 12, marginBottom: 10, fontStyle: 'italic' }} numberOfLines={2}>
          "{request.description}"
        </Text>
      )}

      {/* Bottom row: avatar row + join type */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {/* Requester avatar */}
          <View style={{
            width: 30, height: 30, borderRadius: 15,
            backgroundColor: '#f97316', alignItems: 'center', justifyContent: 'center',
            borderWidth: 2, borderColor: '#171717',
          }}>
            <Text style={{ color: '#fff', fontSize: 13, fontWeight: '600' }}>
              {request.users?.name?.[0] || '?'}
            </Text>
          </View>
          {/* Joined participant placeholders */}
          {Array.from({ length: Math.min(joinedCount, 3) }).map((_, i) => (
            <View key={`joined-${i}`} style={{
              width: 30, height: 30, borderRadius: 15,
              backgroundColor: '#262626', alignItems: 'center', justifyContent: 'center',
              marginLeft: -8, borderWidth: 2, borderColor: '#171717',
            }}>
              <Text style={{ color: '#9ca3af', fontSize: 12 }}>👤</Text>
            </View>
          ))}
          {/* Empty spots (dashed) */}
          {!isFull && Array.from({ length: Math.min(spotsLeft, 3) }).map((_, i) => (
            <View key={`empty-${i}`} style={{
              width: 30, height: 30, borderRadius: 15,
              backgroundColor: 'transparent', alignItems: 'center', justifyContent: 'center',
              marginLeft: -8, borderWidth: 1.5, borderColor: '#404040', borderStyle: 'dashed',
            }}>
              <Text style={{ color: '#404040', fontSize: 12 }}>+</Text>
            </View>
          ))}
          <Text style={{ color: '#6b7280', fontSize: 11, marginLeft: 8 }}>
            by {request.users?.name ?? 'Unknown'}
          </Text>
        </View>

        {/* Join type badge */}
        <View style={{
          backgroundColor: request.join_type === 'open' ? '#f9731620' : '#8b5cf620',
          paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6,
        }}>
          <Text style={{
            color: request.join_type === 'open' ? '#f97316' : '#a78bfa',
            fontSize: 11, fontWeight: '600',
          }}>
            {request.join_type === 'open' ? 'Open' : 'Approval'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
