import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/stores/auth';

export default function LoginScreen() {
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { signInWithPhone, enableDevBypass } = useAuthStore();

  const handleSendOtp = async () => {
    if (!phone || phone.length < 10) {
      setError('Please enter a valid phone number');
      return;
    }

    setIsLoading(true);
    setError('');

    // Format phone number with country code if not present
    const formattedPhone = phone.startsWith('+') ? phone : `+84${phone.replace(/^0/, '')}`;

    const { error: authError } = await signInWithPhone(formattedPhone);

    setIsLoading(false);

    if (authError) {
      setError(authError.message);
    } else {
      router.push({ pathname: '/(auth)/verify', params: { phone: formattedPhone } });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          {/* Logo / Brand */}
          <View style={styles.brandContainer}>
            <Text style={styles.logo}>🥢</Text>
            <Text style={styles.title}>Chopsticks</Text>
            <Text style={styles.subtitle}>Find your next meal buddy</Text>
          </View>

          {/* Phone Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Phone Number</Text>
            <View style={styles.inputRow}>
              <View style={styles.countryCode}>
                <Text style={styles.countryCodeText}>+84</Text>
              </View>
              <TextInput
                style={styles.input}
                placeholder="Enter your phone"
                placeholderTextColor="#6b7280"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
                maxLength={12}
                autoFocus={true}
                autoCorrect={false}
                autoCapitalize="none"
              />
            </View>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </View>

          {/* Continue Button */}
          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleSendOtp}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? 'Sending...' : 'Continue'}
            </Text>
          </TouchableOpacity>

          {/* Terms */}
          <Text style={styles.terms}>
            By continuing, you agree to our Terms of Service and Privacy Policy
          </Text>

          {/* Dev Skip Button */}
          <TouchableOpacity
            style={styles.skipButton}
            onPress={() => enableDevBypass()}
          >
            <Text style={styles.skipButtonText}>Skip to App (Dev)</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logo: {
    fontSize: 48,
    marginBottom: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  subtitle: {
    color: '#9ca3af',
    marginTop: 8,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    color: '#d1d5db',
    marginBottom: 8,
    fontSize: 14,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#171717',
    borderRadius: 12,
    overflow: 'hidden',
  },
  countryCode: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#262626',
  },
  countryCodeText: {
    color: '#ffffff',
    fontSize: 16,
  },
  input: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
    color: '#ffffff',
    fontSize: 18,
  },
  errorText: {
    color: '#ef4444',
    marginTop: 8,
    fontSize: 14,
  },
  button: {
    backgroundColor: '#f97316',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#c2410c',
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 18,
  },
  terms: {
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 24,
    fontSize: 12,
    paddingHorizontal: 16,
  },
  skipButton: {
    marginTop: 32,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#374151',
    borderRadius: 12,
  },
  skipButtonText: {
    color: '#9ca3af',
    fontSize: 14,
  },
});
