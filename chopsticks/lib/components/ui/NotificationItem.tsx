import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { formatDistanceToNow } from 'date-fns';
import type { Notification } from '@/lib/services/api/notifications';

interface NotificationItemProps {
  notification: Notification;
  onPress?: () => void;
  onDelete?: () => void;
}

export function NotificationItem({
  notification,
  onPress,
  onDelete,
}: NotificationItemProps) {
  const router = useRouter();

  const formatTime = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch {
      return '';
    }
  };

  const handlePress = () => {
    if (onPress) {
      onPress();
    }

    // Handle navigation based on notification type
    if (notification.type === 'join_request' && notification.data?.requestId) {
      router.push({
        pathname: '/(screens)/pending-requests',
        params: { requestId: notification.data.requestId },
      });
    } else if (notification.type === 'new_message' && notification.data?.chatId) {
      router.push({
        pathname: '/(screens)/chat-detail',
        params: { chatId: notification.data.chatId },
      });
    } else if (notification.data?.requestId) {
      // join_approved, request_canceled, etc. → request detail
      router.push({
        pathname: '/(screens)/request-detail',
        params: { requestId: notification.data.requestId },
      });
    }
  };

  const getIcon = () => {
    switch (notification.type) {
      case 'join_request':
        return '👋';
      case 'request_approved':
        return '✅';
      case 'request_rejected':
        return '❌';
      case 'new_message':
        return '💬';
      case 'meal_reminder':
        return '🍽️';
      default:
        return '🔔';
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      style={{
        flexDirection: 'row',
        backgroundColor: notification.read ? '#171717' : '#1c1c1c',
        borderRadius: 12,
        padding: 14,
        marginBottom: 8,
        borderLeftWidth: 3,
        borderLeftColor: notification.read ? '#262626' : '#f97316',
      }}
    >
      {/* Icon */}
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
        <Text style={{ fontSize: 20 }}>{getIcon()}</Text>
      </View>

      {/* Content */}
      <View style={{ flex: 1 }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 4,
          }}
        >
          <Text
            style={{
              color: '#fff',
              fontSize: 15,
              fontWeight: notification.read ? '500' : '600',
              flex: 1,
            }}
          >
            {notification.title}
          </Text>
          {!notification.read && (
            <View
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: '#f97316',
                marginLeft: 8,
              }}
            />
          )}
        </View>

        <Text
          style={{
            color: notification.read ? '#6b7280' : '#9ca3af',
            fontSize: 14,
            marginBottom: 4,
          }}
          numberOfLines={2}
        >
          {notification.body}
        </Text>

        <Text style={{ color: '#4b5563', fontSize: 12 }}>
          {formatTime(notification.created_at)}
        </Text>
      </View>

      {/* Delete button */}
      {onDelete && (
        <TouchableOpacity
          onPress={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          style={{
            padding: 8,
            marginLeft: 8,
          }}
        >
          <Text style={{ color: '#6b7280', fontSize: 18 }}>×</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}
