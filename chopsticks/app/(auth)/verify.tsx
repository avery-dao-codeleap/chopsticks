import { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuthStore } from '@/stores/auth';

export default function VerifyScreen() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const router = useRouter();
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const { verifyOtp } = useAuthStore();

  const handleOtpChange = (value: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    setIsLoading(true);
    const code = otp.join('') || '123456';
    await verifyOtp(code);
    setIsLoading(false);
    // Navigation handled by root layout (session set → onboarding)
  };

  // Auto-submit when OTP is complete
  useEffect(() => {
    if (otp.every(digit => digit !== '')) {
      handleVerify();
    }
  }, [otp]);

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <View style={styles.content}>
          {/* Back button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Verify Phone</Text>
            <Text style={styles.subtitle}>We sent a code to {phone}</Text>
          </View>

          {/* OTP Input */}
          <View style={styles.otpRow}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => { inputRefs.current[index] = ref; }}
                style={styles.otpInput}
                keyboardType="number-pad"
                maxLength={1}
                value={digit}
                onChangeText={(value) => handleOtpChange(value, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
              />
            ))}
          </View>

          {/* Verify Button */}
          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleVerify}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? 'Verifying...' : 'Verify'}
            </Text>
          </TouchableOpacity>

          {/* Skip OTP for dev */}
          <TouchableOpacity style={styles.skipButton} onPress={handleVerify}>
            <Text style={styles.skipText}>Skip verification (Dev)</Text>
          </TouchableOpacity>

          {/* Resend */}
          <TouchableOpacity style={styles.resendButton}>
            <Text style={styles.resendText}>
              Didn't receive the code? <Text style={styles.resendLink}>Resend</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  flex: { flex: 1 },
  content: { flex: 1, paddingHorizontal: 24, justifyContent: 'center' },
  backButton: { position: 'absolute', top: 60, left: 24 },
  backText: { color: '#f97316', fontSize: 16 },
  header: { alignItems: 'center', marginBottom: 40 },
  title: { color: '#fff', fontSize: 28, fontWeight: '800' },
  subtitle: { color: '#9ca3af', marginTop: 8, textAlign: 'center' },
  otpRow: { flexDirection: 'row', justifyContent: 'center', gap: 10, marginBottom: 24 },
  otpInput: {
    width: 48, height: 56, backgroundColor: '#171717', borderRadius: 12,
    color: '#fff', textAlign: 'center', fontSize: 24, fontWeight: '700',
  },
  button: { backgroundColor: '#f97316', paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  buttonDisabled: { backgroundColor: '#c2410c' },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 18 },
  skipButton: { marginTop: 16, paddingVertical: 12, alignItems: 'center', borderWidth: 1, borderColor: '#374151', borderRadius: 12 },
  skipText: { color: '#9ca3af', fontSize: 14 },
  resendButton: { marginTop: 20 },
  resendText: { color: '#9ca3af', textAlign: 'center' },
  resendLink: { color: '#f97316' },
});
