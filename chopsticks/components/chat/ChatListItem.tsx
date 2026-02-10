import { View, Text, TouchableOpacity } from 'react-native';
import { format, isToday, isYesterday } from 'date-fns';

interface ChatListItemProps {
  chatId: string;
  restaurantName: string;
  restaurantDistrict: string;
  participantCount: number;
  lastMessage?: {
    content: string;
    created_at: string;
    sender_id: string;
  } | null;
  currentUserId: string;
  onPress: () => void;
}

export function ChatListItem({
  restaurantName,
  restaurantDistrict,
  participantCount,
  lastMessage,
  currentUserId,
  onPress,
}: ChatListItemProps) {
  const formatMessageTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      if (isToday(date)) {
        return format(date, 'h:mm a');
      } else if (isYesterday(date)) {
        return 'Yesterday';
      } else {
        return format(date, 'MMM d');
      }
    } catch {
      return '';
    }
  };

  const truncateMessage = (text: string, maxLength: number = 50) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

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
      <View
        style={{
          width: 50,
          height: 50,
          borderRadius: 25,
          backgroundColor: '#262626',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 12,
        }}
      >
        <Text style={{ fontSize: 20 }}>👥</Text>
      </View>

      {/* Content */}
      <View style={{ flex: 1 }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Text
            style={{ color: '#fff', fontSize: 15, fontWeight: '600' }}
            numberOfLines={1}
          >
            {restaurantName}
          </Text>
          {lastMessage && (
            <Text style={{ color: '#4b5563', fontSize: 11 }}>
              {formatMessageTime(lastMessage.created_at)}
            </Text>
          )}
        </View>

        <Text style={{ color: '#f97316', fontSize: 12, marginTop: 2 }}>
          📍 {restaurantDistrict}
        </Text>

        {lastMessage ? (
          <Text
            style={{ color: '#9ca3af', fontSize: 13, marginTop: 2 }}
            numberOfLines={1}
          >
            {lastMessage.sender_id === currentUserId && 'You: '}
            {truncateMessage(lastMessage.content)}
          </Text>
        ) : (
          <Text style={{ color: '#6b7280', fontSize: 13, marginTop: 2 }}>
            No messages yet
          </Text>
        )}

        <Text style={{ color: '#4b5563', fontSize: 11, marginTop: 2 }}>
          {participantCount} {participantCount === 1 ? 'person' : 'people'}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
