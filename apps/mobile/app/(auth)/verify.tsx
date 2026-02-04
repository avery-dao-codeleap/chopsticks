import { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/stores/auth';

export default function VerifyScreen() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const router = useRouter();
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const { verifyOtp, signInWithPhone } = useAuthStore();

  const handleOtpChange = (value: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
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
    const code = otp.join('');
    if (code.length !== 6) {
      setError('Please enter the complete code');
      return;
    }

    setIsLoading(true);
    setError('');

    const { error: authError } = await verifyOtp(phone!, code);

    setIsLoading(false);

    if (authError) {
      setError(authError.message);
    }
    // Navigation is handled by the root layout based on auth state
  };

  const handleResend = async () => {
    setIsLoading(true);
    await signInWithPhone(phone!);
    setIsLoading(false);
    setOtp(['', '', '', '', '', '']);
    inputRefs.current[0]?.focus();
  };

  // Auto-submit when OTP is complete
  useEffect(() => {
    if (otp.every(digit => digit !== '')) {
      handleVerify();
    }
  }, [otp]);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <View className="flex-1 px-6 justify-center">
          {/* Back button */}
          <TouchableOpacity
            className="absolute top-4 left-6"
            onPress={() => router.back()}
          >
            <Text className="text-primary-500 text-lg">← Back</Text>
          </TouchableOpacity>

          {/* Header */}
          <View className="items-center mb-12">
            <Text className="text-3xl font-bold text-white mb-2">Verify Phone</Text>
            <Text className="text-gray-400 text-center">
              We sent a code to {phone}
            </Text>
          </View>

          {/* OTP Input */}
          <View className="flex-row justify-center gap-3 mb-6">
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => (inputRefs.current[index] = ref)}
                className="w-12 h-14 bg-surface rounded-xl text-white text-center text-2xl font-bold"
                keyboardType="number-pad"
                maxLength={1}
                value={digit}
                onChangeText={(value) => handleOtpChange(value, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
              />
            ))}
          </View>

          {error ? (
            <Text className="text-red-500 text-center mb-4">{error}</Text>
          ) : null}

          {/* Verify Button */}
          <TouchableOpacity
            className={`py-4 rounded-xl ${isLoading ? 'bg-primary-700' : 'bg-primary-500'}`}
            onPress={handleVerify}
            disabled={isLoading}
          >
            <Text className="text-white text-center font-semibold text-lg">
              {isLoading ? 'Verifying...' : 'Verify'}
            </Text>
          </TouchableOpacity>

          {/* Resend */}
          <TouchableOpacity className="mt-6" onPress={handleResend} disabled={isLoading}>
            <Text className="text-gray-400 text-center">
              Didn't receive the code? <Text className="text-primary-500">Resend</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
