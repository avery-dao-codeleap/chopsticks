import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { useDeleteAccount } from '@/hooks/queries/useUser';
import { supabase } from '@/services/supabase';
import { useI18n } from '@/lib/i18n';
import { useAuthStore } from '@/stores/auth';

export default function DeleteAccountScreen() {
  const router = useRouter();
  const { t } = useI18n();
  const { signOut } = useAuthStore();

  const [currentUserId, setCurrentUserId] = useState<string>('');
  const deleteAccountMutation = useDeleteAccount();

  // Get current user ID
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setCurrentUserId(data.user.id);
    });
  }, []);

  const handleDelete = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone. All your data will be permanently removed.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: confirmDelete,
        },
      ]
    );
  };

  const confirmDelete = async () => {
    try {
      await deleteAccountMutation.mutateAsync(currentUserId);

      // Sign out and redirect to auth
      signOut();
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Delete account error:', error);
      // Error alert is handled by the hook
    }
  };

  return (
    <SafeAreaView style={s.container} edges={['left', 'right']}>
      <Stack.Screen
        options={{
          headerTitle: t('deleteAccount') || 'Delete Account',
          headerBackTitle: 'Back',
        }}
      />

      <View style={s.content}>
        {/* Warning Icon */}
        <View style={s.iconContainer}>
          <Text style={s.icon}>⚠️</Text>
        </View>

        {/* Title */}
        <Text style={s.title}>Delete Your Account</Text>

        {/* Warning Text */}
        <View style={s.warningBox}>
          <Text style={s.warningTitle}>This action is permanent</Text>
          <Text style={s.warningText}>
            • All your profile data will be deleted{'\n'}
            • Your meal history will be removed{'\n'}
            • You will be removed from all active chats{'\n'}
            • This cannot be undone
          </Text>
        </View>

        {/* Spacer */}
        <View style={{ flex: 1 }} />

        {/* Delete Button */}
        <TouchableOpacity
          style={[s.deleteButton, deleteAccountMutation.isPending && { opacity: 0.6 }]}
          onPress={handleDelete}
          disabled={deleteAccountMutation.isPending}
        >
          {deleteAccountMutation.isPending ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Text style={s.deleteButtonText}>Delete My Account</Text>
          )}
        </TouchableOpacity>

        {/* Cancel Button */}
        <TouchableOpacity
          style={s.cancelButton}
          onPress={() => router.back()}
          disabled={deleteAccountMutation.isPending}
        >
          <Text style={s.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>

        <Text style={s.footer}>If you have any concerns, please contact us before deleting.</Text>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  icon: {
    fontSize: 64,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 32,
  },
  warningBox: {
    backgroundColor: '#1a1410',
    borderWidth: 1,
    borderColor: '#3f2615',
    borderRadius: 12,
    padding: 20,
  },
  warningTitle: {
    color: '#fb923c',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  warningText: {
    color: '#d1d5db',
    fontSize: 14,
    lineHeight: 22,
  },
  deleteButton: {
    backgroundColor: '#dc2626',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  cancelButton: {
    backgroundColor: '#171717',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  cancelButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  footer: {
    color: '#6b7280',
    fontSize: 12,
    textAlign: 'center',
  },
});
