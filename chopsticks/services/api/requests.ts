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

    if (requestIds.length > 0) {
      const { data: participants } = await supabase
        .from('request_participants')
        .select('request_id')
        .in('request_id', requestIds)
        .eq('status', 'joined');

      if (participants) {
        for (const p of participants) {
          participantCounts[p.request_id] = (participantCounts[p.request_id] ?? 0) + 1;
        }
      }
    }

    const enriched = (data ?? []).map(r => ({
      ...r,
      participant_count: participantCounts[r.id] ?? 0,
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

    // Get participant count
    const { count } = await supabase
      .from('request_participants')
      .select('*', { count: 'exact', head: true })
      .eq('request_id', requestId)
      .eq('status', 'joined');

    return {
      data: { ...data, participant_count: count ?? 0 } as MealRequestWithDetails,
      error: null,
    };
  } catch (error) {
    console.error('Get request error:', error);
    return { data: null, error: error as Error };
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
 * Get pending participants for a request (approval-type only)
 */
export async function getPendingParticipants(requestId: string): Promise<{
  data: Array<{
    id: string;
    user_id: string;
    status: string;
    created_at: string;
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
        created_at,
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
      .order('created_at', { ascending: true });

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
 * Also adds them to the chat
 */
export async function approveParticipant(
  participantId: string,
  requestId: string
): Promise<{ error: Error | null }> {
  try {
    // Update participant status to 'joined'
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

    // Get the user_id from the participant
    const { data: participant } = await supabase
      .from('request_participants')
      .select('user_id')
      .eq('id', participantId)
      .single();

    if (!participant) {
      return { error: new Error('Participant not found') };
    }

    // Get or create chat for this request
    let { data: chat } = await supabase
      .from('chats')
      .select('id')
      .eq('request_id', requestId)
      .single();

    // If chat doesn't exist, create it
    if (!chat) {
      const { data: newChat, error: chatError } = await supabase
        .from('chats')
        .insert({ request_id: requestId })
        .select()
        .single();

      if (chatError) {
        console.error('Error creating chat:', chatError);
        return { error: new Error(chatError.message) };
      }

      chat = newChat;
    }

    // Add user to chat_participants
    const { error: chatParticipantError } = await supabase
      .from('chat_participants')
      .insert({
        chat_id: chat.id,
        user_id: participant.user_id,
      });

    if (chatParticipantError) {
      console.error('Error adding to chat:', chatParticipantError);
      // Don't return error - approval succeeded even if chat join failed
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
