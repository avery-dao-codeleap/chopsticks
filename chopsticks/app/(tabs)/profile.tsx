import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Modal, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/stores/auth';
import { useLanguageStore } from '@/stores/language';
import { useI18n } from '@/lib/i18n';
import { CURRENT_USER } from '@/lib/mockData';

function StatCard({ value, label, emoji }: { value: number; label: string; emoji: string }) {
  return (
    <View style={{ flex: 1, backgroundColor: '#171717', borderRadius: 14, padding: 16, alignItems: 'center' }}>
      <Text style={{ fontSize: 22 }}>{emoji}</Text>
      <Text style={{ color: '#fff', fontSize: 24, fontWeight: '700', marginTop: 4 }}>{value}</Text>
      <Text style={{ color: '#6b7280', fontSize: 12 }}>{label}</Text>
    </View>
  );
}

function SettingsItem({ icon, label, onPress, danger = false }: {
  icon: string; label: string; onPress: () => void; danger?: boolean;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#262626' }}
    >
      <Text style={{ fontSize: 18, marginRight: 12 }}>{icon}</Text>
      <Text style={{ flex: 1, color: danger ? '#ef4444' : '#fff', fontSize: 15 }}>{label}</Text>
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
  const u = CURRENT_USER;
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [supportName, setSupportName] = useState('');
  const [supportEmail, setSupportEmail] = useState('');
  const [supportMessage, setSupportMessage] = useState('');

  const handleSignOut = () => {
    Alert.alert(t('signOut'), t('signOutConfirm'), [
      { text: t('cancel'), style: 'cancel' },
      { text: t('signOut'), style: 'destructive', onPress: () => signOut() },
    ]);
  };

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
            <Text style={{ fontSize: 42, color: '#fff' }}>{u.name[0]}</Text>
          </View>

          {/* Name */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 14 }}>
            <Text style={{ color: '#fff', fontSize: 24, fontWeight: '700' }}>{u.name}, {u.age}</Text>
            {u.verified && <Text style={{ color: '#60a5fa', fontSize: 16, marginLeft: 8 }}>✓</Text>}
          </View>

          {/* Persona badge */}
          <View style={{
            backgroundColor: u.persona === 'local' ? '#16a34a20' : '#8b5cf620',
            paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16, marginTop: 8,
          }}>
            <Text style={{ color: u.persona === 'local' ? '#4ade80' : '#a78bfa', fontSize: 13, fontWeight: '600' }}>
              {u.persona === 'local' ? '📍 Local' : '✈️ Traveler'}
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => router.push('/(screens)/edit-profile')}
            style={{ backgroundColor: '#262626', paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20, marginTop: 14 }}
          >
            <Text style={{ color: '#fff', fontSize: 14 }}>{t('editProfile')}</Text>
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={{ paddingHorizontal: 16, marginBottom: 24 }}>
          <StatCard value={u.mealCount} label={t('meals')} emoji="🍜" />
        </View>

        {/* Settings */}
        <View style={{ paddingHorizontal: 16, marginBottom: 32 }}>
          <Text style={{ color: '#fff', fontSize: 17, fontWeight: '600', marginBottom: 8 }}>{t('settings')}</Text>
          <View style={{ backgroundColor: '#171717', borderRadius: 14, paddingHorizontal: 16 }}>
            <TouchableOpacity
              onPress={() => setLanguage(language === 'en' ? 'vi' : 'en')}
              style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#262626' }}
            >
              <Text style={{ fontSize: 18, marginRight: 12 }}>{language === 'en' ? '🇺🇸' : '🇻🇳'}</Text>
              <Text style={{ flex: 1, color: '#fff', fontSize: 15 }}>{t('language')}</Text>
              <Text style={{ color: '#9ca3af', fontSize: 14 }}>{language === 'en' ? 'English' : 'Tiếng Việt'}</Text>
            </TouchableOpacity>
            <SettingsItem icon="🔒" label={t('privacySafety')} onPress={() => {}} />
            <SettingsItem icon="❓" label={t('supportFeedback')} onPress={() => setShowSupportModal(true)} />
            <SettingsItem icon="🚪" label={t('signOut')} onPress={handleSignOut} danger />
          </View>
        </View>

        <View style={{ alignItems: 'center', paddingBottom: 32 }}>
          <Text style={{ color: '#4b5563', fontSize: 12 }}>Chopsticks v2.0.0</Text>
        </View>
      </ScrollView>
      {/* Support & Feedback Modal */}
      <Modal visible={showSupportModal} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: '#171717', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24 }}>
            <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 4 }}>{t('supportFeedback')}</Text>
            <Text style={{ color: '#6b7280', fontSize: 13, marginBottom: 20 }}>{t('supportSubtitle')}</Text>
            <Text style={{ color: '#9ca3af', fontSize: 12, marginBottom: 6 }}>{t('name')}</Text>
            <TextInput
              value={supportName}
              onChangeText={setSupportName}
              placeholder={t('supportPlaceholderName')}
              placeholderTextColor="#4b5563"
              style={{ backgroundColor: '#262626', borderRadius: 10, padding: 12, color: '#fff', fontSize: 15, marginBottom: 12 }}
            />
            <Text style={{ color: '#9ca3af', fontSize: 12, marginBottom: 6 }}>{t('supportEmailLabel')}</Text>
            <TextInput
              value={supportEmail}
              onChangeText={setSupportEmail}
              placeholder={t('supportPlaceholderEmail')}
              placeholderTextColor="#4b5563"
              keyboardType="email-address"
              autoCapitalize="none"
              style={{ backgroundColor: '#262626', borderRadius: 10, padding: 12, color: '#fff', fontSize: 15, marginBottom: 12 }}
            />
            <Text style={{ color: '#9ca3af', fontSize: 12, marginBottom: 6 }}>{t('supportMessageLabel')}</Text>
            <TextInput
              value={supportMessage}
              onChangeText={setSupportMessage}
              placeholder={t('supportPlaceholderMessage')}
              placeholderTextColor="#4b5563"
              multiline
              numberOfLines={3}
              style={{ backgroundColor: '#262626', borderRadius: 10, padding: 12, color: '#fff', fontSize: 15, minHeight: 100, textAlignVertical: 'top', marginBottom: 16 }}
            />
            <TouchableOpacity
              onPress={() => {
                if (!supportName.trim() || !supportEmail.trim() || !supportMessage.trim()) {
                  Alert.alert(t('missingInfo'), t('fillAllFields'));
                  return;
                }
                setShowSupportModal(false);
                setSupportName('');
                setSupportEmail('');
                setSupportMessage('');
                Alert.alert(t('thanks'), t('feedbackReceived'));
              }}
              style={{ backgroundColor: '#f97316', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginBottom: 8 }}
            >
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>{t('send')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => { setShowSupportModal(false); setSupportName(''); setSupportEmail(''); setSupportMessage(''); }}
              style={{ paddingVertical: 12, alignItems: 'center' }}
            >
              <Text style={{ color: '#6b7280', fontSize: 15 }}>{t('cancel')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
