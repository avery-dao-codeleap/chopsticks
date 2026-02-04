import { supabase } from '../supabase';
import { firebaseAuth } from '../firebase';

/**
 * Exchange Firebase ID token for Supabase JWT
 */
export async function exchangeFirebaseToken(firebaseToken: string): Promise<{
  user: any;
  session: any;
  error: Error | null;
}> {
  try {
    const response = await fetch(
      `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/exchange-firebase-token`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
        },
        body: JSON.stringify({ firebaseToken }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return { user: null, session: null, error: new Error(data.error || 'Token exchange failed') };
    }

    // Set Supabase session
    if (data.session) {
      await supabase.auth.setSession(data.session);
    }

    return { user: data.user, session: data.session, error: null };
  } catch (error) {
    console.error('Exchange token error:', error);
    return { user: null, session: null, error: error as Error };
  }
}

/**
 * Create or update user profile
 */
export async function upsertUser(userId: string, data: {
  name?: string;
  age?: number;
  gender?: string;
  photo_url?: string;
  persona?: string;
  bio?: string;
  expo_push_token?: string;
  language?: string;
}): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabase
      .from('users')
      .update({
        ...data,
        last_active_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (error) {
      return { error: new Error(error.message) };
    }

    return { error: null };
  } catch (error) {
    console.error('Upsert user error:', error);
    return { error: error as Error };
  }
}

/**
 * Create or update user preferences
 */
export async function upsertUserPreferences(userId: string, data: {
  cuisines?: string[];
  budget_ranges?: string[];
}): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabase
      .from('user_preferences')
      .upsert({
        user_id: userId,
        ...data,
      });

    if (error) {
      return { error: new Error(error.message) };
    }

    return { error: null };
  } catch (error) {
    console.error('Upsert preferences error:', error);
    return { error: error as Error };
  }
}

/**
 * Get user profile
 */
export async function getUserProfile(userId: string): Promise<{
  user: any;
  preferences: any;
  error: Error | null;
}> {
  try {
    const [userRes, prefsRes] = await Promise.all([
      supabase.from('users').select('*').eq('id', userId).single(),
      supabase.from('user_preferences').select('*').eq('user_id', userId).single(),
    ]);

    if (userRes.error) {
      return { user: null, preferences: null, error: new Error(userRes.error.message) };
    }

    return {
      user: userRes.data,
      preferences: prefsRes.data,
      error: null,
    };
  } catch (error) {
    console.error('Get user profile error:', error);
    return { user: null, preferences: null, error: error as Error };
  }
}

/**
 * Sign out (both Firebase and Supabase)
 */
export async function signOut(): Promise<{ error: Error | null }> {
  try {
    await Promise.all([
      firebaseAuth.signOut(),
      supabase.auth.signOut(),
    ]);

    return { error: null };
  } catch (error) {
    console.error('Sign out error:', error);
    return { error: error as Error };
  }
}
