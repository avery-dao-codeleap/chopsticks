import { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

// Placeholder chat data
const PLACEHOLDER_CHATS = [
  {
    id: '1',
    matchId: 'm1',
    otherUser: {
      id: 'u1',
      name: 'Minh',
      profileImageUrl: null,
    },
    lastMessage: {
      content: 'How about Pho Hoa tomorrow at 7pm?',
      sentAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 mins ago
      isRead: false,
    },
    restaurant: {
      name: 'Pho Hoa Pasteur',
    },
  },
  {
    id: '2',
    matchId: 'm2',
    otherUser: {
      id: 'u2',
      name: 'Linh',
      profileImageUrl: null,
    },
    lastMessage: {
      content: 'That was a great meal! Same place next week?',
      sentAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
      isRead: true,
    },
    mealCount: 3,
  },
];

function formatTime(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function ChatItem({ chat, onPress }: { chat: typeof PLACEHOLDER_CHATS[0]; onPress: () => void }) {
  return (
    <TouchableOpacity
      className="flex-row items-center px-4 py-3 bg-surface mb-2 rounded-xl"
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Avatar */}
      <View className="w-14 h-14 rounded-full bg-surface-elevated items-center justify-center mr-3">
        {chat.otherUser.profileImageUrl ? (
          <Image
            source={{ uri: chat.otherUser.profileImageUrl }}
            className="w-full h-full rounded-full"
          />
        ) : (
          <Text className="text-2xl">{chat.otherUser.name[0]}</Text>
        )}
      </View>

      {/* Content */}
      <View className="flex-1">
        <View className="flex-row justify-between items-center mb-1">
          <View className="flex-row items-center">
            <Text className="text-white font-semibold text-base">
              {chat.otherUser.name}
            </Text>
            {chat.mealCount && (
              <View className="ml-2 flex-row items-center">
                <Text className="text-primary-500 text-xs">🍜 {chat.mealCount}</Text>
              </View>
            )}
          </View>
          <Text className="text-gray-500 text-xs">
            {formatTime(chat.lastMessage.sentAt)}
          </Text>
        </View>

        <View className="flex-row items-center">
          <Text
            className={`flex-1 text-sm ${
              chat.lastMessage.isRead ? 'text-gray-400' : 'text-white'
            }`}
            numberOfLines={1}
          >
            {chat.lastMessage.content}
          </Text>
          {!chat.lastMessage.isRead && (
            <View className="w-2 h-2 rounded-full bg-primary-500 ml-2" />
          )}
        </View>

        {chat.restaurant && (
          <View className="flex-row items-center mt-1">
            <Text className="text-xs text-primary-400">
              📍 {chat.restaurant.name}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

export default function ChatScreen() {
  const router = useRouter();
  const [chats, setChats] = useState(PLACEHOLDER_CHATS);

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['left', 'right']}>
      {chats.length > 0 ? (
        <FlatList
          data={chats}
          keyExtractor={item => item.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8 }}
          renderItem={({ item }) => (
            <ChatItem
              chat={item}
              onPress={() => {
                // TODO: Navigate to chat detail
                console.log('Open chat', item.matchId);
              }}
            />
          )}
          ListHeaderComponent={
            <View className="mb-4">
              <Text className="text-gray-400 text-sm">
                {chats.length} active conversation{chats.length !== 1 ? 's' : ''}
              </Text>
            </View>
          }
        />
      ) : (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-5xl mb-4">💬</Text>
          <Text className="text-white text-xl font-semibold mb-2 text-center">
            No conversations yet
          </Text>
          <Text className="text-gray-400 text-center mb-6">
            Match with someone to start chatting and plan your next meal together
          </Text>
          <TouchableOpacity
            className="bg-primary-500 px-6 py-3 rounded-xl"
            onPress={() => router.push('/(tabs)/')}
          >
            <Text className="text-white font-semibold">Find Meal Buddies</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}
