import { View, Text, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { CUISINE_CATEGORIES } from '@/lib/constants';
import { MOCK_USERS } from '@/lib/mockData';
import { useI18n } from '@/lib/i18n';

export default function UserProfileScreen() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const { t, language } = useI18n();
  const user = MOCK_USERS.find(u => u.id === userId) || MOCK_USERS[0];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#0a0a0a' }} contentContainerStyle={{ alignItems: 'center', padding: 20 }}>
      {/* Avatar */}
      <View style={{
        width: 100, height: 100, borderRadius: 50,
        backgroundColor: '#262626', alignItems: 'center', justifyContent: 'center', marginTop: 20,
      }}>
        <Text style={{ fontSize: 40, color: '#fff' }}>{user.name[0]}</Text>
      </View>

      {/* Name & age */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 16 }}>
        <Text style={{ color: '#fff', fontSize: 24, fontWeight: '700' }}>{user.name}, {user.age}</Text>
        {user.verified && <Text style={{ color: '#60a5fa', fontSize: 16, marginLeft: 8 }}>✓</Text>}
      </View>

      <Text style={{ color: '#6b7280', fontSize: 14, marginTop: 4 }}>{user.gender}</Text>

      {/* Persona badge */}
      <View style={{
        backgroundColor: user.persona === 'local' ? '#16a34a20' : '#8b5cf620',
        paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16, marginTop: 12,
      }}>
        <Text style={{ color: user.persona === 'local' ? '#4ade80' : '#a78bfa', fontSize: 14, fontWeight: '600' }}>
          {user.persona === 'local' ? '📍 Local' : '✈️ Traveler'}
        </Text>
      </View>

      {/* Stats — meals only */}
      <View style={{ marginTop: 28 }}>
        <View style={{ alignItems: 'center', backgroundColor: '#171717', borderRadius: 14, padding: 16, width: 120 }}>
          <Text style={{ fontSize: 20 }}>🍜</Text>
          <Text style={{ color: '#fff', fontSize: 22, fontWeight: '700', marginTop: 4 }}>{user.mealCount}</Text>
          <Text style={{ color: '#6b7280', fontSize: 12 }}>{t('meals')}</Text>
        </View>
      </View>

      {/* Bio */}
      <View style={{ width: '100%', marginTop: 28 }}>
        <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600', marginBottom: 8 }}>{t('about')}</Text>
        <Text style={{ color: '#9ca3af', fontSize: 14, fontStyle: 'italic' }}>
          "{user.bio || t('noBioYet')}"
        </Text>
      </View>

      {/* Favorite Cuisines */}
      {user.cuisines && user.cuisines.length > 0 && (
        <View style={{ width: '100%', marginTop: 24 }}>
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600', marginBottom: 10 }}>{t('favoriteCuisines')}</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {user.cuisines.map(id => {
              const cat = CUISINE_CATEGORIES.find(c => c.id === id);
              return cat ? (
                <View key={id} style={{ backgroundColor: '#f9731620', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 }}>
                  <Text style={{ color: '#f97316', fontSize: 13, fontWeight: '500' }}>{language === 'vi' ? cat.labelVi : cat.label}</Text>
                </View>
              ) : null;
            })}
          </View>
        </View>
      )}
    </ScrollView>
  );
}
