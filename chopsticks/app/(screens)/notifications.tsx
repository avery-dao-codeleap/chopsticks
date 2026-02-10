import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useI18n } from '@/lib/i18n';
import { useNotifications, useMarkAsRead, useMarkAllAsRead, useDeleteNotification } from '@/hooks/queries/useNotifications';
import { NotificationItem } from '@/components/ui/NotificationItem';

export default function NotificationsScreen() {
  const { t } = useI18n();
  const { data: notifications = [], isLoading } = useNotifications();
  const markAsReadMutation = useMarkAsRead();
  const markAllAsReadMutation = useMarkAllAsRead();
  const deleteNotificationMutation = useDeleteNotification();

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleNotificationPress = (notificationId: string, isRead: boolean) => {
    if (!isRead) {
      markAsReadMutation.mutate(notificationId);
    }
  };

  const handleMarkAllAsRead = () => {
    if (unreadCount > 0) {
      markAllAsReadMutation.mutate();
    }
  };

  const handleDelete = (notificationId: string) => {
    deleteNotificationMutation.mutate(notificationId);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0a0a0a' }} edges={['left', 'right']}>
      <Stack.Screen
        options={{
          headerTitle: t('notifications') || 'Notifications',
          headerRight: () =>
            unreadCount > 0 ? (
              <TouchableOpacity
                onPress={handleMarkAllAsRead}
                disabled={markAllAsReadMutation.isPending}
              >
                <Text style={{ color: '#f97316', fontSize: 14, fontWeight: '600', marginRight: 16 }}>
                  {t('markAllRead') || 'Mark all read'}
                </Text>
              </TouchableOpacity>
            ) : null,
        }}
      />

      {isLoading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color="#f97316" />
        </View>
      ) : notifications.length > 0 ? (
        <>
          {unreadCount > 0 && (
            <View style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
              <Text style={{ color: '#9ca3af', fontSize: 13 }}>
                {unreadCount} unread {unreadCount === 1 ? 'notification' : 'notifications'}
              </Text>
            </View>
          )}
          <FlatList
            data={notifications}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 16 }}
            renderItem={({ item }) => (
              <NotificationItem
                notification={item}
                onPress={() => handleNotificationPress(item.id, item.read)}
                onDelete={() => handleDelete(item.id)}
              />
            )}
          />
        </>
      ) : (
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 32,
          }}
        >
          <Text style={{ fontSize: 48, marginBottom: 16 }}>🔔</Text>
          <Text
            style={{
              color: '#fff',
              fontSize: 20,
              fontWeight: '600',
              textAlign: 'center',
            }}
          >
            {t('noNotifications') || 'No notifications'}
          </Text>
          <Text
            style={{
              color: '#6b7280',
              textAlign: 'center',
              marginTop: 8,
              fontSize: 14,
            }}
          >
            {t('notificationsWillAppearHere') || "You'll see updates about your meal requests here"}
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}
