import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';
import * as usersApi from '@/lib/services/api/users';

/**
 * Hook for fetching a user profile by ID
 */
export function useUser(userId: string | undefined) {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data, error } = await usersApi.getUser(userId);
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
}

/**
 * Hook for updating user profile
 */
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      updates,
    }: {
      userId: string;
      updates: Partial<{
        name: string;
        bio: string;
        photo_url: string;
        language: string;
      }>;
    }) => {
      const { error } = await usersApi.updateUser(userId, updates);
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['user', variables.userId] });
    },
    onError: (error) => {
      console.error('Update user error:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    },
  });
}

/**
 * Hook for updating user preferences
 */
export function useUpdatePreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      preferences,
    }: {
      userId: string;
      preferences: {
        cuisines: string[];
        budget_ranges: string[];
      };
    }) => {
      const { error } = await usersApi.updatePreferences(userId, preferences);
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['user', variables.userId] });
    },
    onError: (error) => {
      console.error('Update preferences error:', error);
      Alert.alert('Error', 'Failed to update preferences. Please try again.');
    },
  });
}

/**
 * Hook for deleting user account
 */
export function useDeleteAccount() {
  return useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await usersApi.deleteAccount(userId);
      if (error) throw error;
    },
    onError: (error) => {
      console.error('Delete account error:', error);
      Alert.alert('Error', 'Failed to delete account. Please try again.');
    },
  });
}
