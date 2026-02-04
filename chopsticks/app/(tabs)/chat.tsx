import { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MOCK_CHATS, type MockChat } from '@/lib/mockData';
import { useRequestsStore } from '@/stores/requests';
import { useI18n } from '@/lib/i18n';

function ChatItem({ chat, onPress }: { chat: MockChat; onPress: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#171717',
        borderRadius: 14,
        padding: 14,
        marginBottom: 8,
      }}
    >
      {/* Avatar */}
      <View style={{
        width: 50, height: 50, borderRadius: 25,
        backgroundColor: '#262626', alignItems: 'center', justifyContent: 'center', marginRight: 12,
      }}>
        <Text style={{ fontSize: 20 }}>
          {chat.type === 'group' ? '👥' : chat.title[0]}
        </Text>
      </View>

      {/* Content */}
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ color: '#fff', fontSize: 15, fontWeight: '600' }}>{chat.title}</Text>
          <Text style={{ color: '#4b5563', fontSize: 11 }}>{chat.lastMessageTime}</Text>
        </View>
        {chat.restaurantName && (
          <Text style={{ color: '#f97316', fontSize: 12, marginTop: 2 }}>📍 {chat.restaurantName}</Text>
        )}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
          <Text style={{ color: '#9ca3af', fontSize: 13, flex: 1 }} numberOfLines={1}>
            {chat.lastMessage}
          </Text>
          {chat.unread > 0 && (
            <View style={{
              backgroundColor: '#f97316', borderRadius: 10,
              minWidth: 20, height: 20, alignItems: 'center', justifyContent: 'center',
              paddingHorizontal: 6, marginLeft: 8,
            }}>
              <Text style={{ color: '#fff', fontSize: 11, fontWeight: '700' }}>{chat.unread}</Text>
            </View>
          )}
        </View>
        {chat.type === 'group' && (
          <Text style={{ color: '#4b5563', fontSize: 11, marginTop: 2 }}>
            {chat.participants.length + 1} people
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

export default function ChatScreen() {
  const router = useRouter();
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<'chats' | 'myRequests'>('chats');
  const [chats] = useState(MOCK_CHATS.filter(c => c.type === 'group'));
  const myRequests = useRequestsStore(state => state.myRequests);
  const pendingJoins = useRequestsStore(state => state.pendingJoins);
  const totalPending = pendingJoins.length;

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
        chats.length > 0 ? (
          <FlatList
            data={chats}
            keyExtractor={item => item.id}
            contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12 }}
            renderItem={({ item }) => (
              <ChatItem
                chat={item}
                onPress={() => router.push({ pathname: '/(screens)/chat-detail', params: { chatId: item.id } })}
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
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}>
            <Text style={{ fontSize: 48, marginBottom: 16 }}>💬</Text>
            <Text style={{ color: '#fff', fontSize: 20, fontWeight: '600', textAlign: 'center' }}>{t('noConversationsYet')}</Text>
            <Text style={{ color: '#6b7280', textAlign: 'center', marginTop: 8 }}>
              {t('joinMealToChat')}
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/')}
              style={{ backgroundColor: '#f97316', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12, marginTop: 20 }}
            >
              <Text style={{ color: '#fff', fontWeight: '600' }}>{t('browseRequests')}</Text>
            </TouchableOpacity>
          </View>
        )
      ) : (
        myRequests.length > 0 ? (
          <FlatList
            data={myRequests}
            keyExtractor={r => r.id}
            contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12 }}
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
        )
      )}
    </SafeAreaView>
  );
}
