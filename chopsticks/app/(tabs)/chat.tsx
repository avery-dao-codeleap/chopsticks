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

  const [currentUserId, setCurrentUserId] = useState<string>('');
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setCurrentUserId(data.user.id);
    });
  }, []);

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

    // Status filter — "active" hides completed/archived
    if (statusFilter === 'active') {
      result = result.filter(c => {
        const status = getMealStatus(
          c.meal_request?.time_window || '',
          (c.meal_request as any)?.meal_completed_at || null,
        );
        return status.status === 'active';
      });
    }

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
                timeWindow={item.meal_request?.time_window || ''}
                mealCompletedAt={(item.meal_request as any)?.meal_completed_at || null}
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
            {t('joinMealToChat')}
          </Text>
          <TouchableOpacity
            onPress={() => router.push('/(tabs)')}
            style={{ backgroundColor: '#f97316', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12, marginTop: 20 }}
          >
            <Text style={{ color: '#fff', fontWeight: '600' }}>{t('browseRequests')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const STATUS_FILTERS: { key: StatusFilter; label: string }[] = [
    { key: 'active', label: 'Active' },
    { key: 'all', label: 'All' },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0a0a0a' }} edges={['left', 'right']}>
      {/* Search + Filters */}
      <View style={{ paddingHorizontal: 16, paddingTop: 10, paddingBottom: 4 }}>
        {/* Search bar */}
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search by restaurant..."
          placeholderTextColor="#4b5563"
          style={{
            backgroundColor: '#171717', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10,
            color: '#fff', fontSize: 14, marginBottom: 10,
          }}
        />

        {/* Status chips */}
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {STATUS_FILTERS.map(f => {
            const isActive = statusFilter === f.key;
            return (
              <TouchableOpacity
                key={f.key}
                onPress={() => setStatusFilter(f.key)}
                style={{
                  paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16,
                  backgroundColor: isActive ? '#f97316' : '#171717',
                }}
              >
                <Text style={{ color: isActive ? '#fff' : '#9ca3af', fontSize: 13, fontWeight: '600' }}>
                  {f.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <FlatList
        data={filteredChats}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 24 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#f97316" colors={['#f97316']} />
        }
        ListHeaderComponent={
          <>
            {/* Waiting section */}
            {showWaiting && (
              <View style={{ marginBottom: 16 }}>
                <Text style={{ color: '#9ca3af', fontSize: 12, fontWeight: '600', marginBottom: 8, letterSpacing: 0.5 }}>
                  WAITING
                </Text>
                {filteredWaiting.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() => router.push({ pathname: '/(screens)/request-detail', params: { requestId: item.id } })}
                    style={{
                      backgroundColor: '#171717', borderRadius: 12, padding: 14,
                      marginBottom: 8, flexDirection: 'row', alignItems: 'center',
                      borderWidth: 1, borderColor: '#262626', borderStyle: 'dashed',
                    }}
                  >
                    <View style={{
                      width: 44, height: 44, borderRadius: 22,
                      backgroundColor: '#262626', alignItems: 'center', justifyContent: 'center', marginRight: 12,
                    }}>
                      <Text style={{ fontSize: 20 }}>⏳</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: '#fff', fontSize: 15, fontWeight: '600' }}>{item.restaurantName}</Text>
                      <Text style={{ color: '#6b7280', fontSize: 12, marginTop: 2 }}>
                        {item.cuisine} · {new Date(item.timeWindow).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                      </Text>
                    </View>
                    <View style={{
                      backgroundColor: item.labelColor + '20', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8,
                    }}>
                      <Text style={{ color: item.labelColor, fontSize: 11, fontWeight: '600' }}>{item.label}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Chats header */}
            {filteredChats.length > 0 && (
              <Text style={{ color: '#6b7280', fontSize: 13, marginBottom: 8 }}>
                {filteredChats.length} conversation{filteredChats.length !== 1 ? 's' : ''}
              </Text>
            )}
          </>
        }
        ListEmptyComponent={
          chats.length > 0 ? (
            <View style={{ alignItems: 'center', paddingTop: 40 }}>
              <Text style={{ color: '#6b7280', fontSize: 14 }}>No matching chats</Text>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <ChatListItem
            chatId={item.id}
            restaurantName={item.restaurant?.name || 'Unknown Restaurant'}
            restaurantDistrict={item.restaurant?.district || 'Unknown'}
            participantCount={item.participant_count}
            timeWindow={item.meal_request?.time_window || ''}
            mealCompletedAt={(item.meal_request as any)?.meal_completed_at || null}
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
      />
    </SafeAreaView>
  );
}
