import { View, Text, TouchableOpacity } from 'react-native';
import { format, isToday, isYesterday } from 'date-fns';
import { getMealStatus } from '@/lib/mealStatus';

interface ChatListItemProps {
  chatId: string;
  restaurantName: string;
  restaurantDistrict: string;
  participantCount: number;
  timeWindow: string;
  mealCompletedAt: string | null;
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
  timeWindow,
  mealCompletedAt,
  lastMessage,
  currentUserId,
  onPress,
}: ChatListItemProps) {
  const mealStatus = getMealStatus(timeWindow, mealCompletedAt, false);
  const isArchived = mealStatus.status === 'archived';

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
        backgroundColor: isArchived ? '#18181b' : '#171717',
        borderRadius: 14,
        padding: 14,
        marginBottom: 8,
        opacity: isArchived ? 0.6 : 1,
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
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
            <Text
              style={{ color: isArchived ? '#9ca3af' : '#fff', fontSize: 15, fontWeight: '600' }}
              numberOfLines={1}
            >
              {restaurantName}
            </Text>
            {mealStatus.status !== 'active' && (
              <View style={{
                backgroundColor: mealStatus.color,
                paddingHorizontal: 6,
                paddingVertical: 2,
                borderRadius: 4,
                marginLeft: 8,
              }}>
                <Text style={{ color: '#fff', fontSize: 9, fontWeight: '700' }}>
                  {mealStatus.label.toUpperCase()}
                </Text>
              </View>
            )}
          </View>
          <Text style={{ color: '#4b5563', fontSize: 11, marginLeft: 8 }}>
            {lastMessage
              ? formatMessageTime(lastMessage.created_at)
              : (timeWindow ? formatMessageTime(timeWindow) : '')
            }
          </Text>
        </View>

        <Text style={{ color: isArchived ? '#6b7280' : '#f97316', fontSize: 12, marginTop: 2 }}>
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
