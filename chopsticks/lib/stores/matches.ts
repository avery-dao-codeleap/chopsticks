import { create } from 'zustand';
import { Match } from '@/lib/types';;

interface MatchesState {
  matches: Match[];
  pendingMatches: Match[];
  activeMatch: Match | null;
  isLoading: boolean;

  fetchMatches: () => Promise<void>;
  sendMatchRequest: (userId: string) => Promise<{ error: Error | null }>;
  acceptMatch: (matchId: string) => Promise<{ error: Error | null }>;
  declineMatch: (matchId: string) => Promise<{ error: Error | null }>;
  completeMatch: (matchId: string) => Promise<{ error: Error | null }>;
  setActiveMatch: (match: Match | null) => void;
}

export const useMatchesStore = create<MatchesState>((set, _get) => ({
  matches: [],
  pendingMatches: [],
  activeMatch: null,
  isLoading: false,

  fetchMatches: async () => {
    // Mock: no-op
    set({ isLoading: false });
  },

  sendMatchRequest: async (_userId: string) => {
    return { error: null };
  },

  acceptMatch: async (_matchId: string) => {
    return { error: null };
  },

  declineMatch: async (_matchId: string) => {
    return { error: null };
  },

  completeMatch: async (_matchId: string) => {
    return { error: null };
  },

  setActiveMatch: (match: Match | null) => set({ activeMatch: match }),
}));
