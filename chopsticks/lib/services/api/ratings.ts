import { supabase } from '../supabase';

export type PendingRating = {
  request_id: string;
  rated_id: string;
  rated_name: string | null;
  rated_photo_url: string | null;
  restaurant_name: string;
  time_window: string;
};

export type RatingSubmission = {
  rated_id: string;
  request_id: string;
  showed_up: boolean;
};

/**
 * Get all pending ratings for the current user (owner only)
 * Returns joined participants from completed meals that haven't been rated yet
 * Only includes meals where the user is the creator (requester)
 */
export async function getPendingRatings(): Promise<{ data: PendingRating[] | null; error: Error | null }> {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { data: null, error: new Error('Not authenticated') };
    }

    // Get completed requests owned by this user
    const { data: ownedRequests, error: reqError } = await supabase
      .from('meal_requests')
      .select(`
        id,
        time_window,
        restaurants!inner(name)
      `)
      .eq('requester_id', user.id)
      .not('meal_completed_at', 'is', null);

    if (reqError) {
      console.error('Error fetching owned requests:', reqError);
      return { data: null, error: reqError };
    }

    if (!ownedRequests || ownedRequests.length === 0) {
      return { data: [], error: null };
    }

    const requestIds = ownedRequests.map(r => r.id);

    // Get all joined participants from these requests
    const { data: participants, error: participantsError } = await supabase
      .from('request_participants')
      .select(`
        request_id,
        user_id,
        users!inner(id, name, photo_url)
      `)
      .in('request_id', requestIds)
      .eq('status', 'joined');

    if (participantsError) {
      console.error('Error fetching participants:', participantsError);
      return { data: null, error: participantsError };
    }

    if (!participants || participants.length === 0) {
      return { data: [], error: null };
    }

    // Get existing ratings by this user for these requests
    const { data: existingRatings, error: ratingsError } = await supabase
      .from('person_ratings')
      .select('rated_id, request_id')
      .eq('rater_id', user.id)
      .in('request_id', requestIds);

    if (ratingsError) {
      console.error('Error fetching existing ratings:', ratingsError);
      return { data: null, error: ratingsError };
    }

    const ratedSet = new Set(
      existingRatings?.map(r => `${r.request_id}-${r.rated_id}`) || []
    );

    // Filter out already-rated participants
    const pendingRatings: PendingRating[] = participants
      .filter(p => !ratedSet.has(`${p.request_id}-${p.user_id}`))
      .map(p => {
        const req = ownedRequests.find(r => r.id === p.request_id);
        return {
          request_id: p.request_id,
          rated_id: p.user_id,
          rated_name: (p.users as any).name,
          rated_photo_url: (p.users as any).photo_url,
          restaurant_name: (req?.restaurants as any)?.name || 'Unknown',
          time_window: req?.time_window || '',
        };
      });

    return { data: pendingRatings, error: null };
  } catch (error) {
    console.error('Error in getPendingRatings:', error);
    return { data: null, error: error as Error };
  }
}

/**
 * Submit a rating for a participant
 * This will trigger the increment_meal_count trigger if showed_up = true
 */
export async function submitRating(submission: RatingSubmission): Promise<{ error: Error | null }> {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { error: new Error('Not authenticated') };
    }

    const { error } = await supabase
      .from('person_ratings')
      .insert({
        rater_id: user.id,
        rated_id: submission.rated_id,
        request_id: submission.request_id,
        showed_up: submission.showed_up,
      });

    if (error) {
      console.error('Error submitting rating:', error);
      return { error };
    }

    return { error: null };
  } catch (error) {
    console.error('Error in submitRating:', error);
    return { error: error as Error };
  }
}

/**
 * Submit multiple ratings at once (batch submission)
 */
export async function submitRatings(submissions: RatingSubmission[]): Promise<{ error: Error | null }> {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { error: new Error('Not authenticated') };
    }

    const ratings = submissions.map(s => ({
      rater_id: user.id,
      rated_id: s.rated_id,
      request_id: s.request_id,
      showed_up: s.showed_up,
    }));

    const { error } = await supabase
      .from('person_ratings')
      .insert(ratings);

    if (error) {
      console.error('Error submitting ratings:', error);
      return { error };
    }

    return { error: null };
  } catch (error) {
    console.error('Error in submitRatings:', error);
    return { error: error as Error };
  }
}
