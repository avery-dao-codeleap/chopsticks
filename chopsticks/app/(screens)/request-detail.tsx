import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Modal, TextInput } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MOCK_REQUESTS } from '@/lib/mockData';
import { useRequestsStore } from '@/stores/requests';
import { useI18n } from '@/lib/i18n';

export default function RequestDetailScreen() {
  const { requestId } = useLocalSearchParams<{ requestId: string }>();
  const router = useRouter();
  const { t } = useI18n();
  const myRequests = useRequestsStore(state => state.myRequests);
  const pendingJoins = useRequestsStore(state => state.pendingJoins);
  const approveJoin = useRequestsStore(state => state.approveJoin);
  const denyJoin = useRequestsStore(state => state.denyJoin);

  const request = MOCK_REQUESTS.find(r => r.id === requestId) || myRequests.find(r => r.id === requestId) || MOCK_REQUESTS[0];
  const spotsLeft = request.spotsTotal - request.spotsTaken;
  const { requester, restaurant } = request;
  const isOwner = requester.id === 'me';
  const myPendingJoins = pendingJoins.filter(j => j.requestId === request.id);

  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinMessage, setJoinMessage] = useState('');

  const handleJoin = () => {
    if (request.joinType === 'open') {
      Alert.alert(t('joinedTitle'), t('joinedBody', { name: restaurant.name }), [
        { text: t('openChat'), onPress: () => router.push({ pathname: '/(screens)/chat-detail', params: { chatId: 'c1' } }) },
      ]);
    } else {
      setShowJoinModal(true);
    }
  };

  const handleSendJoinRequest = () => {
    if (!joinMessage.trim()) {
      Alert.alert(t('sayAnything'), t('tellSomethingInteresting'));
      return;
    }
    setShowJoinModal(false);
    setJoinMessage('');
    Alert.alert(t('requestSent'), t('requestSentBody', { name: requester.name }));
  };

  return (
    <>
      <ScrollView style={{ flex: 1, backgroundColor: '#0a0a0a' }}>
        {/* Restaurant header */}
        <View style={{ height: 180, backgroundColor: '#171717', alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: 56 }}>{request.cuisineEmoji}</Text>
          <Text style={{ color: '#6b7280', fontSize: 13, marginTop: 8 }}>{restaurant.cuisine} · {restaurant.priceRange}</Text>
        </View>

        <View style={{ padding: 20 }}>
          {/* Restaurant info */}
          <Text style={{ color: '#fff', fontSize: 22, fontWeight: '700' }}>{restaurant.name}</Text>
          <Text style={{ color: '#9ca3af', fontSize: 14, marginTop: 4 }}>{restaurant.address}</Text>

          <View style={{ height: 1, backgroundColor: '#262626', marginVertical: 20 }} />

          {/* Requester profile */}
          <TouchableOpacity
            onPress={() => { if (!isOwner) router.push({ pathname: '/(screens)/user-profile', params: { userId: requester.id } }); }}
            activeOpacity={isOwner ? 1 : 0.7}
            style={{ flexDirection: 'row', alignItems: 'center' }}
          >
            <View style={{
              width: 52, height: 52, borderRadius: 26,
              backgroundColor: '#262626', alignItems: 'center', justifyContent: 'center', marginRight: 14,
            }}>
              <Text style={{ fontSize: 22, color: '#fff' }}>{requester.name[0]}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ color: '#fff', fontSize: 17, fontWeight: '600' }}>
                  {requester.name}, {requester.age}
                </Text>
                {requester.verified && (
                  <Text style={{ color: '#60a5fa', fontSize: 14, marginLeft: 6 }}>✓</Text>
                )}
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, flexWrap: 'wrap', gap: 6 }}>
                <View style={{ backgroundColor: requester.persona === 'local' ? '#16a34a20' : '#8b5cf620', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 }}>
                  <Text style={{ color: requester.persona === 'local' ? '#4ade80' : '#a78bfa', fontSize: 11, fontWeight: '600' }}>
                    {requester.persona === 'local' ? '📍 Local' : '✈️ Traveler'}
                  </Text>
                </View>
                <Text style={{ color: '#6b7280', fontSize: 12 }}>🍜 {requester.mealCount} meals</Text>
              </View>
            </View>
            {!isOwner && <Text style={{ color: '#4b5563', fontSize: 18 }}>›</Text>}
          </TouchableOpacity>

          {/* Requester bio */}
          <Text style={{ color: '#9ca3af', fontSize: 13, marginTop: 12, fontStyle: 'italic' }}>
            "{requester.bio || t('noBioYet')}"
          </Text>

          <View style={{ height: 1, backgroundColor: '#262626', marginVertical: 20 }} />

          {/* Meal details */}
          <View style={{ gap: 14 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: '#9ca3af', fontSize: 14 }}>{t('time')}</Text>
              <Text style={{ color: '#fff', fontSize: 14, fontWeight: '500' }}>{request.timeWindow}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: '#9ca3af', fontSize: 14 }}>{t('spots')}</Text>
              <Text style={{ color: '#f97316', fontSize: 14, fontWeight: '500' }}>
                {spotsLeft}/{request.spotsTotal} {t('available')}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: '#9ca3af', fontSize: 14 }}>{t('joinType')}</Text>
              <Text style={{ color: '#fff', fontSize: 14, fontWeight: '500' }}>
                {request.joinType === 'open' ? t('openInstantJoin') : t('approvalRequired')}
              </Text>
            </View>
          </View>

          {/* Request description */}
          {request.description && (
            <View style={{ backgroundColor: '#171717', borderRadius: 12, padding: 14, marginTop: 20 }}>
              <Text style={{ color: '#9ca3af', fontSize: 13 }}>{request.description}</Text>
            </View>
          )}

          {/* Pending join requests — owner only */}
          {isOwner && myPendingJoins.length > 0 && (
            <View style={{ marginTop: 24 }}>
              <Text style={{ color: '#fff', fontSize: 17, fontWeight: '600', marginBottom: 12 }}>{t('pendingRequests')}</Text>
              {myPendingJoins.map(join => (
                <View key={join.id} style={{ backgroundColor: '#171717', borderRadius: 12, padding: 14, marginBottom: 10 }}>
                  <TouchableOpacity
                    onPress={() => router.push({ pathname: '/(screens)/user-profile', params: { userId: join.userId } })}
                    style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}
                  >
                    <View style={{
                      width: 36, height: 36, borderRadius: 18,
                      backgroundColor: '#262626', alignItems: 'center', justifyContent: 'center', marginRight: 10,
                    }}>
                      <Text style={{ color: '#fff', fontSize: 16 }}>{join.userName[0]}</Text>
                    </View>
                    <Text style={{ color: '#fff', fontSize: 15, fontWeight: '600', flex: 1 }}>{join.userName}</Text>
                    <Text style={{ color: '#4b5563', fontSize: 16 }}>›</Text>
                  </TouchableOpacity>
                  <Text style={{ color: '#9ca3af', fontSize: 13, fontStyle: 'italic', marginBottom: 12 }}>
                    "{join.message}"
                  </Text>
                  <View style={{ flexDirection: 'row', gap: 10 }}>
                    <TouchableOpacity
                      onPress={() => approveJoin(join.id)}
                      style={{ flex: 1, backgroundColor: '#16a34a', borderRadius: 8, paddingVertical: 10, alignItems: 'center' }}
                    >
                      <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600' }}>{t('approve')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => denyJoin(join.id)}
                      style={{ flex: 1, backgroundColor: '#262626', borderRadius: 8, paddingVertical: 10, alignItems: 'center' }}
                    >
                      <Text style={{ color: '#9ca3af', fontSize: 14, fontWeight: '600' }}>{t('deny')}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Join button — non-owner only */}
          {!isOwner && (
            <TouchableOpacity
              onPress={handleJoin}
              style={{
                backgroundColor: '#f97316', borderRadius: 14,
                paddingVertical: 16, alignItems: 'center', marginTop: 28,
              }}
            >
              <Text style={{ color: '#fff', fontSize: 17, fontWeight: '700' }}>
                {request.joinType === 'open' ? t('joinMeal') : t('requestToJoin')}
              </Text>
            </TouchableOpacity>
          )}

          {/* Post-meal flow button (dev) */}
          <TouchableOpacity
            onPress={() => router.push({ pathname: '/(screens)/post-meal', params: { requestId: request.id } })}
            style={{
              borderWidth: 1, borderColor: '#374151', borderRadius: 14,
              paddingVertical: 14, alignItems: 'center', marginTop: isOwner ? 28 : 10,
            }}
          >
            <Text style={{ color: '#9ca3af', fontSize: 15 }}>{t('markMealCompleteDev')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Approval join message modal */}
      <Modal visible={showJoinModal} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: '#171717', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24 }}>
            <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 6 }}>
              {t('requestToJoinTitle')}
            </Text>
            <Text style={{ color: '#6b7280', fontSize: 13, marginBottom: 16 }}>
              {t('tellThemAboutYou', { name: requester.name, cuisine: request.cuisine })}
            </Text>
            <TextInput
              value={joinMessage}
              onChangeText={setJoinMessage}
              placeholder={t('joinMessagePlaceholder')}
              placeholderTextColor="#4b5563"
              multiline numberOfLines={3}
              style={{
                backgroundColor: '#262626', borderRadius: 12, padding: 14,
                color: '#fff', fontSize: 15, minHeight: 100, textAlignVertical: 'top',
                marginBottom: 16,
              }}
            />
            <TouchableOpacity
              onPress={handleSendJoinRequest}
              style={{ backgroundColor: '#f97316', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginBottom: 8 }}
            >
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>{t('sendRequest')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => { setShowJoinModal(false); setJoinMessage(''); }}
              style={{ paddingVertical: 12, alignItems: 'center' }}
            >
              <Text style={{ color: '#6b7280', fontSize: 15 }}>{t('cancel')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}
