import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/lib/stores/auth';

export default function IntentScreen() {
  const router = useRouter();
  const { setOnboarded } = useAuthStore();

  const handleChoice = async (knowsWhere: boolean) => {
    // Mark onboarding as complete
    await setOnboarded(true);

    // Route based on intent
    if (knowsWhere) {
      // User knows where to eat → Take them to create request screen
      // Use push instead of replace so user can go back
      router.push('/(screens)/create-request');
    } else {
      // User doesn't know → Take them to browse screen
      router.replace('/(tabs)');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.emoji}>🥢</Text>
          <Text style={styles.heading}>One last thing...</Text>
          <Text style={styles.subtext}>
            Do you know where you want to eat?
          </Text>
        </View>

        {/* Options */}
        <View style={styles.options}>
          {/* Yes - I know where */}
          <TouchableOpacity
            style={styles.optionCard}
            onPress={() => handleChoice(true)}
            activeOpacity={0.7}
          >
            <View style={styles.optionIcon}>
              <Text style={styles.optionEmoji}>🎯</Text>
            </View>
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>Yes, I know!</Text>
              <Text style={styles.optionDescription}>
                I have a specific restaurant in mind
              </Text>
            </View>
            <Text style={styles.arrow}>→</Text>
          </TouchableOpacity>

          {/* No - Looking for ideas */}
          <TouchableOpacity
            style={styles.optionCard}
            onPress={() => handleChoice(false)}
            activeOpacity={0.7}
          >
            <View style={styles.optionIcon}>
              <Text style={styles.optionEmoji}>🔍</Text>
            </View>
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>Not yet</Text>
              <Text style={styles.optionDescription}>
                I'm looking for ideas and meal buddies
              </Text>
            </View>
            <Text style={styles.arrow}>→</Text>
          </TouchableOpacity>
        </View>

        {/* Progress indicator */}
        <View style={styles.progressRow}>
          <View style={[styles.progressDot, styles.progressActive]} />
          <View style={[styles.progressDot, styles.progressActive]} />
          <View style={[styles.progressDot, styles.progressActive]} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 48,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 24,
  },
  heading: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtext: {
    color: '#9ca3af',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  options: {
    gap: 16,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#171717',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: '#262626',
  },
  optionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#262626',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  optionEmoji: {
    fontSize: 28,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  optionDescription: {
    color: '#9ca3af',
    fontSize: 14,
    lineHeight: 20,
  },
  arrow: {
    color: '#f97316',
    fontSize: 24,
    fontWeight: '600',
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  progressDot: {
    width: 32,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#262626',
  },
  progressActive: {
    backgroundColor: '#f97316',
  },
});
