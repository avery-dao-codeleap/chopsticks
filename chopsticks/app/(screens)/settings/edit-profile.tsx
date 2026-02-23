import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { useUser, useUpdateUser } from '@/lib/hooks/queries/useUser';
import { processProfilePhoto, uploadImageToSupabase } from '@/lib/imageUtils';
import { supabase } from '@/lib/services/supabase';
import { useI18n } from '@/lib/i18n';

export default function EditProfileScreen() {
  const router = useRouter();
  const { t } = useI18n();

  const [currentUserId, setCurrentUserId] = useState<string>('');
  const { data: user, isLoading } = useUser(currentUserId);
  const updateUserMutation = useUpdateUser();

  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Get current user ID
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setCurrentUserId(data.user.id);
    });
  }, []);

  // Pre-populate form with current data
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setBio(user.bio || '');
      setProfileImage(user.photo_url);
    }
  }, [user]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setIsProcessing(true);
      try {
        // Process image with face detection
        const processedUri = await processProfilePhoto(result.assets[0].uri);
        setProfileImage(processedUri);
      } catch (error) {
        Alert.alert(
          'Photo Error',
          (error as Error).message || 'Please upload a clear photo of your face.',
          [{ text: 'OK' }]
        );
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Name Required', 'Please enter your name', [{ text: 'OK' }]);
      return;
    }

    setIsProcessing(true);
    try {
      // Upload photo to Supabase Storage if changed
      let photoUrl = profileImage;

      if (profileImage && profileImage.startsWith('file://') && currentUserId) {
        photoUrl = await uploadImageToSupabase(
          profileImage,
          'profile-photos',
          `${currentUserId}/avatar`,
          supabase
        );
      }

      await updateUserMutation.mutateAsync({
        userId: currentUserId,
        updates: {
          name: name.trim(),
          bio: bio.trim() || '',
          photo_url: photoUrl || undefined,
        },
      });

      Alert.alert('Success', 'Profile updated successfully', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to save profile. Please try again.', [{ text: 'OK' }]);
      console.error('Profile save error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={s.container} edges={['left', 'right']}>
        <Stack.Screen
          options={{
            headerTitle: t('editProfile') || 'Edit Profile',
            headerBackTitle: 'Back',
          }}
        />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color="#f97316" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.container} edges={['left', 'right']}>
      <Stack.Screen
        options={{
          headerTitle: t('editProfile') || 'Edit Profile',
          headerBackTitle: 'Back',
        }}
      />
      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
        <View style={s.content}>
          {/* Profile Image */}
          <TouchableOpacity style={s.avatarButton} onPress={pickImage} disabled={isProcessing}>
            {isProcessing ? (
              <View style={s.avatarPlaceholder}>
                <ActivityIndicator size="large" color="#f97316" />
                <Text style={{ color: '#6b7280', fontSize: 11, marginTop: 8 }}>Processing...</Text>
              </View>
            ) : profileImage ? (
              <Image source={{ uri: profileImage }} style={s.avatarImage} />
            ) : (
              <View style={s.avatarPlaceholder}>
                <Text style={{ fontSize: 36 }}>📷</Text>
                <Text style={{ color: '#6b7280', fontSize: 11 }}>Add Photo</Text>
              </View>
            )}
          </TouchableOpacity>

          <Text style={s.hint}>Tap to change photo</Text>

          {/* Name */}
          <Text style={s.label}>Name</Text>
          <TextInput
            style={s.input}
            placeholder="Your name"
            placeholderTextColor="#6b7280"
            value={name}
            onChangeText={setName}
          />

          {/* Bio */}
          <Text style={s.label}>Bio</Text>
          <TextInput
            style={[s.input, { minHeight: 100, textAlignVertical: 'top' }]}
            placeholder="Tell others about yourself..."
            placeholderTextColor="#6b7280"
            multiline
            numberOfLines={3}
            value={bio}
            onChangeText={setBio}
            maxLength={200}
          />
          <Text style={{ color: '#6b7280', textAlign: 'right', fontSize: 11, marginBottom: 24 }}>
            {bio.length}/200
          </Text>

          {/* Save Button */}
          <TouchableOpacity
            style={[s.button, isProcessing && { opacity: 0.6 }]}
            onPress={handleSave}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text style={s.buttonText}>Save Changes</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  scroll: { flex: 1, paddingHorizontal: 24 },
  content: { paddingVertical: 24 },
  avatarButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#171717',
    alignSelf: 'center',
    marginBottom: 12,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: { width: '100%', height: '100%' },
  avatarPlaceholder: { alignItems: 'center' },
  hint: { color: '#6b7280', fontSize: 13, textAlign: 'center', marginBottom: 32 },
  label: { color: '#d1d5db', fontSize: 13, marginBottom: 6, fontWeight: '500' },
  input: {
    backgroundColor: '#171717',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#fff',
    fontSize: 16,
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#f97316',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 18 },
});
