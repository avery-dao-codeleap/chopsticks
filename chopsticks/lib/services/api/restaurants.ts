import { supabase } from '../supabase';

export interface RestaurantRow {
  id: string;
  name: string;
  address: string;
  district: string;
  city: string;
  cuisine_type: string;
  source: 'curated' | 'user_added';
  created_at: string;
}

export interface AddRestaurantInput {
  name: string;
  address: string;
  district: string;
  cuisine_type: string;
}

/**
 * List restaurants, optionally filtered by search query
 */
export async function listRestaurants(search?: string): Promise<{
  data: RestaurantRow[];
  error: Error | null;
}> {
  try {
    let query = supabase
      .from('restaurants')
      .select('*')
      .order('name', { ascending: true });

    if (search && search.trim()) {
      query = query.ilike('name', `%${search.trim()}%`);
    }

    const { data, error } = await query;

    if (error) {
      return { data: [], error: new Error(error.message) };
    }

    return { data: data ?? [], error: null };
  } catch (error) {
    console.error('List restaurants error:', error);
    return { data: [], error: error as Error };
  }
}

/**
 * Add a user-submitted restaurant
 */
export async function addRestaurant(input: AddRestaurantInput): Promise<{
  data: RestaurantRow | null;
  error: Error | null;
}> {
  try {
    const { data, error } = await supabase
      .from('restaurants')
      .insert({
        ...input,
        city: 'hcmc',
        source: 'user_added',
      })
      .select()
      .single();

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Add restaurant error:', error);
    return { data: null, error: error as Error };
  }
}
