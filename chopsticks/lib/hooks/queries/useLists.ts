import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as listsApi from '@/lib/services/api/lists';
import type { CreateListInput } from '@/lib/services/api/lists';
import { useAuthStore } from '@/lib/stores/auth';

// ── Curated Lists ────────────────────────────────────────────
export function useCuratedLists() {
  return useQuery({
    queryKey: ['curated-lists'],
    queryFn: async () => {
      const { data, error } = await listsApi.getCuratedLists();
      if (error) throw error;
      return data;
    },
  });
}

// ── User Personal Lists ──────────────────────────────────────
export function useUserLists() {
  const session = useAuthStore(state => state.session);
  const userId = session?.user?.id ?? '';
  return useQuery({
    queryKey: ['user-lists', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await listsApi.getUserLists(userId);
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
}

export function useCreateList() {
  const qc = useQueryClient();
  const session = useAuthStore(state => state.session);
  return useMutation({
    mutationFn: async (input: CreateListInput) => {
      const userId = session?.user?.id;
      if (!userId) throw new Error('Not authenticated');
      const { data, error } = await listsApi.createList(userId, input);
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['user-lists'] });
    },
  });
}

export function useDeleteList() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (listId: string) => {
      const { error } = await listsApi.deleteList(listId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['user-lists'] });
    },
  });
}

// ── List Restaurants ─────────────────────────────────────────
export function useListRestaurants(listId: string | undefined) {
  return useQuery({
    queryKey: ['list-restaurants', listId],
    queryFn: async () => {
      if (!listId) return [];
      const { data, error } = await listsApi.getListRestaurants(listId);
      if (error) throw error;
      return data;
    },
    enabled: !!listId,
  });
}

export function useAddToList() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ listId, restaurantId }: { listId: string; restaurantId: string }) => {
      const { error } = await listsApi.addToList(listId, restaurantId);
      if (error) throw error;
    },
    onSuccess: (_data, { listId }) => {
      qc.invalidateQueries({ queryKey: ['list-restaurants', listId] });
    },
  });
}

export function useRemoveFromList() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ listId, restaurantId }: { listId: string; restaurantId: string }) => {
      const { error } = await listsApi.removeFromList(listId, restaurantId);
      if (error) throw error;
    },
    onSuccess: (_data, { listId }) => {
      qc.invalidateQueries({ queryKey: ['list-restaurants', listId] });
    },
  });
}

// ── User Visits ("Been There") ───────────────────────────────
export function useUserVisits() {
  const session = useAuthStore(state => state.session);
  const userId = session?.user?.id ?? '';
  return useQuery({
    queryKey: ['user-visits', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await listsApi.getUserVisits(userId);
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
}

export function useToggleVisit() {
  const qc = useQueryClient();
  const session = useAuthStore(state => state.session);
  return useMutation({
    mutationFn: async ({ restaurantId, currentlyVisited }: { restaurantId: string; currentlyVisited: boolean }) => {
      const userId = session?.user?.id;
      if (!userId) throw new Error('Not authenticated');
      const { error } = await listsApi.toggleVisit(userId, restaurantId, currentlyVisited);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['user-visits'] });
      qc.invalidateQueries({ queryKey: ['restaurant-detail'] });
    },
  });
}

// ── Restaurant Detail ────────────────────────────────────────
export function useRestaurantDetail(restaurantId: string | undefined) {
  const session = useAuthStore(state => state.session);
  const userId = session?.user?.id ?? null;
  return useQuery({
    queryKey: ['restaurant-detail', restaurantId, userId],
    queryFn: async () => {
      if (!restaurantId) return null;
      const { data, error } = await listsApi.getRestaurantDetail(restaurantId, userId);
      if (error) throw error;
      return data;
    },
    enabled: !!restaurantId,
  });
}

// ── Search ───────────────────────────────────────────────────
export function useSearchRestaurants(query: string) {
  return useQuery({
    queryKey: ['search-restaurants', query],
    queryFn: async () => {
      const { data, error } = await listsApi.searchRestaurants(query);
      if (error) throw error;
      return data;
    },
    enabled: query.trim().length > 1,
  });
}
