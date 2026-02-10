import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPendingRatings, submitRating, submitRatings, PendingRating, RatingSubmission } from '@/services/api/ratings';

/**
 * Hook to fetch pending ratings (participants to rate from past meals)
 */
export function usePendingRatings() {
  return useQuery({
    queryKey: ['ratings', 'pending'],
    queryFn: async () => {
      const { data, error } = await getPendingRatings();
      if (error) throw error;
      return data || [];
    },
    staleTime: 1000 * 60, // 1 minute
  });
}

/**
 * Hook to submit a single rating
 */
export function useSubmitRating() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (submission: RatingSubmission) => {
      const { error } = await submitRating(submission);
      if (error) throw error;
    },
    onSuccess: () => {
      // Invalidate pending ratings to refetch
      queryClient.invalidateQueries({ queryKey: ['ratings', 'pending'] });
      // Invalidate user data to reflect updated meal_count
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
}

/**
 * Hook to submit multiple ratings at once
 */
export function useSubmitRatings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (submissions: RatingSubmission[]) => {
      const { error } = await submitRatings(submissions);
      if (error) throw error;
    },
    onSuccess: () => {
      // Invalidate pending ratings to refetch
      queryClient.invalidateQueries({ queryKey: ['ratings', 'pending'] });
      // Invalidate user data to reflect updated meal_count
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
}
