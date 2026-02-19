import React, { useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { usePendingRatings, useSubmitRatings } from '@/lib/hooks/queries/useRatings';
import { RatingCard } from '@/lib/components/ui/RatingCard';
import { RatingSubmission } from '@/lib/services/api/ratings';

export default function RatingModal() {
  const router = useRouter();
  const { requestId } = useLocalSearchParams<{ requestId?: string }>();
  const { data: allPendingRatings, isLoading } = usePendingRatings();
  const submitRatingsMutation = useSubmitRatings();

  const [ratings, setRatings] = React.useState<Map<string, RatingSubmission>>(new Map());
  const [showThanks, setShowThanks] = React.useState(false);
  const [submittedCount, setSubmittedCount] = React.useState(0);
  const [showedUpCount, setShowedUpCount] = React.useState(0);

  // Filter by requestId if provided
  const pendingRatings = useMemo(() => {
    if (!allPendingRatings) return [];
    if (!requestId) return allPendingRatings;
    return allPendingRatings.filter(r => r.request_id === requestId);
  }, [allPendingRatings, requestId]);

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
      const ratingsArray = Array.from(ratings.values());
      await submitRatingsMutation.mutateAsync(ratingsArray);
      setSubmittedCount(ratingsArray.length);
      setShowedUpCount(ratingsArray.filter(r => r.showed_up).length);
      setShowThanks(true);
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
      <View style={{ flex: 1, backgroundColor: '#0a0a0a', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#f97316" />
      </View>
    );
  }

  // Thanks / celebration screen after submitting
  if (showThanks) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0a0a0a', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <Text style={{ fontSize: 64, marginBottom: 16 }}>🙏</Text>
        <Text style={{ color: '#fff', fontSize: 24, fontWeight: '700', marginBottom: 8 }}>
          Thanks!
        </Text>
        <Text style={{ color: '#9ca3af', fontSize: 15, textAlign: 'center', marginBottom: 28 }}>
          Your ratings help build a trustworthy community.
        </Text>

        {/* Stats */}
        <View style={{ flexDirection: 'row', gap: 16, marginBottom: 32 }}>
          <View style={{
            backgroundColor: '#171717', borderRadius: 16, padding: 20, alignItems: 'center', minWidth: 100,
          }}>
            <Text style={{ fontSize: 28 }}>✅</Text>
            <Text style={{ color: '#fff', fontSize: 24, fontWeight: '700', marginTop: 4 }}>{showedUpCount}</Text>
            <Text style={{ color: '#6b7280', fontSize: 12 }}>Showed up</Text>
          </View>
          <View style={{
            backgroundColor: '#171717', borderRadius: 16, padding: 20, alignItems: 'center', minWidth: 100,
          }}>
            <Text style={{ fontSize: 28 }}>📝</Text>
            <Text style={{ color: '#fff', fontSize: 24, fontWeight: '700', marginTop: 4 }}>{submittedCount}</Text>
            <Text style={{ color: '#6b7280', fontSize: 12 }}>Rated</Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => router.back()}
          style={{ backgroundColor: '#f97316', paddingHorizontal: 32, paddingVertical: 14, borderRadius: 14 }}
        >
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>Done</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!pendingRatings || pendingRatings.length === 0) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0a0a0a', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <Text style={{ fontSize: 48, marginBottom: 16 }}>✓</Text>
        <Text style={{ color: '#fff', fontSize: 20, fontWeight: '600', marginBottom: 8 }}>
          No Ratings Pending
        </Text>
        <Text style={{ color: '#6b7280', textAlign: 'center', marginBottom: 24 }}>
          You're all caught up! Ratings will appear here after your meals.
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ backgroundColor: '#f97316', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 }}
        >
          <Text style={{ color: '#fff', fontWeight: '600' }}>Close</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#0a0a0a' }}>
      {/* Header */}
      <View style={{ backgroundColor: '#171717', borderBottomWidth: 1, borderBottomColor: '#262626', paddingTop: 16, paddingBottom: 16, paddingHorizontal: 20 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View>
            <Text style={{ color: '#fff', fontSize: 22, fontWeight: '700' }}>
              Rate Your Meal
            </Text>
            <Text style={{ color: '#6b7280', fontSize: 13, marginTop: 4 }}>
              {pendingRatings.length} {pendingRatings.length === 1 ? 'person' : 'people'} to rate
            </Text>
          </View>
          <TouchableOpacity onPress={handleSkip} style={{ paddingHorizontal: 12, paddingVertical: 8 }}>
            <Text style={{ color: '#6b7280', fontSize: 15 }}>Skip</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Ratings List */}
      <ScrollView
        style={{ flex: 1, paddingHorizontal: 20, paddingTop: 16 }}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        <Text style={{ color: '#9ca3af', fontSize: 13, marginBottom: 16 }}>
          Did your meal companions show up?
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
      <View style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        backgroundColor: '#171717', borderTopWidth: 1, borderTopColor: '#262626',
        padding: 20, paddingBottom: 36,
      }}>
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={submitRatingsMutation.isPending || ratings.size === 0}
          style={{
            backgroundColor: submitRatingsMutation.isPending || ratings.size === 0 ? '#262626' : '#f97316',
            paddingVertical: 16, borderRadius: 14, alignItems: 'center',
          }}
        >
          {submitRatingsMutation.isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={{ color: '#fff', fontSize: 17, fontWeight: '700', textAlign: 'center' }}>
              Submit {ratings.size > 0 ? `${ratings.size} ` : ''}Rating{ratings.size !== 1 ? 's' : ''}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
