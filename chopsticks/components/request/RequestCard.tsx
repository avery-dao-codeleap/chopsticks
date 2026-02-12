import { View, Text, TouchableOpacity } from 'react-native';
import type { MealRequestWithDetails } from '@/services/api/requests';
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

  // Map budget to display label
  const budgetCat = BUDGET_RANGES.find(b => b.id === request.budget_range);
  const budgetLabel = budgetCat
    ? (language === 'vi' ? budgetCat.labelVi : budgetCat.label)
    : request.budget_range;
  const budgetPerPerson = language === 'vi' ? `${budgetLabel}/người` : `${budgetLabel}/person`;

  // Map district ID to display name for approval requests
  const district = HCMC_DISTRICTS.find(d => d.id === request.restaurants.district);
  const districtLabel = district ? (language === 'vi' ? district.nameVi : district.name) : request.restaurants.district;

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
        opacity: isFull ? 0.6 : 1,
      }}
    >
      <View style={{
        width: 48, height: 48, borderRadius: 24,
        backgroundColor: '#262626', alignItems: 'center', justifyContent: 'center', marginRight: 12,
      }}>
        <Text style={{ fontSize: 22 }}>{emoji}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ color: '#fff', fontSize: 15, fontWeight: '600' }}>
          {request.join_type === 'approval' ? districtLabel : request.restaurants.name}
        </Text>
        {request.join_type === 'open' && request.restaurants.address && (
          <Text style={{ color: '#6b7280', fontSize: 11, marginTop: 2 }}>
            📍 {request.restaurants.address}
          </Text>
        )}
        <Text style={{ color: '#9ca3af', fontSize: 12, marginTop: 2 }}>
          {cuisineLabel} · {formatTimeWindow(request.time_window)} · {spotsLeft} {spotsLeft === 1 ? 'spot' : 'spots'} · 💰 {budgetPerPerson}
        </Text>
        {request.description && (
          <Text style={{ color: '#6b7280', fontSize: 12, marginTop: 2 }} numberOfLines={2}>
            "{request.description}"
          </Text>
        )}
        <Text style={{ color: '#6b7280', fontSize: 12, marginTop: 2 }}>
          by {request.users?.name ?? 'Unknown'} · {request.join_type === 'open' ? 'Open join' : 'Approval needed'}
        </Text>
      </View>
      {isFull ? (
        <View style={{
          backgroundColor: '#ef4444',
          paddingHorizontal: 10,
          paddingVertical: 6,
          borderRadius: 6,
        }}>
          <Text style={{ color: '#fff', fontSize: 11, fontWeight: '700' }}>🔒 FULL</Text>
        </View>
      ) : (
        <Text style={{ color: '#4b5563', fontSize: 18 }}>›</Text>
      )}
    </TouchableOpacity>
  );
}
