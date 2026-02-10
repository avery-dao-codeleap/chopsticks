import { useAuthStore } from '@/stores/auth';

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
    firebaseConfirmation: store.firebaseConfirmation,

    // Actions
    signInWithPhone: store.signInWithPhone,
    verifyOtp: store.verifyOtp,
    signOut: store.signOut,
    updateProfile: store.updateProfile,
    updatePreferences: store.updatePreferences,
    setOnboarded: store.setOnboarded,
    clearError: store.clearError,
  };
}
