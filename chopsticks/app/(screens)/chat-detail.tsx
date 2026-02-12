import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Modal,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { supabase } from '@/services/supabase';
import { useI18n } from '@/lib/i18n';
import { useChat, useChatMessages, useSendMessage, useRemoveUserFromChat, useLeaveChat } from '@/hooks/queries/useChats';
import { useRealtime } from '@/hooks/useRealtime';
import { MessageList } from '@/components/chat/MessageList';
import { ChatInput } from '@/components/chat/ChatInput';
import { useQueryClient } from '@tanstack/react-query';
import { getMealStatus } from '@/lib/mealStatus';

export default function ChatDetailScreen() {
  const { chatId } = useLocalSearchParams<{ chatId: string }>();
  const router = useRouter();
  const { t } = useI18n();
  const queryClient = useQueryClient();

  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [showParticipants, setShowParticipants] = useState(false);
  const [showRequestInfo, setShowRequestInfo] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  // Get current user
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setCurrentUserId(data.user.id);
    });
  }, []);

  // Fetch chat and messages
  const { data: chat, isLoading: chatLoading } = useChat(chatId);
  const { data: messages = [], isLoading: messagesLoading } = useChatMessages(chatId);

  // Mutations
  const sendMessageMutation = useSendMessage(chatId || '');
  const removeUserMutation = useRemoveUserFromChat(chatId || '');
  const leaveChatMutation = useLeaveChat();

  // Setup realtime subscription for new messages
  useRealtime({
    channel: `chat-${chatId}`,
    table: 'messages',
    filter: `chat_id=eq.${chatId}`,
    event: 'INSERT',
    enabled: !!chatId,
    onInsert: useCallback((payload) => {
      console.log('New message received:', payload.new);
      // Optimistically add new message to cache (5x faster than refetch)
      queryClient.setQueryData(['chat-messages', chatId], (old: any[] = []) => {
        // Check if message already exists (prevent duplicates)
        const exists = old.some((msg: any) => msg.id === payload.new.id);
        if (exists) return old;
        // Add new message to end
        return [...old, payload.new];
      });
    }, [chatId, queryClient]),
  });

  const handleSendMessage = (content: string) => {
    sendMessageMutation.mutate(content);
  };

  const handleRemoveUser = (userId: string) => {
    Alert.alert(
      'Remove User',
      'Are you sure you want to remove this user from the chat?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            removeUserMutation.mutate(userId, {
              onSuccess: () => {
                setShowParticipants(false);
                Alert.alert('Success', 'User removed from chat');
              },
            });
          },
        },
      ]
    );
  };

  const handleLeaveChat = () => {
    Alert.alert(
      'Leave Chat',
      'Are you sure you want to leave this chat? You can\'t rejoin unless the creator invites you again.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: () => {
            leaveChatMutation.mutate(chatId || '', {
              onSuccess: () => {
                router.back();
                Alert.alert('Success', 'You have left the chat');
              },
            });
          },
        },
      ]
    );
  };

  const navigateToProfile = (userId: string) => {
    if (userId !== currentUserId) {
      router.push({ pathname: '/(screens)/user-profile', params: { userId } });
    }
  };

  if (chatLoading || messagesLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0a0a0a', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#f97316" />
      </View>
    );
  }

  if (!chat) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0a0a0a', alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: '#fff', fontSize: 18 }}>Chat not found</Text>
      </View>
    );
  }

  const restaurant = chat.meal_requests?.restaurants;
  const participants = chat.participants || [];
  const isCreator = chat.meal_requests?.requester_id === currentUserId;

  // Calculate meal status to determine if chat is archived
  const mealCompletedAt = (chat.meal_requests as any)?.meal_completed_at || null;
  const mealStatus = getMealStatus(
    chat.meal_requests?.time_window || '',
    mealCompletedAt,
    isCreator
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#0a0a0a' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <Stack.Screen
        options={{
          headerTitle: restaurant?.name || 'Chat',
          headerRight: () => (
            <TouchableOpacity onPress={() => setShowParticipants(true)} style={{ marginRight: 8 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {participants.slice(0, 3).map((p, i) => (
                  <View
                    key={p.user_id}
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
                    <Text style={{ color: '#fff', fontSize: 12 }}>{p.users?.name?.[0] || '?'}</Text>
                  </View>
                ))}
                {participants.length > 3 && (
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
                    <Text style={{ color: '#fff', fontSize: 10, fontWeight: '600' }}>
                      +{participants.length - 3}
                    </Text>
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
                <Text style={{ color: '#f97316', fontSize: 16 }}>{t('done') || 'Done'}</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={{ padding: 16 }}>
              {participants.map((p) => (
                <TouchableOpacity
                  key={p.user_id}
                  onPress={() => {
                    setShowParticipants(false);
                    if (p.user_id !== currentUserId) navigateToProfile(p.user_id);
                  }}
                  onLongPress={() => {
                    if (isCreator && p.user_id !== currentUserId) {
                      setSelectedUser(p.user_id);
                      Alert.alert('Remove User', `Remove ${p.users?.name} from chat?`, [
                        { text: 'Cancel', style: 'cancel' },
                        {
                          text: 'Remove',
                          style: 'destructive',
                          onPress: () => handleRemoveUser(p.user_id),
                        },
                      ]);
                    }
                  }}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: 12,
                    borderBottomWidth: 1,
                    borderBottomColor: '#262626',
                  }}
                >
                  <View
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 22,
                      backgroundColor: '#262626',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 12,
                    }}
                  >
                    <Text style={{ color: '#fff', fontSize: 18 }}>{p.users?.name?.[0] || '?'}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>{p.users?.name || 'Unknown'}</Text>
                      {p.user_id === currentUserId && (
                        <Text style={{ color: '#6b7280', fontSize: 12, marginLeft: 8 }}>
                          {t('youLabel') || '(You)'}
                        </Text>
                      )}
                    </View>
                    <Text style={{ color: '#6b7280', fontSize: 13, marginTop: 2 }}>
                      {p.users?.persona || 'Unknown'} · {p.users?.meal_count || 0} meals
                    </Text>
                  </View>
                  {p.user_id !== currentUserId && <Text style={{ color: '#4b5563', fontSize: 18 }}>›</Text>}
                </TouchableOpacity>
              ))}

              {/* Leave chat button */}
              {!isCreator && (
                <TouchableOpacity
                  onPress={handleLeaveChat}
                  style={{
                    backgroundColor: '#dc2626',
                    borderRadius: 12,
                    paddingVertical: 14,
                    alignItems: 'center',
                    marginTop: 16,
                  }}
                >
                  <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>
                    {t('leaveChat') || 'Leave Chat'}
                  </Text>
                </TouchableOpacity>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Request Info Modal */}
      <Modal visible={showRequestInfo} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: '#171717', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700' }}>{t('mealDetails') || 'Meal Details'}</Text>
              <TouchableOpacity onPress={() => setShowRequestInfo(false)}>
                <Text style={{ color: '#f97316', fontSize: 16 }}>{t('done') || 'Done'}</Text>
              </TouchableOpacity>
            </View>
            {restaurant && (
              <>
                <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600', marginBottom: 4 }}>
                  {restaurant.name}
                </Text>
                <Text style={{ color: '#9ca3af', fontSize: 13, marginBottom: 16 }}>
                  {restaurant.address}
                </Text>
                <View style={{ gap: 12, marginBottom: 20 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ color: '#6b7280', fontSize: 14 }}>{t('time') || 'Time'}</Text>
                    <Text style={{ color: '#fff', fontSize: 14, fontWeight: '500' }}>
                      {new Date(chat.meal_requests?.time_window || '').toLocaleTimeString()}
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ color: '#6b7280', fontSize: 14 }}>{t('budget') || 'Budget'}</Text>
                    <Text style={{ color: '#fff', fontSize: 14, fontWeight: '500' }}>
                      {chat.meal_requests?.budget_range}
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ color: '#6b7280', fontSize: 14 }}>{t('cuisine') || 'Cuisine'}</Text>
                    <Text style={{ color: '#fff', fontSize: 14, fontWeight: '500' }}>
                      {chat.meal_requests?.cuisine}
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ color: '#6b7280', fontSize: 14 }}>{t('groupSize') || 'Group Size'}</Text>
                    <Text style={{ color: '#fff', fontSize: 14, fontWeight: '500' }}>
                      {chat.meal_requests?.group_size} people
                    </Text>
                  </View>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Restaurant banner */}
      {restaurant && (
        <TouchableOpacity
          onPress={() => setShowRequestInfo(true)}
          style={{
            backgroundColor: '#171717',
            paddingHorizontal: 16,
            paddingVertical: 10,
            borderBottomWidth: 1,
            borderBottomColor: '#262626',
          }}
        >
          <Text style={{ color: '#f97316', fontSize: 13, fontWeight: '500' }}>
            📍 {restaurant.name}
          </Text>
          <Text style={{ color: '#6b7280', fontSize: 11, marginTop: 2 }}>
            {t('tapForDetails') || 'Tap for details'}
          </Text>
        </TouchableOpacity>
      )}

      {/* Messages */}
      <MessageList
        messages={messages}
        currentUserId={currentUserId}
        isLoading={messagesLoading}
      />

      {/* Input bar */}
      <ChatInput
        onSendMessage={handleSendMessage}
        isSending={sendMessageMutation.isPending}
      />
    </KeyboardAvoidingView>
  );
}
