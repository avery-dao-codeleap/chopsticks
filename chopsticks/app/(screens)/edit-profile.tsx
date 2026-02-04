import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { CURRENT_USER } from '@/lib/mockData';
import { CUISINE_CATEGORIES } from '@/lib/constants';
import { useI18n } from '@/lib/i18n';

export default function EditProfileScreen() {
  const router = useRouter();
  const { t, language } = useI18n();
  const [name, setName] = useState(CURRENT_USER.name);
  const [bio, setBio] = useState(CURRENT_USER.bio || '');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>(CURRENT_USER.cuisines || []);

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

  const toggleCuisine = (id: string) => {
    setSelectedCuisines(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert(t('missingInfo'), t('nameRequired'));
      return;
    }
    Alert.alert(t('saved'), t('profileUpdated'), [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#0a0a0a' }} contentContainerStyle={{ padding: 24 }}>
      {/* Avatar */}
      <TouchableOpacity
        onPress={pickImage}
        style={{
          width: 120, height: 120, borderRadius: 60,
          backgroundColor: '#171717', alignSelf: 'center',
          marginBottom: 8, overflow: 'hidden',
          alignItems: 'center', justifyContent: 'center',
        }}
      >
        {profileImage ? (
          <Image source={{ uri: profileImage }} style={{ width: '100%', height: '100%' }} />
        ) : (
          <>
            <Text style={{ fontSize: 42, color: '#fff' }}>{name[0] || '?'}</Text>
            <Text style={{ color: '#6b7280', fontSize: 11, marginTop: 4 }}>{t('tapToChange')}</Text>
          </>
        )}
      </TouchableOpacity>

      {/* Name */}
      <Text style={{ color: '#9ca3af', fontSize: 13, marginBottom: 6, marginTop: 24 }}>{t('name')}</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder={t('name')}
        placeholderTextColor="#4b5563"
        style={{
          backgroundColor: '#171717', borderRadius: 12, paddingHorizontal: 16,
          paddingVertical: 14, color: '#fff', fontSize: 16, marginBottom: 20,
        }}
      />

      {/* Bio */}
      <Text style={{ color: '#9ca3af', fontSize: 13, marginBottom: 6 }}>{t('bio')}</Text>
      <TextInput
        value={bio}
        onChangeText={setBio}
        placeholder={t('tellOthers')}
        placeholderTextColor="#4b5563"
        multiline
        numberOfLines={3}
        maxLength={200}
        style={{
          backgroundColor: '#171717', borderRadius: 12, paddingHorizontal: 16,
          paddingVertical: 14, color: '#fff', fontSize: 16,
          minHeight: 100, textAlignVertical: 'top',
        }}
      />
      <Text style={{ color: '#4b5563', textAlign: 'right', fontSize: 11, marginTop: 4, marginBottom: 24 }}>
        {bio.length}/200
      </Text>

      {/* Favorite Cuisines */}
      <Text style={{ color: '#9ca3af', fontSize: 13, marginBottom: 10 }}>{t('favoriteCuisines')}</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 32 }}>
        {CUISINE_CATEGORIES.map(c => {
          const selected = selectedCuisines.includes(c.id);
          return (
            <TouchableOpacity
              key={c.id}
              onPress={() => toggleCuisine(c.id)}
              style={{
                paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
                backgroundColor: selected ? '#f97316' : '#171717',
                borderWidth: 1, borderColor: selected ? '#f97316' : '#262626',
              }}
            >
              <Text style={{ color: selected ? '#fff' : '#9ca3af', fontSize: 13, fontWeight: '500' }}>
                {language === 'vi' ? c.labelVi : c.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Save */}
      <TouchableOpacity
        onPress={handleSave}
        style={{ backgroundColor: '#f97316', paddingVertical: 16, borderRadius: 14, alignItems: 'center' }}
      >
        <Text style={{ color: '#fff', fontSize: 17, fontWeight: '700' }}>{t('save')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
