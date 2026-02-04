import { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { MOCK_NOTIFICATIONS, type MockNotification } from '@/lib/mockData';

const TYPE_ICONS: Record<MockNotification['type'], string> = {
  join_request: '🙋',
  join_approved: '✅',
  new_message: '💬',
};

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

  const markRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  return (
    <FlatList
      data={notifications}
      keyExtractor={n => n.id}
      contentContainerStyle={{ padding: 16 }}
      style={{ flex: 1, backgroundColor: '#0a0a0a' }}
      renderItem={({ item }) => (
        <TouchableOpacity
          onPress={() => markRead(item.id)}
          activeOpacity={0.7}
          style={{
            backgroundColor: '#171717',
            borderRadius: 12,
            padding: 14,
            marginBottom: 8,
            flexDirection: 'row',
            alignItems: 'flex-start',
            borderLeftWidth: item.read ? 0 : 3,
            borderLeftColor: '#f97316',
          }}
        >
          <Text style={{ fontSize: 22, marginRight: 12, marginTop: 2 }}>{TYPE_ICONS[item.type]}</Text>
          <View style={{ flex: 1 }}>
            <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600' }}>{item.title}</Text>
            <Text style={{ color: '#9ca3af', fontSize: 13, marginTop: 2 }}>{item.body}</Text>
            <Text style={{ color: '#4b5563', fontSize: 11, marginTop: 4 }}>{item.time}</Text>
          </View>
        </TouchableOpacity>
      )}
      ListEmptyComponent={
        <View style={{ alignItems: 'center', paddingTop: 60 }}>
          <Text style={{ fontSize: 40, marginBottom: 12 }}>🔔</Text>
          <Text style={{ color: '#fff', fontSize: 18, fontWeight: '600' }}>No notifications</Text>
        </View>
      }
    />
  );
}
