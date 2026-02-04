import { useState } from 'react';
import { View, Text, TouchableOpacity, Switch } from 'react-native';
import { SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';

export default function PrivacyScreen() {
  const router = useRouter();
  const [showDistance, setShowDistance] = useState(true);

  const handleContinue = () => {
    router.push('/(onboarding)/city');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0a0a0a' }}>
      <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 40 }}>
        <Text style={{ color: '#fff', fontSize: 28, fontWeight: '800', textAlign: 'center' }}>
          Privacy Settings
        </Text>
        <Text style={{ color: '#6b7280', fontSize: 15, textAlign: 'center', marginTop: 8, marginBottom: 40 }}>
          You can change these anytime in settings
        </Text>

        {/* Show Distance Toggle */}
        <View style={{
          backgroundColor: '#171717',
          borderRadius: 16,
          padding: 20,
          marginBottom: 16,
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flex: 1, marginRight: 16 }}>
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>Show Distance Away</Text>
              <Text style={{ color: '#6b7280', fontSize: 13, marginTop: 4 }}>
                Let others see how far away you are in km. Your exact location is never shared.
              </Text>
            </View>
            <Switch
              value={showDistance}
              onValueChange={setShowDistance}
              trackColor={{ false: '#262626', true: '#f9731680' }}
              thumbColor={showDistance ? '#f97316' : '#6b7280'}
            />
          </View>
        </View>

        <View style={{ flex: 1 }} />

        <TouchableOpacity
          onPress={handleContinue}
          style={{
            backgroundColor: '#f97316',
            borderRadius: 14,
            paddingVertical: 16,
            alignItems: 'center',
            marginBottom: 20,
          }}
        >
          <Text style={{ color: '#fff', fontSize: 17, fontWeight: '700' }}>Continue</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
