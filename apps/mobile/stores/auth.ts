import { create } from 'zustand';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { User, UserPreferences } from '@/types';

interface AuthState {
  session: Session | null;
  user: User | null;
  preferences: UserPreferences | null;
  isLoading: boolean;
  isOnboarded: boolean;
  devBypass: boolean;

  // Actions
  initialize: () => Promise<void>;
  signInWithPhone: (phone: string) => Promise<{ error: Error | null }>;
  verifyOtp: (phone: string, token: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<{ error: Error | null }>;
  updatePreferences: (data: Partial<UserPreferences>) => Promise<{ error: Error | null }>;
  setOnboarded: (value: boolean) => void;
  enableDevBypass: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  user: null,
  preferences: null,
  isLoading: true,
  isOnboarded: false,
  devBypass: false,

  initialize: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        // Fetch user profile
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();

        // Fetch user preferences
        const { data: prefsData } = await supabase
          .from('user_preferences')
          .select('*')
          .eq('user_id', session.user.id)
          .single();

        set({
          session,
          user: userData ? {
            id: userData.id,
            email: userData.email,
            phone: userData.phone,
            name: userData.name,
            age: userData.age,
            bio: userData.bio,
            profileImageUrl: userData.profile_image_url,
            verificationStatus: userData.verification_status,
            mealCount: userData.meal_count,
          } : null,
          preferences: prefsData ? {
            cuisineTypes: prefsData.cuisine_types,
            dietaryRestrictions: prefsData.dietary_restrictions,
            allergies: prefsData.allergies,
            budgetMin: prefsData.budget_min,
            budgetMax: prefsData.budget_max,
            preferredRadiusKm: prefsData.preferred_radius_km,
          } : null,
          isOnboarded: !!userData?.name,
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }

      // Listen for auth changes
      supabase.auth.onAuthStateChange(async (event, session) => {
        set({ session });
        if (event === 'SIGNED_OUT') {
          set({ user: null, preferences: null, isOnboarded: false });
        }
      });
    } catch (error) {
      console.error('Auth initialization error:', error);
      set({ isLoading: false });
    }
  },

  signInWithPhone: async (phone: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      phone,
    });
    return { error: error as Error | null };
  },

  verifyOtp: async (phone: string, token: string) => {
    const { data, error } = await supabase.auth.verifyOtp({
      phone,
      token,
      type: 'sms',
    });

    if (!error && data.user) {
      // Check if user profile exists, if not create one
      const { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (!existingUser) {
        // New user - needs onboarding
        set({ isOnboarded: false });
      } else {
        set({
          user: {
            id: existingUser.id,
            email: existingUser.email,
            phone: existingUser.phone,
            name: existingUser.name,
            age: existingUser.age,
            bio: existingUser.bio,
            profileImageUrl: existingUser.profile_image_url,
            verificationStatus: existingUser.verification_status,
            mealCount: existingUser.meal_count,
          },
          isOnboarded: !!existingUser.name,
        });
      }
    }

    return { error: error as Error | null };
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ session: null, user: null, preferences: null, isOnboarded: false });
  },

  updateProfile: async (data: Partial<User>) => {
    const { session, user } = get();
    if (!session?.user) return { error: new Error('Not authenticated') };

    const updateData: Record<string, unknown> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.age !== undefined) updateData.age = data.age;
    if (data.bio !== undefined) updateData.bio = data.bio;
    if (data.profileImageUrl !== undefined) updateData.profile_image_url = data.profileImageUrl;

    const { error } = await supabase
      .from('users')
      .upsert({
        id: session.user.id,
        phone: session.user.phone,
        ...updateData,
        updated_at: new Date().toISOString(),
      });

    if (!error) {
      set({ user: { ...user!, ...data }, isOnboarded: true });
    }

    return { error: error as Error | null };
  },

  updatePreferences: async (data: Partial<UserPreferences>) => {
    const { session, preferences } = get();
    if (!session?.user) return { error: new Error('Not authenticated') };

    const updateData: Record<string, unknown> = {};
    if (data.cuisineTypes !== undefined) updateData.cuisine_types = data.cuisineTypes;
    if (data.dietaryRestrictions !== undefined) updateData.dietary_restrictions = data.dietaryRestrictions;
    if (data.allergies !== undefined) updateData.allergies = data.allergies;
    if (data.budgetMin !== undefined) updateData.budget_min = data.budgetMin;
    if (data.budgetMax !== undefined) updateData.budget_max = data.budgetMax;
    if (data.preferredRadiusKm !== undefined) updateData.preferred_radius_km = data.preferredRadiusKm;

    const { error } = await supabase
      .from('user_preferences')
      .upsert({
        user_id: session.user.id,
        ...updateData,
        updated_at: new Date().toISOString(),
      });

    if (!error) {
      set({ preferences: { ...preferences!, ...data } });
    }

    return { error: error as Error | null };
  },

  setOnboarded: (value: boolean) => set({ isOnboarded: value }),

  enableDevBypass: () => set({
    devBypass: true,
    isOnboarded: true,
    user: {
      id: 'dev-user',
      phone: '+84123456789',
      name: 'Dev User',
      age: 25,
      bio: 'Testing the app',
      profileImageUrl: null,
      verificationStatus: 'verified',
      mealCount: 5,
    },
    preferences: {
      cuisineTypes: ['Vietnamese', 'Japanese', 'Korean'],
      dietaryRestrictions: [],
      allergies: [],
      budgetMin: 50000,
      budgetMax: 200000,
      preferredRadiusKm: 5,
    },
  }),
}));
