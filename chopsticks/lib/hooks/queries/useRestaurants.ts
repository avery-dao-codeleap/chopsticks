import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as restaurantsApi from '@/lib/services/api/restaurants';
import type { AddRestaurantInput } from '@/lib/services/api/restaurants';

/**
 * Hook for listing restaurants with optional search
 */
export function useRestaurants(search?: string) {
  return useQuery({
    queryKey: ['restaurants', search ?? ''],
    queryFn: async () => {
      const { data, error } = await restaurantsApi.listRestaurants(search);
      if (error) throw error;
      return data;
    },
  });
}

/**
 * Hook for adding a user-submitted restaurant
 */
export function useAddRestaurant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: AddRestaurantInput) => {
      const { data, error } = await restaurantsApi.addRestaurant(input);
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurants'] });
    },
  });
}
