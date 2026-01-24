import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { useAuthStore } from '@/stores/auth';

export default function ProfileSetupScreen() {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [bio, setBio] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { updateProfile } = useAuthStore();

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const handleContinue = async () => {
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }

    if (!age || parseInt(age) < 18) {
      setError('You must be at least 18 years old');
      return;
    }

    setIsLoading(true);
    setError('');

    // TODO: Upload image to Supabase Storage and get URL
    const { error: updateError } = await updateProfile({
      name: name.trim(),
      age: parseInt(age),
      bio: bio.trim() || null,
      profileImageUrl: profileImage, // Will be replaced with storage URL
    });

    setIsLoading(false);

    if (updateError) {
      setError(updateError.message);
    } else {
      router.push('/(onboarding)/preferences');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        <View className="py-8">
          {/* Header */}
          <Text className="text-3xl font-bold text-white mb-2">Create Profile</Text>
          <Text className="text-gray-400 mb-8">Let others know who you are</Text>

          {/* Profile Image */}
          <TouchableOpacity
            className="w-32 h-32 rounded-full bg-surface self-center mb-8 overflow-hidden items-center justify-center"
            onPress={pickImage}
          >
            {profileImage ? (
              <Image source={{ uri: profileImage }} className="w-full h-full" />
            ) : (
              <View className="items-center">
                <Text className="text-4xl mb-1">📷</Text>
                <Text className="text-gray-400 text-xs">Add Photo</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Name Input */}
          <View className="mb-4">
            <Text className="text-gray-300 mb-2 text-sm">Name *</Text>
            <TextInput
              className="bg-surface rounded-xl px-4 py-4 text-white text-lg"
              placeholder="Your name"
              placeholderTextColor="#6b7280"
              value={name}
              onChangeText={setName}
            />
          </View>

          {/* Age Input */}
          <View className="mb-4">
            <Text className="text-gray-300 mb-2 text-sm">Age *</Text>
            <TextInput
              className="bg-surface rounded-xl px-4 py-4 text-white text-lg"
              placeholder="Your age"
              placeholderTextColor="#6b7280"
              keyboardType="number-pad"
              value={age}
              onChangeText={setAge}
              maxLength={2}
            />
          </View>

          {/* Bio Input */}
          <View className="mb-6">
            <Text className="text-gray-300 mb-2 text-sm">Bio (optional)</Text>
            <TextInput
              className="bg-surface rounded-xl px-4 py-4 text-white text-base"
              placeholder="Tell others about yourself and your food interests..."
              placeholderTextColor="#6b7280"
              multiline
              numberOfLines={3}
              value={bio}
              onChangeText={setBio}
              maxLength={200}
              style={{ minHeight: 100, textAlignVertical: 'top' }}
            />
            <Text className="text-gray-500 text-right mt-1 text-xs">{bio.length}/200</Text>
          </View>

          {error ? (
            <Text className="text-red-500 text-center mb-4">{error}</Text>
          ) : null}

          {/* Continue Button */}
          <TouchableOpacity
            className={`py-4 rounded-xl ${isLoading ? 'bg-primary-700' : 'bg-primary-500'}`}
            onPress={handleContinue}
            disabled={isLoading}
          >
            <Text className="text-white text-center font-semibold text-lg">
              {isLoading ? 'Saving...' : 'Continue'}
            </Text>
          </TouchableOpacity>

          {/* Progress indicator */}
          <View className="flex-row justify-center mt-8 gap-2">
            <View className="w-8 h-2 rounded-full bg-primary-500" />
            <View className="w-8 h-2 rounded-full bg-surface" />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
