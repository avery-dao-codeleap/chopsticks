import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useRequestsStore } from '@/stores/requests';
import { useI18n } from '@/lib/i18n';

export default function MyRequestsScreen() {
  const router = useRouter();
  const { t } = useI18n();
  const myRequests = useRequestsStore(state => state.myRequests);
  const pendingJoins = useRequestsStore(state => state.pendingJoins);

  return (
    <View style={{ flex: 1, backgroundColor: '#0a0a0a' }}>
      {myRequests.length > 0 ? (
        <FlatList
          data={myRequests}
          keyExtractor={r => r.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16 }}
          renderItem={({ item }) => {
            const pendingCount = pendingJoins.filter(j => j.requestId === item.id).length;
            const spotsLeft = item.spotsTotal - item.spotsTaken;
            return (
              <TouchableOpacity
                onPress={() => router.push({ pathname: '/(screens)/request-detail', params: { requestId: item.id } })}
                style={{
                  backgroundColor: '#171717', borderRadius: 12, padding: 14,
                  marginBottom: 10, flexDirection: 'row', alignItems: 'center',
                }}
              >
                <View style={{
                  width: 48, height: 48, borderRadius: 24,
                  backgroundColor: '#262626', alignItems: 'center', justifyContent: 'center', marginRight: 12,
                }}>
                  <Text style={{ fontSize: 22 }}>{item.cuisineEmoji}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: '#fff', fontSize: 15, fontWeight: '600' }}>{item.restaurant.name}</Text>
                  <Text style={{ color: '#9ca3af', fontSize: 12, marginTop: 2 }}>
                    {item.cuisine} · {item.timeWindow} · {spotsLeft} {t('spots').toLowerCase()}
                  </Text>
                  <Text style={{ color: '#6b7280', fontSize: 12, marginTop: 2 }}>
                    {item.joinType === 'open' ? t('openJoinLabel') : t('approvalLabel')}
                  </Text>
                </View>
                {pendingCount > 0 && (
                  <View style={{
                    backgroundColor: '#f97316', borderRadius: 10,
                    minWidth: 22, height: 22, alignItems: 'center', justifyContent: 'center',
                    paddingHorizontal: 6,
                  }}>
                    <Text style={{ color: '#fff', fontSize: 11, fontWeight: '700' }}>{pendingCount}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          }}
        />
      ) : (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}>
          <Text style={{ fontSize: 40, marginBottom: 12 }}>🍜</Text>
          <Text style={{ color: '#fff', fontSize: 18, fontWeight: '600' }}>{t('noMyRequests')}</Text>
          <Text style={{ color: '#6b7280', textAlign: 'center', marginTop: 8 }}>{t('createYourFirstRequest')}</Text>
        </View>
      )}
    </View>
  );
}
