import { View, Text, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/stores/auth';

function StatCard({ value, label, emoji }: { value: number; label: string; emoji: string }) {
  return (
    <View className="flex-1 bg-surface rounded-xl p-4 items-center">
      <Text className="text-2xl mb-1">{emoji}</Text>
      <Text className="text-white text-2xl font-bold">{value}</Text>
      <Text className="text-gray-400 text-xs">{label}</Text>
    </View>
  );
}

function PreferenceChip({ label, selected = true }: { label: string; selected?: boolean }) {
  return (
    <View className={`px-3 py-1.5 rounded-full mr-2 mb-2 ${selected ? 'bg-primary-500/20' : 'bg-surface'}`}>
      <Text className={selected ? 'text-primary-400' : 'text-gray-400'}>{label}</Text>
    </View>
  );
}

function SettingsItem({ icon, label, onPress, danger = false }: {
  icon: string;
  label: string;
  onPress: () => void;
  danger?: boolean;
}) {
  return (
    <TouchableOpacity
      className="flex-row items-center py-4 border-b border-surface-elevated"
      onPress={onPress}
    >
      <Text className="text-xl mr-3">{icon}</Text>
      <Text className={`flex-1 ${danger ? 'text-red-500' : 'text-white'}`}>{label}</Text>
      <Text className="text-gray-500">›</Text>
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const { user, preferences, signOut } = useAuthStore();

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: () => signOut(),
        },
      ]
    );
  };

  // Placeholder data for demo
  const displayUser = user || {
    name: 'Food Lover',
    age: 25,
    bio: 'Exploring street food one bowl at a time',
    profileImageUrl: null,
    mealCount: 12,
    verificationStatus: 'unverified',
  };

  const displayPreferences = preferences || {
    cuisineTypes: ['Vietnamese', 'Korean', 'Street Food'],
    dietaryRestrictions: [],
    allergies: ['Peanuts'],
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['left', 'right']}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View className="items-center pt-4 pb-6 px-4">
          {/* Avatar */}
          <TouchableOpacity className="mb-4">
            <View className="w-28 h-28 rounded-full bg-surface items-center justify-center overflow-hidden">
              {displayUser.profileImageUrl ? (
                <Image
                  source={{ uri: displayUser.profileImageUrl }}
                  className="w-full h-full"
                />
              ) : (
                <Text className="text-5xl">{displayUser.name?.[0] || '?'}</Text>
              )}
            </View>
            <View className="absolute bottom-0 right-0 bg-primary-500 w-8 h-8 rounded-full items-center justify-center">
              <Text className="text-white">📷</Text>
            </View>
          </TouchableOpacity>

          {/* Name & Age */}
          <View className="flex-row items-center mb-1">
            <Text className="text-white text-2xl font-bold mr-2">
              {displayUser.name}, {displayUser.age}
            </Text>
            {displayUser.verificationStatus === 'verified' && (
              <Text className="text-blue-400">✓</Text>
            )}
          </View>

          {/* Bio */}
          {displayUser.bio && (
            <Text className="text-gray-400 text-center mb-4 px-8">
              {displayUser.bio}
            </Text>
          )}

          {/* Edit Profile Button */}
          <TouchableOpacity className="bg-surface px-6 py-2 rounded-full">
            <Text className="text-white">Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View className="flex-row gap-3 px-4 mb-6">
          <StatCard value={displayUser.mealCount || 0} label="Meals" emoji="🍜" />
          <StatCard value={5} label="Connections" emoji="🤝" />
          <StatCard value={8} label="Reviews" emoji="⭐" />
        </View>

        {/* Food Preferences */}
        <View className="px-4 mb-6">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-white text-lg font-semibold">Food Preferences</Text>
            <TouchableOpacity>
              <Text className="text-primary-500">Edit</Text>
            </TouchableOpacity>
          </View>

          <View className="bg-surface rounded-xl p-4">
            <Text className="text-gray-400 text-xs mb-2">CUISINES</Text>
            <View className="flex-row flex-wrap mb-3">
              {displayPreferences.cuisineTypes.map(cuisine => (
                <PreferenceChip key={cuisine} label={cuisine} />
              ))}
            </View>

            {displayPreferences.allergies.length > 0 && (
              <>
                <Text className="text-gray-400 text-xs mb-2">ALLERGIES</Text>
                <View className="flex-row flex-wrap">
                  {displayPreferences.allergies.map(allergy => (
                    <PreferenceChip key={allergy} label={`⚠️ ${allergy}`} selected={false} />
                  ))}
                </View>
              </>
            )}
          </View>
        </View>

        {/* Settings */}
        <View className="px-4 mb-8">
          <Text className="text-white text-lg font-semibold mb-3">Settings</Text>
          <View className="bg-surface rounded-xl px-4">
            <SettingsItem
              icon="📍"
              label="Location Settings"
              onPress={() => console.log('Location')}
            />
            <SettingsItem
              icon="🔔"
              label="Notifications"
              onPress={() => console.log('Notifications')}
            />
            <SettingsItem
              icon="🔒"
              label="Privacy & Safety"
              onPress={() => console.log('Privacy')}
            />
            <SettingsItem
              icon="❓"
              label="Help & Support"
              onPress={() => console.log('Help')}
            />
            <SettingsItem
              icon="📄"
              label="Terms & Privacy Policy"
              onPress={() => console.log('Terms')}
            />
            <SettingsItem
              icon="🚪"
              label="Sign Out"
              onPress={handleSignOut}
              danger
            />
          </View>
        </View>

        {/* App Version */}
        <View className="items-center pb-8">
          <Text className="text-gray-500 text-xs">Chopsticks v1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
