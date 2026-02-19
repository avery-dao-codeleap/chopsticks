import { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/lib/stores/auth';
import { useLanguageStore } from '@/lib/stores/language';
import { useI18n } from '@/lib/i18n';
import { useUser, useUpdateUser } from '@/lib/hooks/queries/useUser';
import { supabase } from '@/lib/services/supabase';
import { notificationService } from '@/lib/services/notifications';
import { CUISINE_CATEGORIES } from '@/lib/constants';

const CUISINE_EMOJIS: Record<string, string> = {
  noodles_congee: '🍜', rice: '🍚', hotpot_grill: '🍲', seafood: '🦐',
  bread: '🥖', vietnamese_cakes: '🍰', snack: '🍿', dessert: '🍨',
  drinks: '🧋', fast_food: '🍔', international: '🌍', healthy: '🥗',
  veggie: '🥦', others: '🍽️',
};

function StatCard({ value, label, emoji }: { value: number; label: string; emoji: string }) {
  return (
    <View style={{ flex: 1, backgroundColor: '#171717', borderRadius: 14, padding: 16, alignItems: 'center' }}>
      <Text style={{ fontSize: 22 }}>{emoji}</Text>
      <Text style={{ color: '#fff', fontSize: 24, fontWeight: '700', marginTop: 4 }}>{value}</Text>
      <Text style={{ color: '#6b7280', fontSize: 12 }}>{label}</Text>
    </View>
  );
}

function SettingsItem({ icon, label, onPress, danger = false, rightText }: {
  icon: string; label: string; onPress: () => void; danger?: boolean; rightText?: string;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#262626' }}
    >
      <Text style={{ fontSize: 18, marginRight: 12 }}>{icon}</Text>
      <Text style={{ flex: 1, color: danger ? '#ef4444' : '#fff', fontSize: 15 }}>{label}</Text>
      {rightText && <Text style={{ color: '#9ca3af', fontSize: 14, marginRight: 8 }}>{rightText}</Text>}
      <Text style={{ color: '#4b5563' }}>›</Text>
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const { signOut } = useAuthStore();
  const language = useLanguageStore(state => state.language);
  const setLanguage = useLanguageStore(state => state.setLanguage);
  const { t } = useI18n();

  const [currentUserId, setCurrentUserId] = useState<string>('');
  const { data: user, isLoading, error: userError } = useUser(currentUserId);
  const updateUserMutation = useUpdateUser();
  const authUser = useAuthStore(state => state.user);

  const [notifStatus, setNotifStatus] = useState<'loading' | 'granted' | 'denied' | 'undetermined'>('loading');

  // Get current user ID
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        console.log('[Profile] Current user ID:', data.user.id);
        setCurrentUserId(data.user.id);
      }
    });
  }, []);

  // Check notification permission status
  useEffect(() => {
    let Notifications: typeof import('expo-notifications') | null = null;
    try { Notifications = require('expo-notifications'); } catch { /* unavailable */ }
    if (!Notifications) { console.log('[Profile] Notifications module not available'); setNotifStatus('denied'); return; }
    Notifications.getPermissionsAsync().then(({ status }) => {
      console.log('[Profile] Current notification status:', status);
      setNotifStatus(status as any);
    });
  }, []);

  const handleEnableNotifications = useCallback(async () => {
    console.log('[Profile] handleEnableNotifications, current status:', notifStatus);
    if (notifStatus === 'granted') {
      Alert.alert('Notifications', 'Notifications are already enabled!');
      return;
    }
    // Always try to register — requestPermissions will show the OS prompt if needed
    const token = await notificationService.registerForPushNotifications();
    console.log('[Profile] registration result, token:', token);
    if (token && currentUserId) {
      await notificationService.savePushToken(currentUserId, token);
      setNotifStatus('granted');
      Alert.alert('Notifications Enabled', 'You will now receive push notifications.');
    } else {
      // Permission was denied — guide to Settings
      setNotifStatus('denied');
      Alert.alert('Notifications Blocked', 'Please enable notifications in your device Settings.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Open Settings', onPress: () => Linking.openSettings() },
      ]);
    }
  }, [notifStatus, currentUserId]);

  const handleLanguageChange = async (newLanguage: 'en' | 'vi') => {
    setLanguage(newLanguage);
    if (currentUserId) {
      await updateUserMutation.mutateAsync({
        userId: currentUserId,
        updates: { language: newLanguage },
      });
    }
  };

  const handleSignOut = () => {
    Alert.alert(t('signOut'), t('signOutConfirm'), [
      { text: t('cancel'), style: 'cancel' },
      { text: t('signOut'), style: 'destructive', onPress: () => signOut() },
    ]);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#0a0a0a' }} edges={['left', 'right']}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color="#f97316" />
        </View>
      </SafeAreaView>
    );
  }

  if (!user && !authUser) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#0a0a0a' }} edges={['left', 'right']}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}>
          <Text style={{ color: '#fff', fontSize: 18, marginBottom: 8 }}>User not found</Text>
          <Text style={{ color: '#6b7280', fontSize: 13, textAlign: 'center' }}>
            User ID: {currentUserId || 'none'}
          </Text>
          {userError && (
            <Text style={{ color: '#ef4444', fontSize: 12, marginTop: 8, textAlign: 'center' }}>
              Error: {(userError as Error).message}
            </Text>
          )}
          <TouchableOpacity
            onPress={handleSignOut}
            style={{ backgroundColor: '#ef4444', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12, marginTop: 24 }}
          >
            <Text style={{ color: '#fff', fontSize: 15, fontWeight: '600' }}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Use Supabase data if available, otherwise fallback to auth store
  const displayUser = user || authUser!;

  const personaEmoji = displayUser.persona === 'local' ? '📍' : displayUser.persona === 'traveler' ? '✈️' : '🎓';
  const personaLabel = displayUser.persona === 'local' ? 'Local' : displayUser.persona === 'traveler' ? 'Traveler' : displayUser.persona || '';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0a0a0a' }} edges={['left', 'right']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={{ alignItems: 'center', paddingTop: 16, paddingBottom: 24 }}>
          {/* Avatar */}
          <View style={{
            width: 100, height: 100, borderRadius: 50,
            backgroundColor: '#171717', alignItems: 'center', justifyContent: 'center',
          }}>
            <Text style={{ fontSize: 42, color: '#fff' }}>{displayUser.name?.[0] || '?'}</Text>
          </View>

          {/* Name */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 14 }}>
            <Text style={{ color: '#fff', fontSize: 24, fontWeight: '700' }}>
              {displayUser.name || 'Unknown'}, {displayUser.age || '?'}
            </Text>
          </View>

          {/* Persona badge */}
          {displayUser.persona && (
            <View style={{
              backgroundColor: displayUser.persona === 'local' ? '#16a34a20' : '#8b5cf620',
              paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16, marginTop: 8,
            }}>
              <Text style={{
                color: displayUser.persona === 'local' ? '#4ade80' : '#a78bfa',
                fontSize: 13,
                fontWeight: '600'
              }}>
                {personaEmoji} {personaLabel}
              </Text>
            </View>
          )}

          {/* Bio */}
          {displayUser.bio && (
            <Text style={{
              color: '#9ca3af',
              fontSize: 14,
              textAlign: 'center',
              marginTop: 12,
              paddingHorizontal: 32,
              fontStyle: 'italic',
            }}>
              "{displayUser.bio}"
            </Text>
          )}

          <TouchableOpacity
            onPress={() => router.push('/(screens)/settings/edit-profile')}
            style={{ backgroundColor: '#262626', paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20, marginTop: 14 }}
          >
            <Text style={{ color: '#fff', fontSize: 14 }}>{t('editProfile') || 'Edit Profile'}</Text>
          </TouchableOpacity>

          {/* Cuisine tags */}
          {(displayUser as any).user_preferences?.cuisines?.length > 0 && (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 6, marginTop: 14, paddingHorizontal: 16 }}>
              {(displayUser as any).user_preferences.cuisines.map((cuisineId: string) => {
                const cat = CUISINE_CATEGORIES.find(c => c.id === cuisineId);
                if (!cat) return null;
                return (
                  <View key={cuisineId} style={{
                    backgroundColor: '#262626', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12,
                    flexDirection: 'row', alignItems: 'center', gap: 4,
                  }}>
                    <Text style={{ fontSize: 13 }}>{CUISINE_EMOJIS[cuisineId] || '🍽️'}</Text>
                    <Text style={{ color: '#9ca3af', fontSize: 12 }}>
                      {language === 'vi' ? cat.labelVi : cat.label}
                    </Text>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* Stats */}
        <View style={{ paddingHorizontal: 16, marginBottom: 24 }}>
          <StatCard value={displayUser.meal_count} label={t('meals') || 'Meals'} emoji="🍜" />
        </View>

        {/* Settings */}
        <View style={{ paddingHorizontal: 16, marginBottom: 32 }}>
          <Text style={{ color: '#fff', fontSize: 17, fontWeight: '600', marginBottom: 8 }}>
            {t('settings') || 'Settings'}
          </Text>
          <View style={{ backgroundColor: '#171717', borderRadius: 14, paddingHorizontal: 16 }}>
            <SettingsItem
              icon="✏️"
              label={t('editProfile') || 'Edit Profile'}
              onPress={() => router.push('/(screens)/settings/edit-profile')}
            />
            <SettingsItem
              icon="🍜"
              label={t('preferences') || 'Food Preferences'}
              onPress={() => router.push('/(screens)/settings/edit-preferences')}
            />
            <TouchableOpacity
              onPress={() => handleLanguageChange(language === 'en' ? 'vi' : 'en')}
              style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#262626' }}
            >
              <Text style={{ fontSize: 18, marginRight: 12 }}>{language === 'en' ? '🇺🇸' : '🇻🇳'}</Text>
              <Text style={{ flex: 1, color: '#fff', fontSize: 15 }}>{t('language') || 'Language'}</Text>
              <Text style={{ color: '#9ca3af', fontSize: 14, marginRight: 8 }}>
                {language === 'en' ? 'English' : 'Tiếng Việt'}
              </Text>
            </TouchableOpacity>
            <SettingsItem
              icon="🔔"
              label="Notifications"
              onPress={handleEnableNotifications}
              rightText={notifStatus === 'loading' ? '...' : notifStatus === 'granted' ? 'Enabled' : 'Disabled'}
            />
            <SettingsItem
              icon="🗑️"
              label={t('deleteAccount') || 'Delete Account'}
              onPress={() => router.push('/(screens)/settings/delete-account')}
              danger
            />
            <SettingsItem
              icon="🚪"
              label={t('signOut') || 'Sign Out'}
              onPress={handleSignOut}
              danger
            />
          </View>
        </View>

        <View style={{ alignItems: 'center', paddingBottom: 32 }}>
          <Text style={{ color: '#4b5563', fontSize: 12 }}>Chopsticks v1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
