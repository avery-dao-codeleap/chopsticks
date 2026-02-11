import { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useI18n } from '@/lib/i18n';
import { useChats } from '@/hooks/queries/useChats';
import { useRequests, useMyParticipations } from '@/hooks/queries/useRequests';
import { supabase } from '@/services/supabase';
import { ChatListItem } from '@/components/chat/ChatListItem';

export default function ChatScreen() {
  const router = useRouter();
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<'chats' | 'myRequests'>('chats');

  // Get current user ID
  const [currentUserId, setCurrentUserId] = useState<string>('');
  supabase.auth.getUser().then(({ data }) => {
    if (data.user) setCurrentUserId(data.user.id);
  });

  // Fetch chats and requests
  const { data: chats = [], isLoading: chatsLoading, refetch: refetchChats } = useChats();
  const { data: requests = [], isLoading: requestsLoading, refetch: refetchRequests } = useRequests();
  const { data: participations = [], isLoading: participationsLoading, refetch: refetchParticipations } = useMyParticipations();

  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      activeTab === 'chats' ? refetchChats() : Promise.all([refetchRequests(), refetchParticipations()]),
    ]);
    setRefreshing(false);
  };

  // Filter my requests (where I'm the creator)
  const createdRequests = requests.filter((r) => r.requester_id === currentUserId);

  // Combine created and participated requests
  const allMyRequests = [
    ...createdRequests.map(r => ({ ...r, type: 'created' as const })),
    ...participations.map(r => ({ ...r, type: 'participated' as const })),
  ];

  // Calculate total pending count (created requests with pending participants)
  const totalPending = createdRequests.reduce((count, request) => {
    return count + (request.pending_count || 0);
  }, 0);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0a0a0a' }} edges={['left', 'right']}>
      {/* Segment Toggle */}
      <View style={{ flexDirection: 'row', paddingHorizontal: 16, paddingTop: 12, gap: 8 }}>
        {(['chats', 'myRequests'] as const).map(tab => {
          const isActive = activeTab === tab;
          const label = tab === 'chats' ? t('chats') : t('myRequests');
          const badge = tab === 'myRequests' && totalPending > 0 ? totalPending : null;
          return (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={{
                flex: 1,
                paddingVertical: 10,
                borderRadius: 10,
                backgroundColor: isActive ? '#f97316' : '#171717',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'row',
                gap: 6,
              }}
            >
              <Text style={{ color: isActive ? '#fff' : '#9ca3af', fontSize: 14, fontWeight: '600' }}>{label}</Text>
              {badge && (
                <View style={{
                  backgroundColor: isActive ? 'rgba(255,255,255,0.3)' : '#f97316',
                  borderRadius: 8, minWidth: 18, height: 18,
                  alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5,
                }}>
                  <Text style={{ color: '#fff', fontSize: 10, fontWeight: '700' }}>{badge}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {activeTab === 'chats' ? (
        chatsLoading ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator size="large" color="#f97316" />
          </View>
        ) : chats.length > 0 ? (
          <FlatList
            data={chats}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12 }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor="#f97316"
                colors={['#f97316']}
              />
            }
            renderItem={({ item }) => (
              <ChatListItem
                chatId={item.id}
                restaurantName={item.restaurant?.name || 'Unknown Restaurant'}
                restaurantDistrict={item.restaurant?.district || 'Unknown'}
                participantCount={item.participant_count}
                lastMessage={item.last_message}
                currentUserId={currentUserId}
                onPress={() =>
                  router.push({
                    pathname: '/(screens)/chat-detail',
                    params: { chatId: item.id },
                  })
                }
              />
            )}
            ListHeaderComponent={
              <View style={{ marginBottom: 8 }}>
                <Text style={{ color: '#6b7280', fontSize: 13 }}>
                  {chats.length} conversation{chats.length !== 1 ? 's' : ''}
                </Text>
              </View>
            }
          />
        ) : (
          <View
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              paddingHorizontal: 32,
            }}
          >
            <Text style={{ fontSize: 48, marginBottom: 16 }}>💬</Text>
            <Text
              style={{
                color: '#fff',
                fontSize: 20,
                fontWeight: '600',
                textAlign: 'center',
              }}
            >
              {t('noConversationsYet')}
            </Text>
            <Text style={{ color: '#6b7280', textAlign: 'center', marginTop: 8 }}>
              {t('joinMealToChat')}
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/')}
              style={{
                backgroundColor: '#f97316',
                paddingHorizontal: 24,
                paddingVertical: 12,
                borderRadius: 12,
                marginTop: 20,
              }}
            >
              <Text style={{ color: '#fff', fontWeight: '600' }}>
                {t('browseRequests')}
              </Text>
            </TouchableOpacity>
          </View>
        )
      ) : requestsLoading || participationsLoading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color="#f97316" />
        </View>
      ) : allMyRequests.length > 0 ? (
        <FlatList
          data={allMyRequests}
          keyExtractor={(r) => r.id + r.type}
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#f97316"
              colors={['#f97316']}
            />
          }
          renderItem={({ item }) => {
            // Calculate participants
            const joinedCount = item.participant_count;
            const pendingCount = item.pending_count || 0;
            const spotsLeft = item.group_size - joinedCount - 1; // -1 for creator

            // Get cuisine emoji (you'll need to map cuisine to emoji)
            const cuisineEmoji = '🍜'; // Default emoji

            return (
              <TouchableOpacity
                onPress={() =>
                  router.push({
                    pathname: '/(screens)/request-detail',
                    params: { requestId: item.id },
                  })
                }
                style={{
                  backgroundColor: '#171717',
                  borderRadius: 12,
                  padding: 14,
                  marginBottom: 10,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
                <View
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    backgroundColor: '#262626',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 12,
                  }}
                >
                  <Text style={{ fontSize: 22 }}>{cuisineEmoji}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: '#fff', fontSize: 15, fontWeight: '600' }}>
                    {item.restaurants?.name || 'Unknown Restaurant'}
                  </Text>
                  <Text style={{ color: '#9ca3af', fontSize: 12, marginTop: 2 }}>
                    {item.cuisine} · {new Date(item.time_window).toLocaleTimeString()} · {spotsLeft}{' '}
                    {t('spots')?.toLowerCase() || 'spots'}
                  </Text>
                  <Text style={{ color: '#6b7280', fontSize: 12, marginTop: 2 }}>
                    {item.type === 'created'
                      ? (item.join_type === 'open' ? t('openJoinLabel') || 'Open Join' : t('approvalLabel') || 'Approval Required')
                      : ('user_status' in item ? (item.user_status === 'pending' ? 'Pending approval' : 'Joined') : 'Joined')
                    }
                  </Text>
                </View>
                {item.type === 'created' && pendingCount > 0 && (
                  <View
                    style={{
                      backgroundColor: '#f97316',
                      borderRadius: 10,
                      minWidth: 22,
                      height: 22,
                      alignItems: 'center',
                      justifyContent: 'center',
                      paddingHorizontal: 6,
                    }}
                  >
                    <Text style={{ color: '#fff', fontSize: 11, fontWeight: '700' }}>
                      {pendingCount}
                    </Text>
                  </View>
                )}
                {item.type === 'participated' && 'user_status' in item && (
                  <View
                    style={{
                      backgroundColor: item.user_status === 'pending' ? '#eab308' : '#10b981',
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      borderRadius: 8,
                    }}
                  >
                    <Text style={{ color: '#fff', fontSize: 11, fontWeight: '600' }}>
                      {item.user_status === 'pending' ? 'Pending' : 'Joined'}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          }}
        />
      ) : (
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 32,
          }}
        >
          <Text style={{ fontSize: 40, marginBottom: 12 }}>🍜</Text>
          <Text style={{ color: '#fff', fontSize: 18, fontWeight: '600' }}>
            {t('noMyRequests')}
          </Text>
          <Text style={{ color: '#6b7280', textAlign: 'center', marginTop: 8 }}>
            {t('createYourFirstRequest')}
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}
