import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { PendingRating } from '@/services/api/ratings';

type RatingCardProps = {
  rating: PendingRating;
  onRate: (showedUp: boolean) => void;
  disabled?: boolean;
};

export function RatingCard({ rating, onRate, disabled }: RatingCardProps) {
  const [selected, setSelected] = React.useState<boolean | null>(null);

  const handleRate = (showedUp: boolean) => {
    setSelected(showedUp);
    onRate(showedUp);
  };

  return (
    <View className="bg-white rounded-xl p-4 mb-3 border border-gray-200">
      {/* User Info */}
      <View className="flex-row items-center mb-3">
        {rating.rated_photo_url ? (
          <Image
            source={{ uri: rating.rated_photo_url }}
            className="w-14 h-14 rounded-full mr-3"
          />
        ) : (
          <View className="w-14 h-14 rounded-full bg-gray-200 mr-3 items-center justify-center">
            <Text className="text-gray-500 text-lg font-semibold">
              {rating.rated_name?.[0]?.toUpperCase() || '?'}
            </Text>
          </View>
        )}
        <View className="flex-1">
          <Text className="text-base font-semibold text-gray-900">
            {rating.rated_name || 'Unknown'}
          </Text>
          <Text className="text-sm text-gray-600">
            {rating.restaurant_name}
          </Text>
          <Text className="text-xs text-gray-500">
            {new Date(rating.time_window).toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
            })}
          </Text>
        </View>
      </View>

      {/* Question */}
      <Text className="text-sm text-gray-700 mb-3 text-center">
        Did they show up?
      </Text>

      {/* Yes/No Buttons */}
      <View className="flex-row gap-3">
        <TouchableOpacity
          onPress={() => handleRate(true)}
          disabled={disabled}
          className={`flex-1 py-3 rounded-lg border-2 ${
            selected === true
              ? 'bg-green-50 border-green-500'
              : 'bg-white border-gray-300'
          } ${disabled ? 'opacity-50' : ''}`}
        >
          <Text
            className={`text-center font-semibold ${
              selected === true ? 'text-green-600' : 'text-gray-700'
            }`}
          >
            ✓ Yes
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleRate(false)}
          disabled={disabled}
          className={`flex-1 py-3 rounded-lg border-2 ${
            selected === false
              ? 'bg-red-50 border-red-500'
              : 'bg-white border-gray-300'
          } ${disabled ? 'opacity-50' : ''}`}
        >
          <Text
            className={`text-center font-semibold ${
              selected === false ? 'text-red-600' : 'text-gray-700'
            }`}
          >
            ✗ No
          </Text>
        </TouchableOpacity>
      </View>

      {/* Selected Indicator */}
      {selected !== null && (
        <Text className="text-xs text-gray-500 text-center mt-2">
          {selected ? 'Marked as showed up' : 'Marked as no-show'}
        </Text>
      )}
    </View>
  );
}
