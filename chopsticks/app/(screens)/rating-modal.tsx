import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { usePendingRatings, useSubmitRatings } from '@/hooks/queries/useRatings';
import { RatingCard } from '@/components/ui/RatingCard';
import { RatingSubmission } from '@/services/api/ratings';

export default function RatingModal() {
  const router = useRouter();
  const { data: pendingRatings, isLoading } = usePendingRatings();
  const submitRatingsMutation = useSubmitRatings();

  const [ratings, setRatings] = React.useState<Map<string, RatingSubmission>>(new Map());

  const handleRate = (rated_id: string, request_id: string, showed_up: boolean) => {
    setRatings(prev => {
      const next = new Map(prev);
      next.set(`${request_id}-${rated_id}`, {
        rated_id,
        request_id,
        showed_up,
      });
      return next;
    });
  };

  const handleSubmit = async () => {
    if (ratings.size === 0) {
      Alert.alert('No Ratings', 'Please rate at least one participant before submitting.');
      return;
    }

    try {
      await submitRatingsMutation.mutateAsync(Array.from(ratings.values()));
      Alert.alert(
        'Ratings Submitted',
        'Thank you for rating your meal companions!',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to submit ratings. Please try again.');
      console.error('Rating submission error:', error);
    }
  };

  const handleSkip = () => {
    Alert.alert(
      'Skip Ratings?',
      'You can rate these meals later from your profile.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Skip', style: 'destructive', onPress: () => router.back() },
      ]
    );
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center">
        <ActivityIndicator size="large" color="#FF6B35" />
      </View>
    );
  }

  if (!pendingRatings || pendingRatings.length === 0) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center p-6">
        <Text className="text-xl font-semibold text-gray-900 mb-2">
          No Ratings Pending
        </Text>
        <Text className="text-gray-600 text-center mb-6">
          You're all caught up! Ratings will appear here after your meals.
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="bg-orange-500 px-6 py-3 rounded-lg"
        >
          <Text className="text-white font-semibold">Close</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white border-b border-gray-200 pt-12 pb-4 px-6">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-2xl font-bold text-gray-900">
              Rate Your Meals
            </Text>
            <Text className="text-sm text-gray-600 mt-1">
              {pendingRatings.length} {pendingRatings.length === 1 ? 'person' : 'people'} to rate
            </Text>
          </View>
          <TouchableOpacity
            onPress={handleSkip}
            className="px-4 py-2"
          >
            <Text className="text-gray-600">Skip</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Ratings List */}
      <ScrollView
        className="flex-1 px-6 pt-4"
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        <Text className="text-sm text-gray-600 mb-4">
          Help us improve the community by rating whether your meal companions showed up:
        </Text>

        {pendingRatings.map((rating) => (
          <RatingCard
            key={`${rating.request_id}-${rating.rated_id}`}
            rating={rating}
            onRate={(showedUp) => handleRate(rating.rated_id, rating.request_id, showedUp)}
            disabled={submitRatingsMutation.isPending}
          />
        ))}
      </ScrollView>

      {/* Submit Button */}
      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-6">
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={submitRatingsMutation.isPending || ratings.size === 0}
          className={`py-4 rounded-lg ${
            submitRatingsMutation.isPending || ratings.size === 0
              ? 'bg-gray-300'
              : 'bg-orange-500'
          }`}
        >
          {submitRatingsMutation.isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white text-center font-semibold text-lg">
              Submit {ratings.size > 0 ? `${ratings.size} ` : ''}Rating{ratings.size !== 1 ? 's' : ''}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
