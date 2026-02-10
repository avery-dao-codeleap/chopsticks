import { useRef, useEffect } from 'react';
import { FlatList, View, ActivityIndicator, Text } from 'react-native';
import { MessageBubble } from './MessageBubble';
import { useI18n } from '@/lib/i18n';

interface Message {
  id: string;
  content: string;
  image_url?: string | null;
  sender_id: string;
  created_at: string;
  users?: {
    id: string;
    name: string;
    photo_url: string | null;
  } | null;
}

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
  isLoading?: boolean;
  onMessageLongPress?: (messageId: string) => void;
}

export function MessageList({
  messages,
  currentUserId,
  isLoading = false,
  onMessageLongPress,
}: MessageListProps) {
  const { t } = useI18n();
  const listRef = useRef<FlatList>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        listRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#f97316" />
      </View>
    );
  }

  if (messages.length === 0) {
    return (
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
            fontSize: 18,
            fontWeight: '600',
            textAlign: 'center',
          }}
        >
          {t('noMessagesYet') || 'No messages yet'}
        </Text>
        <Text
          style={{
            color: '#6b7280',
            textAlign: 'center',
            marginTop: 8,
            fontSize: 14,
          }}
        >
          {t('startConversation') || 'Start the conversation!'}
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      ref={listRef}
      data={messages}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ padding: 16, paddingBottom: 8 }}
      onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
      renderItem={({ item }) => (
        <MessageBubble
          id={item.id}
          content={item.content}
          imageUrl={item.image_url}
          senderId={item.sender_id}
          senderName={item.users?.name}
          senderPhotoUrl={item.users?.photo_url}
          createdAt={item.created_at}
          isCurrentUser={item.sender_id === currentUserId}
          onLongPress={
            onMessageLongPress ? () => onMessageLongPress(item.id) : undefined
          }
        />
      )}
    />
  );
}
