import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuthStore } from '@/stores/auth';

export default function ProfileSetupScreen() {
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);
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
    await updateProfile({
      name: name.trim() || 'Test User',
      bio: bio.trim() || null,
      photo_url: profileImage,
    });
    router.push('/(onboarding)/preferences');
  };

  return (
    <SafeAreaView style={s.container}>
      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
        <View style={s.content}>
          <Text style={s.heading}>Create Profile</Text>
          <Text style={s.subtext}>Let others know who you are</Text>

          {/* Profile Image */}
          <TouchableOpacity style={s.avatarButton} onPress={pickImage}>
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={s.avatarImage} />
            ) : (
              <View style={s.avatarPlaceholder}>
                <Text style={{ fontSize: 36 }}>📷</Text>
                <Text style={{ color: '#6b7280', fontSize: 11 }}>Add Photo</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Name */}
          <Text style={s.label}>Name *</Text>
          <TextInput style={s.input} placeholder="Your name" placeholderTextColor="#6b7280" value={name} onChangeText={setName} />

          {/* Bio */}
          <Text style={s.label}>Bio (optional)</Text>
          <TextInput
            style={[s.input, { minHeight: 100, textAlignVertical: 'top' }]}
            placeholder="Tell others about yourself..."
            placeholderTextColor="#6b7280"
            multiline numberOfLines={3}
            value={bio} onChangeText={setBio} maxLength={200}
          />
          <Text style={{ color: '#6b7280', textAlign: 'right', fontSize: 11, marginBottom: 16 }}>{bio.length}/200</Text>

          {/* Continue */}
          <TouchableOpacity style={s.button} onPress={handleContinue}>
            <Text style={s.buttonText}>Continue</Text>
          </TouchableOpacity>

          {/* Progress */}
          <View style={s.progressRow}>
            <View style={[s.progressDot, s.progressActive]} />
            <View style={s.progressDot} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  scroll: { flex: 1, paddingHorizontal: 24 },
  content: { paddingVertical: 32 },
  heading: { color: '#fff', fontSize: 28, fontWeight: '800', marginBottom: 8 },
  subtext: { color: '#9ca3af', fontSize: 15, marginBottom: 32 },
  avatarButton: {
    width: 120, height: 120, borderRadius: 60, backgroundColor: '#171717',
    alignSelf: 'center', marginBottom: 32, overflow: 'hidden',
    alignItems: 'center', justifyContent: 'center',
  },
  avatarImage: { width: '100%', height: '100%' },
  avatarPlaceholder: { alignItems: 'center' },
  label: { color: '#d1d5db', fontSize: 13, marginBottom: 6 },
  input: {
    backgroundColor: '#171717', borderRadius: 12, paddingHorizontal: 16,
    paddingVertical: 14, color: '#fff', fontSize: 16, marginBottom: 16,
  },
  button: { backgroundColor: '#f97316', paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 18 },
  progressRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 28, gap: 8 },
  progressDot: { width: 32, height: 6, borderRadius: 3, backgroundColor: '#262626' },
  progressActive: { backgroundColor: '#f97316' },
});
