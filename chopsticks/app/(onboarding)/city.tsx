import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/lib/stores/auth';
import { CITIES } from '@/lib/constants';

const CITY_DISPLAY = [
  { id: 'hcmc', emoji: '🌆', desc: 'District 1, bánh mì, night markets' },
];

export default function CityScreen() {
  const router = useRouter();
  const { updateProfile } = useAuthStore();

  const selectCity = async (cityId: string) => {
    await updateProfile({ city: cityId as 'hcmc' });
    router.push('/(onboarding)/persona');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0a0a0a' }}>
      <View style={{ flex: 1, paddingHorizontal: 24, justifyContent: 'center' }}>
        <Text style={{ color: '#fff', fontSize: 28, fontWeight: '800', textAlign: 'center' }}>
          Where are you?
        </Text>
        <Text style={{ color: '#6b7280', fontSize: 15, textAlign: 'center', marginTop: 8, marginBottom: 40 }}>
          Select your city to find nearby food spots
        </Text>

        <View style={{ gap: 16 }}>
          {CITY_DISPLAY.map(display => {
            const city = CITIES.find(c => c.id === display.id)!;
            return (
              <TouchableOpacity
                key={display.id}
                onPress={() => selectCity(display.id)}
                activeOpacity={0.8}
                style={{
                  backgroundColor: '#171717',
                  borderRadius: 16,
                  padding: 24,
                  borderWidth: 1.5,
                  borderColor: '#262626',
                  alignItems: 'center',
                }}
              >
                <Text style={{ fontSize: 44 }}>{display.emoji}</Text>
                <Text style={{ color: '#fff', fontSize: 20, fontWeight: '700', marginTop: 12 }}>{city.name}</Text>
                <Text style={{ color: '#6b7280', fontSize: 13, marginTop: 4 }}>{display.desc}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </SafeAreaView>
  );
}
