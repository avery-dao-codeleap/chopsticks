import { supabase } from '../supabase';

export interface UserProfile {
  id: string;
  name: string | null;
  age: number | null;
  gender: string | null;
  photo_url: string | null;
  persona: string | null;
  city: string;
  bio: string | null;
  meal_count: number;
  language: string;
  created_at: string;
}

export interface UserWithPreferences extends UserProfile {
  user_preferences: {
    cuisines: string[];
    budget_ranges: string[];
  } | null;
}

/**
 * Get a user profile by ID with preferences
 * Uses public_profiles view for other users (excludes phone, firebase_uid, expo_push_token)
 * Uses users table for own profile (includes all fields)
 */
export async function getUser(userId: string): Promise<{
  data: UserWithPreferences | null;
  error: Error | null;
}> {
  try {
    // Check if viewing own profile
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    const isOwnProfile = currentUser?.id === userId;

    // Use users table for own profile, public_profiles view for others
    const tableName = isOwnProfile ? 'users' : 'public_profiles';

    const { data, error } = await supabase
      .from(tableName)
      .select('*, user_preferences(cuisines, budget_ranges)')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    if (!data) {
      return { data: null, error: new Error('User not found') };
    }

    // Handle the nested relationship - user_preferences is returned as an array
    const preferences = Array.isArray(data.user_preferences)
      ? (data.user_preferences[0] || null)
      : data.user_preferences;

    return {
      data: {
        ...data,
        user_preferences: preferences,
      } as UserWithPreferences,
      error: null
    };
  } catch (error) {
    console.error('Get user error:', error);
    return { data: null, error: error as Error };
  }
}

/**
 * Update user profile
 */
export async function updateUser(
  userId: string,
  updates: Partial<{
    name: string;
    bio: string;
    photo_url: string;
    language: string;
  }>
): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId);

    if (error) {
      return { error: new Error(error.message) };
    }

    return { error: null };
  } catch (error) {
    console.error('Update user error:', error);
    return { error: error as Error };
  }
}

/**
 * Update user preferences
 */
export async function updatePreferences(
  userId: string,
  preferences: {
    cuisines: string[];
    budget_ranges: string[];
  }
): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabase
      .from('user_preferences')
      .upsert({
        user_id: userId,
        cuisines: preferences.cuisines,
        budget_ranges: preferences.budget_ranges,
      });

    if (error) {
      return { error: new Error(error.message) };
    }

    return { error: null };
  } catch (error) {
    console.error('Update preferences error:', error);
    return { error: error as Error };
  }
}

/**
 * Delete user account (soft delete)
 */
export async function deleteAccount(userId: string): Promise<{
  error: Error | null;
}> {
  try {
    // Soft delete by setting deleted_at timestamp
    const { error } = await supabase
      .from('users')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', userId);

    if (error) {
      return { error: new Error(error.message) };
    }

    // Sign out the user
    await supabase.auth.signOut();

    return { error: null };
  } catch (error) {
    console.error('Delete account error:', error);
    return { error: error as Error };
  }
}
