import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, Platform, Modal } from 'react-native';
import { SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuthStore } from '@/lib/stores/auth';
import { supabase } from '@/lib/services/supabase';

export default function BirthdateScreen() {
  const router = useRouter();
  const { updateProfile } = useAuthStore();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() - 18);

  const [date, setDate] = useState<Date>(maxDate);
  const [hasSelected, setHasSelected] = useState(false);
  const [confirmAge, setConfirmAge] = useState<number | null>(null);

  // Get user email from auth session on mount
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.email) {
        setUserEmail(data.user.email);
      }
    });
  }, []);

  const handleDateChange = (_: unknown, selectedDate?: Date) => {
    if (selectedDate) {
      setDate(selectedDate);
      setHasSelected(true);
    }
  };

  const handleContinue = () => {
    if (!hasSelected) {
      Alert.alert('Please select your birth date');
      return;
    }

    const today = new Date();
    let age = today.getFullYear() - date.getFullYear();
    const monthDiff = today.getMonth() - date.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) {
      age--;
    }

    if (age < 18) {
      Alert.alert('Age Requirement', 'You must be 18 or older to use Chopsticks.');
      return;
    }

    setConfirmAge(age);
  };

  const handleConfirm = async () => {
    // Create/update user record with age and email (first profile update)
    const profileData: any = { age: confirmAge! };
    if (userEmail) {
      profileData.email = userEmail;
    }

    const { error } = await updateProfile(profileData);
    if (error) {
      console.error('[Birthdate] Failed to save profile:', error);
      Alert.alert('Error', `Failed to save your age: ${error.message}. Please try again.`);
      return;
    }

    console.log('[Birthdate] Profile saved successfully:', profileData);
    setConfirmAge(null);
    router.push('/(onboarding)/gender');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0a0a0a' }}>
      <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 40 }}>
        <Text style={{ color: '#fff', fontSize: 28, fontWeight: '800', textAlign: 'center', marginBottom: 40 }}>
          When's your birthday?
        </Text>

        <View style={{
          backgroundColor: '#171717',
          borderRadius: 16,
          padding: 20,
          borderWidth: 1,
          borderColor: '#262626',
          alignItems: 'center',
        }}>
          <DateTimePicker
            value={date}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleDateChange}
            maximumDate={maxDate}
            minimumDate={new Date(1920, 0, 1)}
            themeVariant="dark"
            style={{ width: '100%', height: 180 }}
          />
        </View>

        <View style={{ flex: 1 }} />

        <TouchableOpacity
          onPress={handleContinue}
          style={{
            backgroundColor: hasSelected ? '#f97316' : '#262626',
            borderRadius: 14,
            paddingVertical: 16,
            alignItems: 'center',
            marginBottom: 20,
          }}
        >
          <Text style={{ color: '#fff', fontSize: 17, fontWeight: '700' }}>Continue</Text>
        </TouchableOpacity>
      </View>

      {/* Age confirmation modal */}
      <Modal visible={confirmAge !== null} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 }}>
          <View style={{ backgroundColor: '#171717', borderRadius: 20, padding: 32, width: '100%', alignItems: 'center', borderWidth: 1, borderColor: '#262626' }}>
            <Text style={{ color: '#fff', fontSize: 24, fontWeight: '800', textAlign: 'center', marginBottom: 8 }}>
              Confirm your age
            </Text>
            <Text style={{ color: '#9ca3af', fontSize: 15, textAlign: 'center', marginBottom: 24 }}>
              You are {confirmAge} years old. Is that correct?
            </Text>
            <TouchableOpacity
              style={{ backgroundColor: '#f97316', width: '100%', paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginBottom: 10 }}
              onPress={handleConfirm}
            >
              <Text style={{ color: '#fff', fontSize: 17, fontWeight: '700' }}>Yes, I'm {confirmAge}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{ width: '100%', paddingVertical: 14, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#374151' }}
              onPress={() => { setConfirmAge(null); router.replace('/(auth)/login'); }}
            >
              <Text style={{ color: '#9ca3af', fontSize: 17 }}>No</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
