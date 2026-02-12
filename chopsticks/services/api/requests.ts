import { supabase } from '../supabase';

export interface CreateRequestInput {
  requester_id: string;
  restaurant_id: string;
  cuisine: string;
  budget_range: string;
  time_window: string;
  group_size: number;
  join_type: 'open' | 'approval';
  description?: string;
}

export interface MealRequestRow {
  id: string;
  requester_id: string;
  restaurant_id: string;
  cuisine: string;
  budget_range: string;
  time_window: string;
  group_size: number;
  join_type: 'open' | 'approval';
  description: string | null;
  created_at: string;
}

/** Meal request with joined restaurant and requester info */
export interface MealRequestWithDetails extends MealRequestRow {
  restaurants: {
    name: string;
    address: string;
    district: string;
    cuisine_type: string;
  };
  users: {
    id: string;
    name: string | null;
    age: number | null;
    persona: string | null;
    photo_url: string | null;
    meal_count: number;
    bio: string | null;
  };
  participant_count: number;
  pending_count: number;
}

/**
 * Create a new meal request
 */
export async function createRequest(input: CreateRequestInput): Promise<{
  data: MealRequestRow | null;
  error: Error | null;
}> {
  try {
    const { data, error } = await supabase
      .from('meal_requests')
      .insert(input)
      .select()
      .single();

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Create request error:', error);
    return { data: null, error: error as Error };
  }
}

/**
 * List active meal requests with restaurant + requester info
 */
export async function listRequests(filters?: {
  district?: string;
  cuisine?: string;
  budget_range?: string;
}): Promise<{
  data: MealRequestWithDetails[];
  error: Error | null;
}> {
  try {
    let query = supabase
      .from('meal_requests')
      .select(`
        *,
        restaurants!inner(name, address, district, cuisine_type),
        users!meal_requests_requester_id_fkey(id, name, age, persona, photo_url, meal_count, bio)
      `)
      .gt('time_window', new Date().toISOString())
      .order('time_window', { ascending: true });

    if (filters?.district) {
      query = query.eq('restaurants.district', filters.district);
    }
    if (filters?.cuisine) {
      query = query.eq('cuisine', filters.cuisine);
    }
    if (filters?.budget_range) {
      query = query.eq('budget_range', filters.budget_range);
    }

    const { data, error } = await query;

    if (error) {
      return { data: [], error: new Error(error.message) };
    }

    // Fetch participant counts for each request
    const requestIds = (data ?? []).map(r => r.id);
    let participantCounts: Record<string, number> = {};
    let pendingCounts: Record<string, number> = {};

    if (requestIds.length > 0) {
      // Fetch joined participants
      const { data: joinedParticipants } = await supabase
        .from('request_participants')
        .select('request_id')
        .in('request_id', requestIds)
        .eq('status', 'joined');

      if (joinedParticipants) {
        for (const p of joinedParticipants) {
          participantCounts[p.request_id] = (participantCounts[p.request_id] ?? 0) + 1;
        }
      }

      // Fetch pending participants
      const { data: pendingParticipants } = await supabase
        .from('request_participants')
        .select('request_id')
        .in('request_id', requestIds)
        .eq('status', 'pending');

      if (pendingParticipants) {
        for (const p of pendingParticipants) {
          pendingCounts[p.request_id] = (pendingCounts[p.request_id] ?? 0) + 1;
        }
      }
    }

    const enriched = (data ?? []).map(r => ({
      ...r,
      participant_count: participantCounts[r.id] ?? 0,
      pending_count: pendingCounts[r.id] ?? 0,
    }));

    return { data: enriched as MealRequestWithDetails[], error: null };
  } catch (error) {
    console.error('List requests error:', error);
    return { data: [], error: error as Error };
  }
}

/**
 * Get a single meal request by ID with full details
 */
export async function getRequest(requestId: string): Promise<{
  data: MealRequestWithDetails | null;
  error: Error | null;
}> {
  try {
    const { data, error } = await supabase
      .from('meal_requests')
      .select(`
        *,
        restaurants!inner(name, address, district, cuisine_type),
        users!meal_requests_requester_id_fkey(id, name, age, persona, photo_url, meal_count, bio)
      `)
      .eq('id', requestId)
      .single();

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    // Get participant count (joined)
    const { count: joinedCount } = await supabase
      .from('request_participants')
      .select('*', { count: 'exact', head: true })
      .eq('request_id', requestId)
      .eq('status', 'joined');

    // Get pending participant count
    const { count: pendingCount } = await supabase
      .from('request_participants')
      .select('*', { count: 'exact', head: true })
      .eq('request_id', requestId)
      .eq('status', 'pending');

    // Check current user's participation status
    const { data: { user } } = await supabase.auth.getUser();
    let userStatus = 'none';
    if (user) {
      const { data: participation } = await supabase
        .from('request_participants')
        .select('status')
        .eq('request_id', requestId)
        .eq('user_id', user.id)
        .maybeSingle();
      userStatus = participation?.status || 'none';
    }

    return {
      data: {
        ...data,
        participant_count: joinedCount ?? 0,
        pending_count: pendingCount ?? 0,
        user_status: userStatus,
      } as MealRequestWithDetails & { user_status: string },
      error: null,
    };
  } catch (error) {
    console.error('Get request error:', error);
    return { data: null, error: error as Error };
  }
}

/**
 * Get requests the current user has joined or requested to join
 */
export async function getMyParticipations(): Promise<{
  data: (MealRequestWithDetails & { user_status: string })[];
  error: Error | null;
}> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { data: [], error: new Error('Not authenticated') };
    }

    // Get request IDs where user is a participant
    const { data: participations, error: partError } = await supabase
      .from('request_participants')
      .select('request_id, status')
      .eq('user_id', user.id)
      .in('status', ['pending', 'joined']);

    if (partError) {
      return { data: [], error: new Error(partError.message) };
    }

    if (!participations || participations.length === 0) {
      return { data: [], error: null };
    }

    const requestIds = participations.map(p => p.request_id);

    // Fetch the actual requests
    const { data, error } = await supabase
      .from('meal_requests')
      .select(`
        *,
        restaurants!inner(name, address, district, cuisine_type),
        users!meal_requests_requester_id_fkey(id, name, age, persona, photo_url, meal_count, bio)
      `)
      .in('id', requestIds)
      .order('time_window', { ascending: true });

    if (error) {
      return { data: [], error: new Error(error.message) };
    }

    // Enrich with participant counts and user's status
    const enriched = (data ?? []).map(r => {
      const participation = participations.find(p => p.request_id === r.id);
      return {
        ...r,
        participant_count: 0,
        pending_count: 0,
        user_status: participation?.status || 'none',
      };
    });

    return { data: enriched, error: null };
  } catch (error) {
    console.error('Get my participations error:', error);
    return { data: [], error: error as Error };
  }
}

/**
 * Check if user has already joined or requested to join a specific request
 */
export async function checkUserParticipation(
  requestId: string,
  userId: string
): Promise<{ status: 'none' | 'pending' | 'joined' | 'rejected'; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('request_participants')
      .select('status')
      .eq('request_id', requestId)
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      return { status: 'none', error: new Error(error.message) };
    }

    return { status: data?.status || 'none', error: null };
  } catch (error) {
    console.error('Check user participation error:', error);
    return { status: 'none', error: error as Error };
  }
}

/**
 * Join a meal request. For 'open' type, status is 'joined'. For 'approval', status is 'pending'.
 */
export async function joinRequest(
  requestId: string,
  userId: string,
  joinType: 'open' | 'approval'
): Promise<{ error: Error | null }> {
  try {
    const status = joinType === 'open' ? 'joined' : 'pending';

    const { error } = await supabase
      .from('request_participants')
      .insert({
        request_id: requestId,
        user_id: userId,
        status,
      });

    if (error) {
      return { error: new Error(error.message) };
    }

    return { error: null };
  } catch (error) {
    console.error('Join request error:', error);
    return { error: error as Error };
  }
}

/**
 * Cancel (delete) a meal request — only the creator can do this via RLS
 */
export async function cancelRequest(requestId: string): Promise<{
  error: Error | null;
}> {
  try {
    const { error } = await supabase
      .from('meal_requests')
      .delete()
      .eq('id', requestId);

    if (error) {
      return { error: new Error(error.message) };
    }

    return { error: null };
  } catch (error) {
    console.error('Cancel request error:', error);
    return { error: error as Error };
  }
}

/**
 * Cancel a join request (for users who requested to join but are still pending)
 */
export async function cancelJoinRequest(requestId: string): Promise<{
  error: Error | null;
}> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { error: new Error('Not authenticated') };
    }

    const { error } = await supabase
      .from('request_participants')
      .delete()
      .eq('request_id', requestId)
      .eq('user_id', user.id)
      .eq('status', 'pending');

    if (error) {
      return { error: new Error(error.message) };
    }

    return { error: null };
  } catch (error) {
    console.error('Cancel join request error:', error);
    return { error: error as Error };
  }
}

/**
 * Get pending participants for a request (approval-type only)
 */
export async function getPendingParticipants(requestId: string): Promise<{
  data: Array<{
    id: string;
    user_id: string;
    status: string;
    joined_at: string;
    users: {
      id: string;
      name: string | null;
      age: number | null;
      gender: string | null;
      persona: string | null;
      photo_url: string | null;
      meal_count: number;
      bio: string | null;
    };
  }>;
  error: Error | null;
}> {
  try {
    const { data, error } = await supabase
      .from('request_participants')
      .select(`
        id,
        user_id,
        status,
        joined_at,
        users!request_participants_user_id_fkey(
          id,
          name,
          age,
          gender,
          persona,
          photo_url,
          meal_count,
          bio
        )
      `)
      .eq('request_id', requestId)
      .eq('status', 'pending')
      .order('joined_at', { ascending: true });

    if (error) {
      return { data: [], error: new Error(error.message) };
    }

    return { data: data ?? [], error: null };
  } catch (error) {
    console.error('Get pending participants error:', error);
    return { data: [], error: error as Error };
  }
}

/**
 * Approve a participant (change status from 'pending' to 'joined')
 * Chat participant is added automatically by database trigger
 */
export async function approveParticipant(
  participantId: string,
  requestId: string
): Promise<{ error: Error | null }> {
  try {
    // Update participant status to 'joined'
    // The auto_create_chat_for_request trigger will automatically:
    // 1. Create chat if it doesn't exist
    // 2. Add requester to chat_participants
    // 3. Add this participant to chat_participants
    const { error: updateError } = await supabase
      .from('request_participants')
      .update({
        status: 'joined',
        joined_at: new Date().toISOString(),
      })
      .eq('id', participantId);

    if (updateError) {
      return { error: new Error(updateError.message) };
    }

    return { error: null };
  } catch (error) {
    console.error('Approve participant error:', error);
    return { error: error as Error };
  }
}

/**
 * Reject a participant (change status from 'pending' to 'rejected')
 */
export async function rejectParticipant(
  participantId: string
): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabase
      .from('request_participants')
      .update({ status: 'rejected' })
      .eq('id', participantId);

    if (error) {
      return { error: new Error(error.message) };
    }

    return { error: null };
  } catch (error) {
    console.error('Reject participant error:', error);
    return { error: error as Error };
  }
}
