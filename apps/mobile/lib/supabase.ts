import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { Database } from '@/types/database';

// Check if we're in a native environment where SecureStore is available
const isNative = Platform.OS === 'ios' || Platform.OS === 'android';

const ExpoSecureStoreAdapter = {
  getItem: async (key: string): Promise<string | null> => {
    if (!isNative) {
      // Fallback for SSR/web - use in-memory or return null
      return null;
    }
    try {
      return await SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    if (!isNative) {
      return;
    }
    try {
      await SecureStore.setItemAsync(key, value);
    } catch {
      // Silently fail on SSR
    }
  },
  removeItem: async (key: string): Promise<void> => {
    if (!isNative) {
      return;
    }
    try {
      await SecureStore.deleteItemAsync(key);
    } catch {
      // Silently fail on SSR
    }
  },
};

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
