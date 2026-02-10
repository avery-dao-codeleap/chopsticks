import { create } from 'zustand';
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

  // Actions
  initialize: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUpWithEmail: (email: string, password: string) => Promise<{ error: Error | null }>;
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

  /**
   * Initialize auth state on app launch
   */
  initialize: async () => {
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

        // Check if onboarding is complete (photo_url is optional)
        const isOnboarded = !!(
          user?.name &&
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
   * Sign in with email and password
   */
  signInWithEmail: async (email: string, password: string) => {
    try {
      set({ isLoading: true, error: null });

      const { user, session, error: authError } = await authApi.signInWithEmail(email, password);

      if (authError || !session) {
        throw authError || new Error('Failed to sign in');
      }

      // Fetch user profile
      const { user: fullUser, preferences } = await authApi.getUserProfile(session.user.id);

      // Check if onboarding is complete (photo_url is optional)
      const isOnboarded = !!(
        fullUser?.name &&
        fullUser?.persona &&
        preferences?.cuisines?.length &&
        preferences?.budget_ranges?.length
      );

      set({
        session: { user: { id: session.user.id } },
        user: fullUser,
        preferences,
        isOnboarded,
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
   * Sign up with email and password
   */
  signUpWithEmail: async (email: string, password: string) => {
    try {
      set({ isLoading: true, error: null });

      const { user, session, error: authError } = await authApi.signUpWithEmail(email, password);

      if (authError || !session) {
        throw authError || new Error('Failed to sign up');
      }

      // Fetch user profile (will be empty for new users)
      const { user: fullUser, preferences } = await authApi.getUserProfile(session.user.id);

      set({
        session: { user: { id: session.user.id } },
        user: fullUser,
        preferences,
        isOnboarded: false, // New users need to complete onboarding
        isLoading: false,
      });

      return { error: null };
    } catch (error) {
      console.error('Sign up error:', error);
      set({
        isLoading: false,
        error: (error as Error).message,
      });
      return { error: error as Error };
    }
  },

  /**
   * Sign out from Supabase
   */
  signOut: async () => {
    try {
      await authApi.signOut();
      set({
        session: null,
        user: null,
        preferences: null,
        isOnboarded: false,
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
    const { user, session } = get();

    // Use session.user.id if user doesn't exist yet (during onboarding)
    const userId = user?.id || session?.user?.id;

    if (!userId) {
      return { error: new Error('No user logged in') };
    }

    try {
      // Strip null values — upsertUser only accepts undefined for optional fields
      const filtered = Object.fromEntries(
        Object.entries(data).filter(([, v]) => v !== null)
      ) as Parameters<typeof authApi.upsertUser>[1];
      const { error } = await authApi.upsertUser(userId, filtered);

      if (error) {
        return { error };
      }

      // Update local state - if user exists, merge data; otherwise create user object
      if (user) {
        set({
          user: {
            ...user,
            ...data,
          } as User,
        });
      } else {
        // Create minimal user object during onboarding
        set({
          user: {
            id: userId,
            phone: '',
            meal_count: 0,
            language: 'vi',
            city: 'hcmc',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            ...data,
          } as User,
        });
      }

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
