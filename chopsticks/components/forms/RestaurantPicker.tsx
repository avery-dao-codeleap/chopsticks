import { useState } from 'react';
import { View, Text, TextInput, FlatList, Pressable, ActivityIndicator } from 'react-native';
import { useRestaurants } from '@/hooks/queries/useRestaurants';
import type { RestaurantRow } from '@/services/api/restaurants';

interface RestaurantPickerProps {
  selected: RestaurantRow | null;
  onSelect: (restaurant: RestaurantRow) => void;
  onAddManually: () => void;
}

export function RestaurantPicker({ selected, onSelect, onAddManually }: RestaurantPickerProps) {
  const [search, setSearch] = useState('');
  const { data: restaurants, isLoading } = useRestaurants(search);

  if (selected) {
    return (
      <Pressable
        onPress={() => onSelect(null as unknown as RestaurantRow)}
        className="bg-card border-2 border-primary rounded-xl px-4 py-3 flex-row items-center justify-between"
      >
        <View className="flex-1">
          <Text className="text-white font-semibold">{selected.name}</Text>
          <Text className="text-gray-400 text-sm">{selected.address}</Text>
        </View>
        <Text className="text-gray-400 text-sm ml-2">Change</Text>
      </Pressable>
    );
  }

  return (
    <View>
      <TextInput
        value={search}
        onChangeText={setSearch}
        placeholder="Search restaurants..."
        placeholderTextColor="#9ca3af"
        className="bg-card border-2 border-border rounded-xl px-4 py-3 text-white text-base mb-2"
      />

      {isLoading && (
        <ActivityIndicator size="small" color="#f97316" className="my-2" />
      )}

      <FlatList
        data={restaurants?.slice(0, 5) ?? []}
        keyExtractor={(item) => item.id}
        keyboardShouldPersistTaps="handled"
        scrollEnabled={false}
        ListHeaderComponent={
          <Pressable
            onPress={onAddManually}
            className="bg-card border-2 border-dashed border-border rounded-xl px-4 py-3 mb-2"
          >
            <Text className="text-primary font-medium text-center">+ Add restaurant manually</Text>
          </Pressable>
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => {
              onSelect(item);
              setSearch('');
            }}
            className="bg-card border-2 border-border rounded-xl px-4 py-3 mb-2 active:border-primary"
          >
            <Text className="text-white font-medium">{item.name}</Text>
            <Text className="text-gray-400 text-sm">{item.address}</Text>
          </Pressable>
        )}
      />
    </View>
  );
}
