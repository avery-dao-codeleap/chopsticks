import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Placeholder restaurant data
const PLACEHOLDER_RESTAURANTS = [
  {
    id: '1',
    name: 'Pho Hoa Pasteur',
    cuisineType: 'Vietnamese',
    priceRange: 'cheap',
    rating: 4.5,
    latitude: 10.7769,
    longitude: 106.6955,
    address: '260C Pasteur, District 3',
    city: 'Ho Chi Minh City',
  },
  {
    id: '2',
    name: 'Banh Mi Huynh Hoa',
    cuisineType: 'Vietnamese',
    priceRange: 'cheap',
    rating: 4.8,
    latitude: 10.7728,
    longitude: 106.6897,
    address: '26 Le Thi Rieng, District 1',
    city: 'Ho Chi Minh City',
    isHiddenGem: true,
  },
  {
    id: '3',
    name: 'Com Tam Moc',
    cuisineType: 'Vietnamese',
    priceRange: 'cheap',
    rating: 4.3,
    latitude: 10.7856,
    longitude: 106.6782,
    address: '85 Ly Tu Trong, District 1',
    city: 'Ho Chi Minh City',
  },
  {
    id: '4',
    name: 'Bun Cha 145',
    cuisineType: 'Vietnamese',
    priceRange: 'cheap',
    rating: 4.2,
    latitude: 10.7801,
    longitude: 106.6912,
    address: '145 Bui Vien, District 1',
    city: 'Ho Chi Minh City',
  },
  {
    id: '5',
    name: 'Korean BBQ Town',
    cuisineType: 'Korean',
    priceRange: 'moderate',
    rating: 4.4,
    latitude: 10.7892,
    longitude: 106.6823,
    address: 'Pham Ngu Lao, District 1',
    city: 'Ho Chi Minh City',
  },
];

const CUISINE_FILTERS = [
  { label: 'All', value: null, emoji: '🍽️' },
  { label: 'Vietnamese', value: 'Vietnamese', emoji: '🍜' },
  { label: 'Korean', value: 'Korean', emoji: '🥘' },
  { label: 'Japanese', value: 'Japanese', emoji: '🍣' },
  { label: 'Street Food', value: 'Street Food', emoji: '🥡' },
  { label: 'BBQ', value: 'BBQ', emoji: '🍖' },
];

function RestaurantCard({ restaurant, onPress }: { restaurant: typeof PLACEHOLDER_RESTAURANTS[0]; onPress: () => void }) {
  const getPriceEmoji = (priceRange: string) => {
    switch (priceRange) {
      case 'cheap': return '💵';
      case 'moderate': return '💰';
      case 'expensive': return '💎';
      default: return '💵';
    }
  };

  return (
    <TouchableOpacity
      className="bg-surface rounded-xl p-4 mb-3"
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View className="flex-row justify-between items-start mb-2">
        <View className="flex-1">
          <View className="flex-row items-center mb-1">
            <Text className="text-white text-lg font-bold mr-2">
              {restaurant.name}
            </Text>
            {restaurant.isHiddenGem && (
              <View className="bg-secondary-500 px-2 py-0.5 rounded">
                <Text className="text-white text-xs">💎 Hidden Gem</Text>
              </View>
            )}
          </View>
          <Text className="text-gray-400 text-sm">{restaurant.address}</Text>
        </View>
      </View>

      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Text className="text-yellow-400 mr-1">★</Text>
          <Text className="text-white mr-3">{restaurant.rating}</Text>
          <Text className="mr-1">{getPriceEmoji(restaurant.priceRange)}</Text>
          <Text className="text-gray-400">{restaurant.cuisineType}</Text>
        </View>
        <TouchableOpacity className="bg-primary-500 px-3 py-1.5 rounded-lg">
          <Text className="text-white text-sm font-medium">Find Buddy</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

export default function DiscoverScreen() {
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter restaurants based on selection
  const filteredRestaurants = PLACEHOLDER_RESTAURANTS.filter(r => {
    if (selectedFilter && r.cuisineType !== selectedFilter) return false;
    if (searchQuery && !r.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['left', 'right']}>
      {/* Search Bar */}
      <View className="px-4 pt-4 pb-2">
        <View className="bg-surface rounded-xl flex-row items-center px-4">
          <Text className="text-gray-400 mr-2">🔍</Text>
          <TextInput
            className="flex-1 py-3 text-white"
            placeholder="Search restaurants..."
            placeholderTextColor="#6b7280"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Cuisine Filters */}
      <View className="py-2">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16 }}
        >
          {CUISINE_FILTERS.map(filter => (
            <TouchableOpacity
              key={filter.label}
              className={`mr-2 px-4 py-2 rounded-full flex-row items-center ${
                selectedFilter === filter.value ? 'bg-primary-500' : 'bg-surface'
              }`}
              onPress={() => setSelectedFilter(filter.value)}
            >
              <Text className="mr-1">{filter.emoji}</Text>
              <Text
                className={selectedFilter === filter.value ? 'text-white' : 'text-gray-300'}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Map Placeholder */}
      <View className="mx-4 mb-3 bg-surface-elevated rounded-xl p-4 items-center">
        <Text className="text-3xl mb-2">🗺️</Text>
        <Text className="text-gray-400 text-sm text-center">
          Map view coming soon!{'\n'}Browse restaurants below
        </Text>
      </View>

      {/* Restaurant List */}
      <FlatList
        data={filteredRestaurants}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
        renderItem={({ item }) => (
          <RestaurantCard
            restaurant={item}
            onPress={() => console.log('Selected:', item.name)}
          />
        )}
        ListEmptyComponent={
          <View className="items-center py-10">
            <Text className="text-4xl mb-2">🍜</Text>
            <Text className="text-gray-400">No restaurants found</Text>
          </View>
        }
        ListHeaderComponent={
          <Text className="text-gray-400 text-sm mb-3">
            {filteredRestaurants.length} spots in Ho Chi Minh City
          </Text>
        }
      />
    </SafeAreaView>
  );
}
