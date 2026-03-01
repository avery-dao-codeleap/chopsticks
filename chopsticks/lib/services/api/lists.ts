import { supabase } from '../supabase';

// ============================================================
// Types
// ============================================================

export interface ListRow {
  id: string;
  type: 'curated' | 'personal';
  owner_id: string | null;
  title: string;
  description: string | null;
  emoji: string | null;
  category: string | null;
  city: string;
  is_published: boolean;
  created_at: string;
}

export interface ListRestaurantRow {
  id: string;
  list_id: string;
  restaurant_id: string;
  rank: number | null;
  created_at: string;
  restaurants: {
    id: string;
    name: string;
    address: string;
    district: string;
    cuisine_type: string;
  };
}

export interface UserVisitRow {
  id: string;
  user_id: string;
  restaurant_id: string;
  visited_at: string;
}

export interface RestaurantDetail {
  id: string;
  name: string;
  address: string;
  district: string;
  cuisine_type: string;
  city: string;
  source: string;
  stats: {
    meal_count: number;
    diner_count: number;
    avg_rating: number | null;
  };
  active_requests: ActiveRequestRow[];
  curated_list_memberships: { list_id: string; list_title: string; rank: number | null }[];
  user_list_memberships: { list_id: string; list_title: string; emoji: string | null }[];
  user_has_visited: boolean;
}

export interface ActiveRequestRow {
  id: string;
  time_window: string;
  group_size: number;
  join_type: 'open' | 'approval';
  participant_count: number;
  requester: { id: string; name: string | null };
}

export interface CreateListInput {
  title: string;
  emoji: string;
}

// ============================================================
// Curated Lists
// ============================================================

export async function getCuratedLists(): Promise<{ data: ListRow[]; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('lists')
      .select('*')
      .eq('type', 'curated')
      .eq('is_published', true)
      .order('created_at', { ascending: true });
    if (error) return { data: [], error: new Error(error.message) };
    return { data: data ?? [], error: null };
  } catch (err) {
    console.error('getCuratedLists error:', err);
    return { data: [], error: err as Error };
  }
}

// ============================================================
// Personal Lists
// ============================================================

export async function getUserLists(userId: string): Promise<{ data: ListRow[]; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('lists')
      .select('*')
      .eq('type', 'personal')
      .eq('owner_id', userId)
      .order('created_at', { ascending: true });
    if (error) return { data: [], error: new Error(error.message) };
    return { data: data ?? [], error: null };
  } catch (err) {
    console.error('getUserLists error:', err);
    return { data: [], error: err as Error };
  }
}

export async function createList(
  userId: string,
  input: CreateListInput,
): Promise<{ data: ListRow | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('lists')
      .insert({ type: 'personal', owner_id: userId, title: input.title, emoji: input.emoji, city: 'hcmc' })
      .select()
      .single();
    if (error) return { data: null, error: new Error(error.message) };
    return { data, error: null };
  } catch (err) {
    console.error('createList error:', err);
    return { data: null, error: err as Error };
  }
}

export async function deleteList(listId: string): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabase.from('lists').delete().eq('id', listId);
    if (error) return { error: new Error(error.message) };
    return { error: null };
  } catch (err) {
    console.error('deleteList error:', err);
    return { error: err as Error };
  }
}

// ============================================================
// List Restaurants
// ============================================================

export async function getListRestaurants(
  listId: string,
): Promise<{ data: ListRestaurantRow[]; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('list_restaurants')
      .select('*, restaurants(id, name, address, district, cuisine_type)')
      .eq('list_id', listId)
      .order('rank', { ascending: true, nullsFirst: false });
    if (error) return { data: [], error: new Error(error.message) };
    return { data: data ?? [], error: null };
  } catch (err) {
    console.error('getListRestaurants error:', err);
    return { data: [], error: err as Error };
  }
}

export async function addToList(
  listId: string,
  restaurantId: string,
): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabase
      .from('list_restaurants')
      .upsert({ list_id: listId, restaurant_id: restaurantId }, { onConflict: 'list_id,restaurant_id' });
    if (error) return { error: new Error(error.message) };
    return { error: null };
  } catch (err) {
    console.error('addToList error:', err);
    return { error: err as Error };
  }
}

export async function removeFromList(
  listId: string,
  restaurantId: string,
): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabase
      .from('list_restaurants')
      .delete()
      .eq('list_id', listId)
      .eq('restaurant_id', restaurantId);
    if (error) return { error: new Error(error.message) };
    return { error: null };
  } catch (err) {
    console.error('removeFromList error:', err);
    return { error: err as Error };
  }
}

// ============================================================
// User Visits ("Been There")
// ============================================================

export async function getUserVisits(
  userId: string,
): Promise<{ data: UserVisitRow[]; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('user_visits')
      .select('*')
      .eq('user_id', userId);
    if (error) return { data: [], error: new Error(error.message) };
    return { data: data ?? [], error: null };
  } catch (err) {
    console.error('getUserVisits error:', err);
    return { data: [], error: err as Error };
  }
}

export async function toggleVisit(
  userId: string,
  restaurantId: string,
  currentlyVisited: boolean,
): Promise<{ error: Error | null }> {
  try {
    if (currentlyVisited) {
      const { error } = await supabase
        .from('user_visits')
        .delete()
        .eq('user_id', userId)
        .eq('restaurant_id', restaurantId);
      if (error) return { error: new Error(error.message) };
    } else {
      const { error } = await supabase
        .from('user_visits')
        .upsert({ user_id: userId, restaurant_id: restaurantId }, { onConflict: 'user_id,restaurant_id' });
      if (error) return { error: new Error(error.message) };
    }
    return { error: null };
  } catch (err) {
    console.error('toggleVisit error:', err);
    return { error: err as Error };
  }
}

// ============================================================
// Restaurant Detail (hub screen)
// ============================================================

export async function getRestaurantDetail(
  restaurantId: string,
  userId: string | null,
): Promise<{ data: RestaurantDetail | null; error: Error | null }> {
  try {
    // 1. Base restaurant row
    const { data: restaurant, error: rErr } = await supabase
      .from('restaurants')
      .select('*')
      .eq('id', restaurantId)
      .single();
    if (rErr || !restaurant) return { data: null, error: new Error(rErr?.message ?? 'Not found') };

    // 2. Completed meal count + unique diner count
    const { data: completedRequests } = await supabase
      .from('meal_requests')
      .select('id')
      .eq('restaurant_id', restaurantId)
      .eq('status', 'completed');
    const requestIds = (completedRequests ?? []).map((r: { id: string }) => r.id);

    let mealCount = requestIds.length;
    let dinerCount = 0;
    let avgRating: number | null = null;

    if (requestIds.length > 0) {
      const { count } = await supabase
        .from('request_participants')
        .select('*', { count: 'exact', head: true })
        .in('request_id', requestIds)
        .eq('status', 'joined');
      dinerCount = count ?? 0;

      const { data: ratingsData } = await supabase
        .from('ratings')
        .select('score')
        .in('request_id', requestIds);
      if (ratingsData && ratingsData.length > 0) {
        const sum = ratingsData.reduce((acc: number, r: { score: number }) => acc + r.score, 0);
        avgRating = Math.round((sum / ratingsData.length) * 10) / 10;
      }
    }

    // 3. Active requests at this restaurant
    const { data: activeReqs } = await supabase
      .from('meal_requests')
      .select(`
        id, time_window, group_size, join_type,
        users!meal_requests_requester_id_fkey(id, name)
      `)
      .eq('restaurant_id', restaurantId)
      .eq('status', 'active')
      .order('time_window', { ascending: true })
      .limit(3);

    const active_requests: ActiveRequestRow[] = await Promise.all(
      ((activeReqs ?? []) as unknown as { id: string; time_window: string; group_size: number; join_type: 'open' | 'approval'; users: { id: string; name: string | null } }[]).map(async (req) => {
        const { count } = await supabase
          .from('request_participants')
          .select('*', { count: 'exact', head: true })
          .eq('request_id', req.id)
          .eq('status', 'joined');
        return {
          id: req.id,
          time_window: req.time_window,
          group_size: req.group_size,
          join_type: req.join_type,
          participant_count: count ?? 0,
          requester: { id: req.users.id, name: req.users.name },
        };
      }),
    );

    // 4. Curated list memberships
    const { data: curatedMemberships } = await supabase
      .from('list_restaurants')
      .select('rank, lists!inner(id, title, type, is_published)')
      .eq('restaurant_id', restaurantId)
      .eq('lists.type', 'curated')
      .eq('lists.is_published', true);

    const curated_list_memberships = ((curatedMemberships ?? []) as unknown as { rank: number | null; lists: { id: string; title: string } }[]).map((m) => ({
      list_id: m.lists.id,
      list_title: m.lists.title,
      rank: m.rank,
    }));

    // 5. User's personal list memberships
    let user_list_memberships: { list_id: string; list_title: string; emoji: string | null }[] = [];
    if (userId) {
      const { data: personalMemberships } = await supabase
        .from('list_restaurants')
        .select('lists!inner(id, title, emoji, owner_id, type)')
        .eq('restaurant_id', restaurantId)
        .eq('lists.type', 'personal')
        .eq('lists.owner_id', userId);

      user_list_memberships = ((personalMemberships ?? []) as unknown as { lists: { id: string; title: string; emoji: string | null } }[]).map((m) => ({
        list_id: m.lists.id,
        list_title: m.lists.title,
        emoji: m.lists.emoji,
      }));
    }

    // 6. Has user visited?
    let user_has_visited = false;
    if (userId) {
      const { data: visit } = await supabase
        .from('user_visits')
        .select('id')
        .eq('user_id', userId)
        .eq('restaurant_id', restaurantId)
        .maybeSingle();
      user_has_visited = !!visit;
    }

    return {
      data: {
        ...restaurant,
        stats: { meal_count: mealCount, diner_count: dinerCount, avg_rating: avgRating },
        active_requests,
        curated_list_memberships,
        user_list_memberships,
        user_has_visited,
      },
      error: null,
    };
  } catch (err) {
    console.error('getRestaurantDetail error:', err);
    return { data: null, error: err as Error };
  }
}

// ============================================================
// Search
// ============================================================

export async function searchRestaurants(
  query: string,
): Promise<{ data: { id: string; name: string; district: string; cuisine_type: string }[]; error: Error | null }> {
  try {
    if (!query.trim()) return { data: [], error: null };
    const { data, error } = await supabase
      .from('restaurants')
      .select('id, name, district, cuisine_type')
      .ilike('name', `%${query.trim()}%`)
      .limit(20);
    if (error) return { data: [], error: new Error(error.message) };
    return { data: data ?? [], error: null };
  } catch (err) {
    console.error('searchRestaurants error:', err);
    return { data: [], error: err as Error };
  }
}
