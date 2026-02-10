import { supabase } from '../supabase';

/**
 * Sign up with email and password
 */
export async function signUpWithEmail(email: string, password: string): Promise<{
  user: any;
  session: any;
  error: Error | null;
}> {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: undefined, // Skip email verification for now
      },
    });

    if (error) {
      return { user: null, session: null, error: new Error(error.message) };
    }

    return { user: data.user, session: data.session, error: null };
  } catch (error) {
    console.error('Sign up error:', error);
    return { user: null, session: null, error: error as Error };
  }
}

/**
 * Sign in with email and password
 */
export async function signInWithEmail(email: string, password: string): Promise<{
  user: any;
  session: any;
  error: Error | null;
}> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { user: null, session: null, error: new Error(error.message) };
    }

    return { user: data.user, session: data.session, error: null };
  } catch (error) {
    console.error('Sign in error:', error);
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
  city?: string;
  email?: string;
}): Promise<{ error: Error | null }> {
  try {
    console.log('[upsertUser] Attempting upsert for user:', userId, 'with data:', data);

    // Use upsert to INSERT if not exists, UPDATE if exists
    const { error } = await supabase
      .from('users')
      .upsert({
        id: userId,
        ...data,
        last_active_at: new Date().toISOString(),
      }, {
        onConflict: 'id',
      });

    if (error) {
      console.error('[upsertUser] Supabase error:', JSON.stringify(error, null, 2));
      return { error: new Error(error.message) };
    }

    console.log('[upsertUser] Success!');
    return { error: null };
  } catch (error) {
    console.error('[upsertUser] Caught exception:', error);
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
 * Sign out from Supabase
 */
export async function signOut(): Promise<{ error: Error | null }> {
  try {
    await supabase.auth.signOut();
    return { error: null };
  } catch (error) {
    console.error('Sign out error:', error);
    return { error: error as Error };
  }
}
