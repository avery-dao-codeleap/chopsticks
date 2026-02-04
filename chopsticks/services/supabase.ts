import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import { isFirebaseMocked } from './firebase';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

// Skip native module entirely in Expo Go — require() itself can throw uncatchably
let SecureStore: typeof import('expo-secure-store') | null = null;
if (!isFirebaseMocked) {
  try {
    SecureStore = require('expo-secure-store');
  } catch {
    SecureStore = null;
  }
}

// In-memory fallback when SecureStore native module is unavailable
const memStore = new Map<string, string>();

const ExpoSecureStoreAdapter = {
  getItem: async (key: string) => {
    if (Platform.OS === 'web') return localStorage.getItem(key);
    if (!SecureStore) return memStore.get(key) ?? null;
    return await SecureStore.getItemAsync(key);
  },
  setItem: async (key: string, value: string) => {
    if (Platform.OS === 'web') { localStorage.setItem(key, value); return; }
    if (!SecureStore) { memStore.set(key, value); return; }
    await SecureStore.setItemAsync(key, value);
  },
  removeItem: async (key: string) => {
    if (Platform.OS === 'web') { localStorage.removeItem(key); return; }
    if (!SecureStore) { memStore.delete(key); return; }
    await SecureStore.deleteItemAsync(key);
  },
};

// Create Supabase client with secure storage
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Types for database tables
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          firebase_uid: string;
          phone: string;
          name: string | null;
          age: number | null;
          gender: 'male' | 'female' | 'non-binary' | 'prefer_not_to_say' | null;
          photo_url: string | null;
          persona: 'local' | 'new_to_city' | 'expat' | 'traveler' | 'student' | null;
          city: string;
          bio: string | null;
          meal_count: number;
          language: 'vi' | 'en';
          expo_push_token: string | null;
          last_active_at: string;
          deleted_at: string | null;
          banned_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['users']['Row']>;
        Update: Partial<Database['public']['Tables']['users']['Row']>;
      };
      user_preferences: {
        Row: {
          user_id: string;
          cuisines: string[];
          budget_ranges: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['user_preferences']['Row']>;
        Update: Partial<Database['public']['Tables']['user_preferences']['Row']>;
      };
      meal_requests: {
        Row: {
          id: string;
          requester_id: string;
          restaurant_id: string;
          cuisine: string;
          budget_range: string;
          time_window: string;
          group_size: number;
          join_type: 'open' | 'approval';
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['meal_requests']['Row']>;
        Update: Partial<Database['public']['Tables']['meal_requests']['Row']>;
      };
    };
  };
};
