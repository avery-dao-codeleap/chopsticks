import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/stores/auth';
import { PERSONA_TYPES } from '@/lib/constants';

const PERSONA_DISPLAY = [
  {
    id: 'local',
    emoji: '📍',
    color: '#4ade80',
  },
  {
    id: 'new_to_city',
    emoji: '🏙️',
    color: '#60a5fa',
  },
  {
    id: 'expat',
    emoji: '🌏',
    color: '#f59e0b',
  },
  {
    id: 'traveler',
    emoji: '✈️',
    color: '#a78bfa',
  },
  {
    id: 'student',
    emoji: '🎓',
    color: '#ec4899',
  },
];

export default function PersonaScreen() {
  const router = useRouter();
  const { updateProfile } = useAuthStore();

  const selectPersona = async (personaId: string) => {
    await updateProfile({ persona: personaId as 'local' | 'new_to_city' | 'expat' | 'traveler' | 'student' });
    router.push('/(onboarding)/profile');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0a0a0a' }}>
      <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 40 }}>
        <Text style={{ color: '#fff', fontSize: 28, fontWeight: '800', textAlign: 'center' }}>
          Who are you?
        </Text>
        <Text style={{ color: '#6b7280', fontSize: 15, textAlign: 'center', marginTop: 8, marginBottom: 30 }}>
          This helps others know what to expect
        </Text>

        <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
          <View style={{ gap: 12, paddingBottom: 20 }}>
            {PERSONA_DISPLAY.map(display => {
              const persona = PERSONA_TYPES.find(p => p.id === display.id)!;
              return (
                <TouchableOpacity
                  key={display.id}
                  onPress={() => selectPersona(display.id)}
                  activeOpacity={0.8}
                  style={{
                    backgroundColor: '#171717',
                    borderRadius: 14,
                    padding: 18,
                    borderWidth: 1.5,
                    borderColor: '#262626',
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={{ fontSize: 32 }}>{display.emoji}</Text>
                    <View style={{ marginLeft: 14, flex: 1 }}>
                      <Text style={{ color: '#fff', fontSize: 17, fontWeight: '700' }}>{persona.label}</Text>
                      <Text style={{ color: '#6b7280', fontSize: 13, marginTop: 3 }}>{persona.description}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
