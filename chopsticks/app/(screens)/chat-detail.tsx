import { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, Modal, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { MOCK_MESSAGES, MOCK_CHATS, MOCK_USERS, MOCK_REQUESTS, CURRENT_USER, type MockMessage, type MockUser } from '@/lib/mockData';
import { useI18n } from '@/lib/i18n';

export default function ChatDetailScreen() {
  const { chatId } = useLocalSearchParams<{ chatId: string }>();
  const router = useRouter();
  const { t } = useI18n();
  const chat = MOCK_CHATS.find(c => c.id === chatId);
  const [messages, setMessages] = useState<MockMessage[]>(MOCK_MESSAGES);
  const [text, setText] = useState('');
  const [showParticipants, setShowParticipants] = useState(false);
  const [showRequestInfo, setShowRequestInfo] = useState(false);
  const listRef = useRef<FlatList>(null);

  const allParticipants = chat ? [CURRENT_USER, ...chat.participants] : [CURRENT_USER];
  const linkedRequest = chat?.requestId ? MOCK_REQUESTS.find(r => r.id === chat.requestId) : undefined;

  const getAvatarForSender = (senderId: string): MockUser | undefined => {
    if (senderId === 'me') return CURRENT_USER;
    return MOCK_USERS.find(u => u.id === senderId) || chat?.participants.find(p => p.id === senderId);
  };

  const sendMessage = () => {
    if (!text.trim()) return;
    const newMsg: MockMessage = {
      id: `m${Date.now()}`,
      senderId: 'me',
      senderName: 'You',
      text: text.trim(),
      time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
      isMe: true,
    };
    setMessages(prev => [...prev, newMsg]);
    setText('');
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const navigateToProfile = (userId: string) => {
    if (userId !== 'me') {
      router.push({ pathname: '/(screens)/user-profile', params: { userId } });
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#0a0a0a' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <Stack.Screen
        options={{
          headerTitle: chat?.title || 'Chat',
          headerRight: () => (
            <TouchableOpacity onPress={() => setShowParticipants(true)} style={{ marginRight: 8 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {allParticipants.slice(0, 3).map((p, i) => (
                  <View
                    key={p.id}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 14,
                      backgroundColor: '#262626',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginLeft: i > 0 ? -10 : 0,
                      borderWidth: 2,
                      borderColor: '#0a0a0a',
                    }}
                  >
                    <Text style={{ color: '#fff', fontSize: 12 }}>{p.name[0]}</Text>
                  </View>
                ))}
                {allParticipants.length > 3 && (
                  <View
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 14,
                      backgroundColor: '#f97316',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginLeft: -10,
                      borderWidth: 2,
                      borderColor: '#0a0a0a',
                    }}
                  >
                    <Text style={{ color: '#fff', fontSize: 10, fontWeight: '600' }}>+{allParticipants.length - 3}</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ),
        }}
      />

      {/* Participants Modal */}
      <Modal visible={showParticipants} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: '#171717', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '70%' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#262626' }}>
              <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700' }}>{t('participants')}</Text>
              <TouchableOpacity onPress={() => setShowParticipants(false)}>
                <Text style={{ color: '#f97316', fontSize: 16 }}>{t('done')}</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={{ padding: 16 }}>
              {allParticipants.map(p => (
                <TouchableOpacity
                  key={p.id}
                  onPress={() => {
                    setShowParticipants(false);
                    if (p.id !== 'me') navigateToProfile(p.id);
                  }}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: 12,
                    borderBottomWidth: 1,
                    borderBottomColor: '#262626',
                  }}
                >
                  <View style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    backgroundColor: '#262626',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 12,
                  }}>
                    <Text style={{ color: '#fff', fontSize: 18 }}>{p.name[0]}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>{p.name}</Text>
                      {p.id === 'me' && <Text style={{ color: '#6b7280', fontSize: 12, marginLeft: 8 }}>{t('youLabel')}</Text>}
                      {p.verified && <Text style={{ color: '#60a5fa', fontSize: 12, marginLeft: 6 }}>✓</Text>}
                    </View>
                    <Text style={{ color: '#6b7280', fontSize: 13, marginTop: 2 }}>
                      {p.persona === 'local' ? '📍 Local' : '✈️ Traveler'} · {p.mealCount} meals
                    </Text>
                  </View>
                  {p.id !== 'me' && <Text style={{ color: '#4b5563', fontSize: 18 }}>›</Text>}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Request Info Modal */}
      <Modal visible={showRequestInfo} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: '#171717', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700' }}>{t('mealDetails')}</Text>
              <TouchableOpacity onPress={() => setShowRequestInfo(false)}>
                <Text style={{ color: '#f97316', fontSize: 16 }}>{t('done')}</Text>
              </TouchableOpacity>
            </View>
            {linkedRequest ? (
              <>
                <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600', marginBottom: 4 }}>{linkedRequest.restaurant.name}</Text>
                <Text style={{ color: '#9ca3af', fontSize: 13, marginBottom: 16 }}>{linkedRequest.restaurant.address}</Text>
                <View style={{ gap: 12, marginBottom: 20 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ color: '#6b7280', fontSize: 14 }}>{t('time')}</Text>
                    <Text style={{ color: '#fff', fontSize: 14, fontWeight: '500' }}>{linkedRequest.timeWindow}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ color: '#6b7280', fontSize: 14 }}>{t('budget')}</Text>
                    <Text style={{ color: '#fff', fontSize: 14, fontWeight: '500' }}>{linkedRequest.restaurant.priceRange}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ color: '#6b7280', fontSize: 14 }}>{t('cuisine')}</Text>
                    <Text style={{ color: '#fff', fontSize: 14, fontWeight: '500' }}>{linkedRequest.cuisine}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ color: '#6b7280', fontSize: 14 }}>{t('groupSize')}</Text>
                    <Text style={{ color: '#fff', fontSize: 14, fontWeight: '500' }}>{linkedRequest.spotsTotal} people</Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    setShowRequestInfo(false);
                    router.push({ pathname: '/(screens)/post-meal', params: { requestId: linkedRequest.id } });
                  }}
                  style={{ backgroundColor: '#f97316', borderRadius: 12, paddingVertical: 14, alignItems: 'center' }}
                >
                  <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>{t('markMealCompleted')}</Text>
                </TouchableOpacity>
              </>
            ) : (
              <Text style={{ color: '#6b7280', fontSize: 14 }}>{t('noMealDetails')}</Text>
            )}
          </View>
        </View>
      </Modal>

      {/* Restaurant banner */}
      {chat?.restaurantName && (
        <TouchableOpacity
          onPress={() => setShowRequestInfo(true)}
          style={{ backgroundColor: '#171717', paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#262626' }}
        >
          <Text style={{ color: '#f97316', fontSize: 13, fontWeight: '500' }}>📍 {chat.restaurantName}</Text>
          <Text style={{ color: '#6b7280', fontSize: 11, marginTop: 2 }}>{t('tapForDetails')}</Text>
        </TouchableOpacity>
      )}

      {/* Messages */}
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={m => m.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 8 }}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
        renderItem={({ item }) => {
          const sender = getAvatarForSender(item.senderId);
          return (
            <View style={{
              flexDirection: 'row',
              alignSelf: item.isMe ? 'flex-end' : 'flex-start',
              maxWidth: '85%',
              marginBottom: 10,
            }}>
              {/* Avatar for other users */}
              {!item.isMe && (
                <TouchableOpacity
                  onPress={() => navigateToProfile(item.senderId)}
                  style={{ marginRight: 8, alignSelf: 'flex-end' }}
                >
                  <View style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: '#262626',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <Text style={{ color: '#fff', fontSize: 14 }}>{sender?.name[0] || '?'}</Text>
                  </View>
                </TouchableOpacity>
              )}

              <View style={{ flex: 1, maxWidth: item.isMe ? '100%' : undefined }}>
                {!item.isMe && (
                  <TouchableOpacity onPress={() => navigateToProfile(item.senderId)}>
                    <Text style={{ color: '#6b7280', fontSize: 11, marginBottom: 2, marginLeft: 4 }}>{item.senderName}</Text>
                  </TouchableOpacity>
                )}
                <View style={{
                  backgroundColor: item.isMe ? '#f97316' : '#262626',
                  borderRadius: 16,
                  borderTopRightRadius: item.isMe ? 4 : 16,
                  borderTopLeftRadius: item.isMe ? 16 : 4,
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                  alignSelf: item.isMe ? 'flex-end' : 'flex-start',
                }}>
                  <Text style={{ color: '#fff', fontSize: 15 }}>{item.text}</Text>
                </View>
                <Text style={{
                  color: '#4b5563',
                  fontSize: 10,
                  marginTop: 2,
                  alignSelf: item.isMe ? 'flex-end' : 'flex-start',
                  marginHorizontal: 4,
                }}>
                  {item.time}
                </Text>
              </View>
            </View>
          );
        }}
      />

      {/* Input bar */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderTopWidth: 1,
        borderTopColor: '#262626',
        backgroundColor: '#171717',
      }}>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder={t('typeAMessage')}
          placeholderTextColor="#6b7280"
          style={{
            flex: 1,
            backgroundColor: '#262626',
            borderRadius: 20,
            paddingHorizontal: 16,
            paddingVertical: 10,
            color: '#fff',
            fontSize: 15,
          }}
          onSubmitEditing={sendMessage}
          returnKeyType="send"
        />
        <TouchableOpacity
          onPress={sendMessage}
          style={{
            width: 40, height: 40, borderRadius: 20,
            backgroundColor: text.trim() ? '#f97316' : '#262626',
            alignItems: 'center', justifyContent: 'center', marginLeft: 8,
          }}
        >
          <Text style={{ color: '#fff', fontSize: 16 }}>↑</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
