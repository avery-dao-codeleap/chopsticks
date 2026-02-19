import { useAuthStore } from '@/lib/stores/auth';

/**
 * Custom hook for auth operations
 * Provides a cleaner API for components to interact with auth
 */
export function useAuth() {
  const store = useAuthStore();

  return {
    // State
    user: store.user,
    session: store.session,
    preferences: store.preferences,
    isLoading: store.isLoading,
    isOnboarded: store.isOnboarded,
    error: store.error,

    // Actions
    signInWithEmail: store.signInWithEmail,
    signUpWithEmail: store.signUpWithEmail,
    signOut: store.signOut,
    updateProfile: store.updateProfile,
    updatePreferences: store.updatePreferences,
    setOnboarded: store.setOnboarded,
    clearError: store.clearError,
  };
}
