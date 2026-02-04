import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Alert, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MOCK_REQUESTS, MOCK_USERS } from '@/lib/mockData';

export default function PostMealScreen() {
  const router = useRouter();
  const { requestId } = useLocalSearchParams<{ requestId: string }>();
  const request = MOCK_REQUESTS.find(r => r.id === requestId) || MOCK_REQUESTS[0];
  const otherParticipants = MOCK_USERS.filter(u => u.id !== 'me').slice(0, 2);

  const [step, setStep] = useState<'confirm' | 'rate' | 'review' | 'done'>('confirm');
  const [showedUp, setShowedUp] = useState<Record<string, boolean>>({});
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');

  const handleConfirm = () => {
    setStep('rate');
  };

  const handleRate = () => {
    setStep('review');
  };

  const handleSubmitReview = () => {
    setStep('done');
  };

  const handleDone = () => {
    Alert.alert('Meal Complete!', 'Your meal count has been updated. Thanks for rating!', [
      { text: 'Back to Discovery', onPress: () => router.replace('/(tabs)') },
    ]);
  };

  if (step === 'done') {
    return (
      <View style={styles.container}>
        <View style={styles.centered}>
          <Text style={{ fontSize: 64, marginBottom: 16 }}>🎉</Text>
          <Text style={styles.heading}>Meal Complete!</Text>
          <Text style={styles.subtext}>+1 meal added to your count</Text>
          <TouchableOpacity style={styles.primaryButton} onPress={handleDone}>
            <Text style={styles.primaryButtonText}>Back to Discovery</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20 }}>
      {/* Progress */}
      <View style={styles.progressRow}>
        {['Confirm', 'Rate', 'Review'].map((label, i) => (
          <View key={label} style={styles.progressStep}>
            <View style={[
              styles.progressDot,
              (step === 'confirm' && i === 0) || (step === 'rate' && i <= 1) || (step === 'review' && i <= 2)
                ? styles.progressDotActive : null,
            ]} />
            <Text style={styles.progressLabel}>{label}</Text>
          </View>
        ))}
      </View>

      {/* Restaurant banner */}
      <View style={styles.banner}>
        <Text style={{ fontSize: 28 }}>{request.cuisineEmoji}</Text>
        <View style={{ marginLeft: 12, flex: 1 }}>
          <Text style={styles.bannerTitle}>{request.restaurant.name}</Text>
          <Text style={styles.bannerSub}>{request.cuisine} · {request.timeWindow}</Text>
        </View>
      </View>

      {step === 'confirm' && (
        <View>
          <Text style={styles.heading}>Did this meal happen?</Text>
          <Text style={styles.subtext}>Confirming keeps the chat alive and updates your meal count</Text>
          <TouchableOpacity style={styles.primaryButton} onPress={handleConfirm}>
            <Text style={styles.primaryButtonText}>Yes, we ate together!</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton} onPress={() => router.back()}>
            <Text style={styles.secondaryButtonText}>No, it didn't happen</Text>
          </TouchableOpacity>
        </View>
      )}

      {step === 'rate' && (
        <View>
          <Text style={styles.heading}>Rate your companions</Text>
          <Text style={styles.subtext}>Did they show up?</Text>

          {otherParticipants.map(user => (
            <View key={user.id} style={styles.rateCard}>
              <View style={styles.rateAvatar}>
                <Text style={{ fontSize: 20, color: '#fff' }}>{user.name[0]}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.rateName}>{user.name}, {user.age}</Text>
                <Text style={styles.ratePersona}>
                  {user.persona === 'local' ? '📍 Local' : '✈️ Traveler'}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TouchableOpacity
                  style={[styles.rateButton, showedUp[user.id] === true && styles.rateButtonYes]}
                  onPress={() => setShowedUp(prev => ({ ...prev, [user.id]: true }))}
                >
                  <Text style={styles.rateButtonText}>✓ Yes</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.rateButton, showedUp[user.id] === false && styles.rateButtonNo]}
                  onPress={() => setShowedUp(prev => ({ ...prev, [user.id]: false }))}
                >
                  <Text style={styles.rateButtonText}>✗ No</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}

          <TouchableOpacity style={styles.primaryButton} onPress={handleRate}>
            <Text style={styles.primaryButtonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      )}

      {step === 'review' && (
        <View>
          <Text style={styles.heading}>Review the restaurant</Text>
          <Text style={styles.subtext}>{request.restaurant.name}</Text>

          {/* Star rating */}
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map(star => (
              <TouchableOpacity key={star} onPress={() => setRating(star)}>
                <Text style={{ fontSize: 36 }}>{star <= rating ? '⭐' : '☆'}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Review text */}
          <TextInput
            style={styles.reviewInput}
            placeholder="How was the food? Any tips for others?"
            placeholderTextColor="#6b7280"
            multiline
            numberOfLines={4}
            value={reviewText}
            onChangeText={setReviewText}
          />

          {/* Photo upload mock */}
          <TouchableOpacity style={styles.photoButton}>
            <Text style={{ color: '#9ca3af', fontSize: 14 }}>📷 Add Photos (optional)</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.primaryButton} onPress={handleSubmitReview}>
            <Text style={styles.primaryButtonText}>Submit Review</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton} onPress={() => setStep('done')}>
            <Text style={styles.secondaryButtonText}>Skip Review</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  progressRow: { flexDirection: 'row', justifyContent: 'center', gap: 24, marginBottom: 24 },
  progressStep: { alignItems: 'center' },
  progressDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#262626', marginBottom: 4 },
  progressDotActive: { backgroundColor: '#f97316' },
  progressLabel: { color: '#6b7280', fontSize: 11 },
  banner: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#171717',
    borderRadius: 14, padding: 16, marginBottom: 28,
  },
  bannerTitle: { color: '#fff', fontSize: 16, fontWeight: '600' },
  bannerSub: { color: '#9ca3af', fontSize: 13, marginTop: 2 },
  heading: { color: '#fff', fontSize: 22, fontWeight: '700', marginBottom: 8 },
  subtext: { color: '#9ca3af', fontSize: 14, marginBottom: 24 },
  primaryButton: {
    backgroundColor: '#f97316', borderRadius: 14, paddingVertical: 16,
    alignItems: 'center', marginTop: 12,
  },
  primaryButtonText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  secondaryButton: {
    borderWidth: 1, borderColor: '#374151', borderRadius: 14, paddingVertical: 14,
    alignItems: 'center', marginTop: 10,
  },
  secondaryButtonText: { color: '#9ca3af', fontSize: 15 },
  rateCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#171717',
    borderRadius: 12, padding: 14, marginBottom: 10,
  },
  rateAvatar: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: '#262626',
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  rateName: { color: '#fff', fontSize: 15, fontWeight: '600' },
  ratePersona: { color: '#6b7280', fontSize: 12, marginTop: 2 },
  rateButton: {
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8,
    backgroundColor: '#262626',
  },
  rateButtonYes: { backgroundColor: '#16a34a' },
  rateButtonNo: { backgroundColor: '#dc2626' },
  rateButtonText: { color: '#fff', fontSize: 13, fontWeight: '500' },
  starsRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 20 },
  reviewInput: {
    backgroundColor: '#171717', borderRadius: 12, padding: 14,
    color: '#fff', fontSize: 15, minHeight: 100, textAlignVertical: 'top',
    marginBottom: 12,
  },
  photoButton: {
    borderWidth: 1, borderColor: '#262626', borderStyle: 'dashed',
    borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginBottom: 8,
  },
});
