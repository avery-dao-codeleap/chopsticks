import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { Match, User } from '@/types';

interface MatchesState {
  matches: Match[];
  pendingMatches: Match[];
  activeMatch: Match | null;
  isLoading: boolean;

  // Actions
  fetchMatches: () => Promise<void>;
  sendMatchRequest: (userId: string) => Promise<{ error: Error | null }>;
  acceptMatch: (matchId: string) => Promise<{ error: Error | null }>;
  declineMatch: (matchId: string) => Promise<{ error: Error | null }>;
  completeMatch: (matchId: string) => Promise<{ error: Error | null }>;
  setActiveMatch: (match: Match | null) => void;
}

export const useMatchesStore = create<MatchesState>((set, get) => ({
  matches: [],
  pendingMatches: [],
  activeMatch: null,
  isLoading: false,

  fetchMatches: async () => {
    set({ isLoading: true });

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      set({ isLoading: false });
      return;
    }

    // Fetch all matches where user is involved
    const { data: matchesData, error } = await supabase
      .from('matches')
      .select(`
        *,
        user_1:users!matches_user_1_id_fkey(*),
        user_2:users!matches_user_2_id_fkey(*)
      `)
      .or(`user_1_id.eq.${user.id},user_2_id.eq.${user.id}`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching matches:', error);
      set({ isLoading: false });
      return;
    }

    const transformedMatches: Match[] = (matchesData || []).map((match: any) => {
      const otherUserData = match.user_1_id === user.id ? match.user_2 : match.user_1;
      return {
        id: match.id,
        user1Id: match.user_1_id,
        user2Id: match.user_2_id,
        status: match.status,
        restaurantId: match.restaurant_id,
        scheduledTime: match.scheduled_time,
        expiresAt: match.expires_at,
        otherUser: otherUserData ? {
          id: otherUserData.id,
          email: otherUserData.email,
          phone: otherUserData.phone,
          name: otherUserData.name,
          age: otherUserData.age,
          bio: otherUserData.bio,
          profileImageUrl: otherUserData.profile_image_url,
          verificationStatus: otherUserData.verification_status,
          mealCount: otherUserData.meal_count,
        } : undefined,
      };
    });

    set({
      matches: transformedMatches.filter(m => m.status === 'accepted'),
      pendingMatches: transformedMatches.filter(m => m.status === 'pending'),
      isLoading: false,
    });
  },

  sendMatchRequest: async (userId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: new Error('Not authenticated') };

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24 hour expiry

    const { error } = await supabase.from('matches').insert({
      user_1_id: user.id,
      user_2_id: userId,
      status: 'pending',
      expires_at: expiresAt.toISOString(),
    });

    if (!error) {
      get().fetchMatches();
    }

    return { error: error as Error | null };
  },

  acceptMatch: async (matchId: string) => {
    const { error } = await supabase
      .from('matches')
      .update({ status: 'accepted' })
      .eq('id', matchId);

    if (!error) {
      get().fetchMatches();
    }

    return { error: error as Error | null };
  },

  declineMatch: async (matchId: string) => {
    const { error } = await supabase
      .from('matches')
      .update({ status: 'expired' })
      .eq('id', matchId);

    if (!error) {
      get().fetchMatches();
    }

    return { error: error as Error | null };
  },

  completeMatch: async (matchId: string) => {
    const { error } = await supabase
      .from('matches')
      .update({ status: 'completed' })
      .eq('id', matchId);

    if (!error) {
      get().fetchMatches();
    }

    return { error: error as Error | null };
  },

  setActiveMatch: (match: Match | null) => set({ activeMatch: match }),
}));
