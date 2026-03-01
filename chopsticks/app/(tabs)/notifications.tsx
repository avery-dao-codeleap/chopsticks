import { View, Text, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useNotifications, useMarkAsRead } from '@/lib/hooks/queries/useNotifications';

function formatTime(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHrs = Math.floor(diffMins / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  return `${Math.floor(diffHrs / 24)}d ago`;
}

export default function NotificationsTab() {
  const router = useRouter();
  const { data: notifications = [], isLoading } = useNotifications();
  const markRead = useMarkAsRead();

  const handlePress = (n: { id: string; data: Record<string, unknown>; read: boolean }) => {
    if (!n.read) markRead.mutate(n.id);
    const requestId = n.data?.request_id as string | undefined;
    if (requestId) router.push({ pathname: '/(screens)/request-detail', params: { requestId } });
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0a0a0a', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#f97316" />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0a0a0a' }}>
      <FlatList
        data={notifications}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={
          <Text style={{ color: '#6b7280', textAlign: 'center', marginTop: 40 }}>No notifications yet</Text>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => handlePress(item)}
            style={{
              backgroundColor: item.read ? '#171717' : '#1c1917',
              borderRadius: 12, padding: 14, marginBottom: 8,
              borderWidth: item.read ? 0 : 1, borderColor: '#f9731620',
            }}
          >
            <Text style={{ color: '#fff', fontSize: 14 }}>{item.body}</Text>
            <Text style={{ color: '#6b7280', fontSize: 12, marginTop: 4 }}>{formatTime(item.created_at)}</Text>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}
