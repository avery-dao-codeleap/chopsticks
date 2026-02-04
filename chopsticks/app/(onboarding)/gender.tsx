import { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/stores/auth';

const GENDERS = [
  { id: 'female', label: 'Female', emoji: '👩' },
  { id: 'male', label: 'Male', emoji: '👨' },
  { id: 'non-binary', label: 'Non-binary', emoji: '🧑' },
];

export default function GenderScreen() {
  const router = useRouter();
  const { updateProfile } = useAuthStore();
  const [selected, setSelected] = useState<string | null>(null);

  const handleContinue = async () => {
    if (!selected) return;
    await updateProfile({ gender: selected as 'male' | 'female' | 'non-binary' });
    router.push('/(onboarding)/privacy');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0a0a0a' }}>
      <View style={{ flex: 1, paddingHorizontal: 24, justifyContent: 'center' }}>
        <Text style={{ color: '#fff', fontSize: 28, fontWeight: '800', textAlign: 'center' }}>
          What's your gender?
        </Text>
        <Text style={{ color: '#6b7280', fontSize: 15, textAlign: 'center', marginTop: 8, marginBottom: 40 }}>
          This helps us personalize your experience
        </Text>

        <View style={{ gap: 12 }}>
          {GENDERS.map(g => (
            <TouchableOpacity
              key={g.id}
              onPress={() => setSelected(g.id)}
              activeOpacity={0.8}
              style={{
                backgroundColor: '#171717',
                borderRadius: 16,
                padding: 20,
                borderWidth: 2,
                borderColor: selected === g.id ? '#f97316' : '#262626',
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <Text style={{ fontSize: 32, marginRight: 16 }}>{g.emoji}</Text>
              <Text style={{ color: '#fff', fontSize: 18, fontWeight: '600' }}>{g.label}</Text>
              {selected === g.id && (
                <View style={{ marginLeft: 'auto' }}>
                  <Text style={{ color: '#f97316', fontSize: 20 }}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ flex: 1 }} />

        <TouchableOpacity
          onPress={handleContinue}
          disabled={!selected}
          style={{
            backgroundColor: selected ? '#f97316' : '#262626',
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
