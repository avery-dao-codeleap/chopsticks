import { View, Text, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useI18n } from '@/lib/i18n';

export default function WelcomeScreen() {
  const router = useRouter();
  const { t } = useI18n();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0a0a0a' }}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 }}>
        {/* App Icon/Logo */}
        <View style={{
          width: 120,
          height: 120,
          borderRadius: 60,
          backgroundColor: '#f97316',
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: 32,
        }}>
          <Text style={{ fontSize: 60 }}>🥢</Text>
        </View>

        {/* App Name */}
        <Text style={{
          fontSize: 36,
          fontWeight: '800',
          color: '#fff',
          marginBottom: 16,
          textAlign: 'center',
        }}>
          Chopsticks
        </Text>

        {/* Tagline */}
        <Text style={{
          fontSize: 18,
          fontWeight: '600',
          color: '#f97316',
          marginBottom: 32,
          textAlign: 'center',
        }}>
          {t('welcomeTagline') || 'Meet new friends over meals'}
        </Text>

        {/* Product Vision */}
        <View style={{ marginBottom: 48 }}>
          <Text style={{
            fontSize: 16,
            color: '#9ca3af',
            textAlign: 'center',
            lineHeight: 24,
            marginBottom: 20,
          }}>
            {t('welcomeVision') || 'Tired of eating alone? Connect with locals and travelers who love food as much as you do.'}
          </Text>

          {/* Feature Highlights */}
          <View style={{ gap: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ fontSize: 24, marginRight: 12 }}>🍜</Text>
              <Text style={{ fontSize: 14, color: '#d1d5db', flex: 1 }}>
                {t('welcomeFeature1') || 'Discover great restaurants in HCMC'}
              </Text>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ fontSize: 24, marginRight: 12 }}>👥</Text>
              <Text style={{ fontSize: 14, color: '#d1d5db', flex: 1 }}>
                {t('welcomeFeature2') || 'Join meals with like-minded people'}
              </Text>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ fontSize: 24, marginRight: 12 }}>💬</Text>
              <Text style={{ fontSize: 14, color: '#d1d5db', flex: 1 }}>
                {t('welcomeFeature3') || 'Chat and coordinate in real-time'}
              </Text>
            </View>
          </View>
        </View>

        {/* Start Button */}
        <TouchableOpacity
          onPress={() => router.push('/(auth)/login')}
          style={{
            backgroundColor: '#f97316',
            paddingVertical: 16,
            paddingHorizontal: 48,
            borderRadius: 12,
            width: '100%',
            alignItems: 'center',
            shadowColor: '#f97316',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
          }}
        >
          <Text style={{
            color: '#fff',
            fontSize: 18,
            fontWeight: '700',
          }}>
            {t('getStarted') || 'Get Started'}
          </Text>
        </TouchableOpacity>

        {/* Footer */}
        <Text style={{
          fontSize: 12,
          color: '#6b7280',
          marginTop: 32,
          textAlign: 'center',
        }}>
          {t('welcomeFooter') || 'Join 100+ food lovers in Ho Chi Minh City'}
        </Text>
      </View>
    </SafeAreaView>
  );
}
