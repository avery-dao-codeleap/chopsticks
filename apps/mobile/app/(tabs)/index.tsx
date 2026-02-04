import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

// Placeholder match card component
function MatchCard({ user, onPress }: { user: any; onPress: () => void }) {
  return (
    <TouchableOpacity
      className="bg-surface rounded-2xl overflow-hidden mb-4"
      onPress={onPress}
      activeOpacity={0.9}
    >
      {/* Profile Image */}
      <View className="h-64 bg-surface-elevated items-center justify-center">
        {user.profileImageUrl ? (
          <Image
            source={{ uri: user.profileImageUrl }}
            className="w-full h-full"
            resizeMode="cover"
          />
        ) : (
          <Text className="text-6xl">{user.name?.[0] || '?'}</Text>
        )}
      </View>

      {/* Info */}
      <View className="p-4">
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-white text-xl font-bold">
            {user.name}, {user.age}
          </Text>
          <View className="flex-row items-center">
            <Text className="text-primary-500 mr-1">🍜</Text>
            <Text className="text-gray-400 text-sm">{user.mealCount || 0} meals</Text>
          </View>
        </View>

        {user.bio && (
          <Text className="text-gray-400 mb-3" numberOfLines={2}>
            {user.bio}
          </Text>
        )}

        {/* Cuisine Tags */}
        <View className="flex-row flex-wrap gap-2">
          {(user.cuisineTypes || ['Vietnamese', 'Street Food']).slice(0, 4).map((cuisine: string) => (
            <View key={cuisine} className="bg-surface-elevated px-3 py-1 rounded-full">
              <Text className="text-gray-300 text-xs">{cuisine}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Action Buttons */}
      <View className="flex-row border-t border-surface-elevated">
        <TouchableOpacity className="flex-1 py-4 items-center">
          <Text className="text-gray-400 text-lg">✕</Text>
        </TouchableOpacity>
        <View className="w-px bg-surface-elevated" />
        <TouchableOpacity className="flex-1 py-4 items-center">
          <Text className="text-primary-500 text-lg">🥢</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

export default function FeedScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  // Placeholder data - will be replaced with real data from matching algorithm
  const placeholderUsers = [
    {
      id: '1',
      name: 'Minh',
      age: 25,
      bio: 'Love trying new pho spots around District 1. Always down for late-night banh mi runs!',
      profileImageUrl: null,
      mealCount: 12,
      cuisineTypes: ['Vietnamese', 'Street Food', 'BBQ'],
    },
    {
      id: '2',
      name: 'Linh',
      age: 23,
      bio: 'Foodie exploring hidden gems in HCMC. Korean BBQ enthusiast.',
      profileImageUrl: null,
      mealCount: 8,
      cuisineTypes: ['Korean', 'Japanese', 'Fusion'],
    },
    {
      id: '3',
      name: 'Duc',
      age: 27,
      bio: 'Street food photographer. Know all the best spots!',
      profileImageUrl: null,
      mealCount: 45,
      cuisineTypes: ['Vietnamese', 'Chinese', 'Seafood'],
    },
  ];

  const onRefresh = async () => {
    setRefreshing(true);
    // TODO: Fetch new matches
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['left', 'right']}>
      <ScrollView
        className="flex-1 px-4"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#f97316"
          />
        }
      >
        {/* Header prompt */}
        <View className="py-4">
          <Text className="text-gray-400 text-center">
            Swipe or tap 🥢 to connect
          </Text>
        </View>

        {/* Match Cards */}
        {placeholderUsers.map(user => (
          <MatchCard
            key={user.id}
            user={user}
            onPress={() => {
              // TODO: Navigate to user profile or send match request
              console.log('Match with', user.name);
            }}
          />
        ))}

        {/* Empty state */}
        {placeholderUsers.length === 0 && (
          <View className="items-center justify-center py-20">
            <Text className="text-4xl mb-4">🥡</Text>
            <Text className="text-white text-xl font-semibold mb-2">No matches yet</Text>
            <Text className="text-gray-400 text-center">
              Check back later or adjust your preferences
            </Text>
          </View>
        )}

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
