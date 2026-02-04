import { create } from 'zustand';
import { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { firebaseAuth, isFirebaseMocked } from '@/services/firebase';
import { supabase } from '@/services/supabase';
import * as authApi from '@/services/api/auth';
import { notificationService } from '@/services/notifications';

interface User {
  id: string;
  phone: string;
  name: string | null;
  age: number | null;
  gender: string | null;
  photo_url: string | null;
  persona: string | null;
  city: string;
  meal_count: number;
  bio: string | null;
  language: string;
  created_at: string;
  updated_at: string;
}

interface UserPreferences {
  user_id: string;
  cuisines: string[];
  budget_ranges: string[];
  created_at: string;
  updated_at: string;
}

interface AuthState {
  // State
  session: { user: { id: string } } | null;
  user: User | null;
  preferences: UserPreferences | null;
  isLoading: boolean;
  isOnboarded: boolean;
  error: string | null;

  // Firebase confirmation (for OTP flow)
  firebaseConfirmation: FirebaseAuthTypes.ConfirmationResult | null;

  // Actions
  initialize: () => Promise<void>;
  signInWithPhone: (phone: string) => Promise<{ error: Error | null }>;
  verifyOtp: (code: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<{ error: Error | null }>;
  updatePreferences: (data: Partial<UserPreferences>) => Promise<{ error: Error | null }>;
  setOnboarded: (value: boolean) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  // Initial state
  session: null,
  user: null,
  preferences: null,
  isLoading: true,
  isOnboarded: false,
  error: null,
  firebaseConfirmation: null,

  /**
   * Initialize auth state on app launch
   */
  initialize: async () => {
    // In Expo Go, Firebase native module is unavailable — auto-login with mock data
    if (isFirebaseMocked) {
      const now = new Date().toISOString();
      set({
        session: { user: { id: 'mock-user-id' } },
        user: {
          id: 'mock-user-id',
          phone: '+84900000000',
          name: 'Alex',
          age: 26,
          gender: 'Non-binary',
          photo_url: null,
          persona: 'traveler',
          city: 'Ho Chi Minh City',
          meal_count: 12,
          bio: 'Food lover exploring HCMC one dish at a time',
          language: 'en',
          created_at: now,
          updated_at: now,
        },
        preferences: {
          user_id: 'mock-user-id',
          cuisines: ['noodles_congee', 'seafood', 'international'],
          budget_ranges: ['50k_150k', '150k_500k'],
          created_at: now,
          updated_at: now,
        },
        isOnboarded: false,
        isLoading: false,
      });
      console.warn('[Auth] Mock mode — auto-logged in as Alex (onboarding pending).');
      return;
    }

    try {
      // Check for existing Supabase session
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        console.error('Session error:', error);
        set({ isLoading: false });
        return;
      }

      if (session?.user) {
        // Fetch user profile
        const { user, preferences } = await authApi.getUserProfile(session.user.id);

        // Check if onboarding is complete (has name, photo, persona, preferences)
        const isOnboarded = !!(
          user?.name &&
          user?.photo_url &&
          user?.persona &&
          preferences?.cuisines?.length &&
          preferences?.budget_ranges?.length
        );

        set({
          session: { user: { id: session.user.id } },
          user,
          preferences,
          isOnboarded,
          isLoading: false,
        });

        // Register for push notifications
        if (isOnboarded) {
          const token = await notificationService.registerForPushNotifications();
          if (token && user) {
            await notificationService.savePushToken(user.id, token);
          }
        }
      } else {
        set({ isLoading: false });
      }

      // Listen for auth state changes
      supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_OUT') {
          set({
            session: null,
            user: null,
            preferences: null,
            isOnboarded: false,
          });
        }
      });
    } catch (error) {
      console.error('Initialize error:', error);
      set({ isLoading: false, error: (error as Error).message });
    }
  },

  /**
   * Send OTP to phone number via Firebase
   */
  signInWithPhone: async (phone: string) => {
    try {
      set({ isLoading: true, error: null });

      const confirmation = await firebaseAuth.signInWithPhoneNumber(phone);

      set({
        firebaseConfirmation: confirmation,
        isLoading: false,
      });

      return { error: null };
    } catch (error) {
      console.error('Sign in error:', error);
      set({
        isLoading: false,
        error: (error as Error).message,
      });
      return { error: error as Error };
    }
  },

  /**
   * Verify OTP code and exchange Firebase token for Supabase session
   */
  verifyOtp: async (code: string) => {
    const { firebaseConfirmation } = get();

    if (!firebaseConfirmation) {
      const error = new Error('No confirmation result. Please send OTP first.');
      set({ error: error.message });
      return { error };
    }

    try {
      set({ isLoading: true, error: null });

      // Confirm OTP with Firebase
      await firebaseAuth.confirmCode(firebaseConfirmation, code);

      // Get Firebase ID token
      const firebaseToken = await firebaseAuth.getIdToken(true);

      if (!firebaseToken) {
        throw new Error('Failed to get Firebase token');
      }

      // Exchange Firebase token for Supabase session
      const { user, session, error: exchangeError } = await authApi.exchangeFirebaseToken(
        firebaseToken
      );

      if (exchangeError || !session) {
        throw exchangeError || new Error('Failed to exchange token');
      }

      // Fetch user profile
      const { user: fullUser, preferences } = await authApi.getUserProfile(session.user.id);

      // Check if onboarding is complete
      const isOnboarded = !!(
        fullUser?.name &&
        fullUser?.photo_url &&
        fullUser?.persona &&
        preferences?.cuisines?.length &&
        preferences?.budget_ranges?.length
      );

      set({
        session: { user: { id: session.user.id } },
        user: fullUser,
        preferences,
        isOnboarded,
        firebaseConfirmation: null,
        isLoading: false,
      });

      return { error: null };
    } catch (error) {
      console.error('Verify OTP error:', error);
      set({
        isLoading: false,
        error: (error as Error).message,
      });
      return { error: error as Error };
    }
  },

  /**
   * Sign out (both Firebase and Supabase)
   */
  signOut: async () => {
    try {
      await authApi.signOut();
      set({
        session: null,
        user: null,
        preferences: null,
        isOnboarded: false,
        firebaseConfirmation: null,
      });
    } catch (error) {
      console.error('Sign out error:', error);
      set({ error: (error as Error).message });
    }
  },

  /**
   * Update user profile
   */
  updateProfile: async (data: Partial<User>) => {
    const { user } = get();
    if (!user) {
      return { error: new Error('No user logged in') };
    }

    try {
      // Strip null values — upsertUser only accepts undefined for optional fields
      const filtered = Object.fromEntries(
        Object.entries(data).filter(([, v]) => v !== null)
      ) as Parameters<typeof authApi.upsertUser>[1];
      const { error } = await authApi.upsertUser(user.id, filtered);

      if (error) {
        return { error };
      }

      // Update local state
      set({
        user: {
          ...user,
          ...data,
        } as User,
      });

      return { error: null };
    } catch (error) {
      console.error('Update profile error:', error);
      return { error: error as Error };
    }
  },

  /**
   * Update user preferences
   */
  updatePreferences: async (data: Partial<UserPreferences>) => {
    const { user, preferences } = get();
    if (!user) {
      return { error: new Error('No user logged in') };
    }

    try {
      const { error } = await authApi.upsertUserPreferences(user.id, data);

      if (error) {
        return { error };
      }

      // Update local state
      set({
        preferences: {
          user_id: user.id,
          cuisines: [],
          budget_ranges: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          ...preferences,
          ...data,
        },
      });

      return { error: null };
    } catch (error) {
      console.error('Update preferences error:', error);
      return { error: error as Error };
    }
  },

  /**
   * Mark onboarding as complete
   */
  setOnboarded: (value: boolean) => set({ isOnboarded: value }),

  /**
   * Clear error message
   */
  clearError: () => set({ error: null }),
}));
