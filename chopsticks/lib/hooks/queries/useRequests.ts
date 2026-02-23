import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as requestsApi from '@/lib/services/api/requests';
import type { CreateRequestInput } from '@/lib/services/api/requests';

/**
 * Hook for listing active meal requests with optional filters
 */
export function useRequests(filters?: {
  district?: string;
  cuisine?: string;
  budget_range?: string;
}) {
  return useQuery({
    queryKey: ['requests', filters?.district, filters?.cuisine, filters?.budget_range],
    queryFn: async () => {
      const { data, error } = await requestsApi.listRequests(filters);
      if (error) throw error;
      return data;
    },
    refetchInterval: 2000, // Auto-refresh every 2 seconds for faster sync
  });
}

/**
 * Hook for fetching requests the user has joined or requested to join
 */
export function useMyParticipations() {
  return useQuery({
    queryKey: ['my-participations'],
    queryFn: async () => {
      const { data, error } = await requestsApi.getMyParticipations();
      if (error) throw error;
      return data;
    },
    refetchInterval: 2000, // Auto-refresh every 2 seconds for faster sync
  });
}

/**
 * Hook for fetching a single meal request by ID
 */
export function useRequest(requestId: string | undefined) {
  return useQuery({
    queryKey: ['request', requestId],
    queryFn: async () => {
      if (!requestId) return null;
      const { data, error } = await requestsApi.getRequest(requestId);
      if (error) throw error;
      return data;
    },
    enabled: !!requestId,
    refetchInterval: 2000, // Auto-refresh every 2 seconds for faster sync
  });
}

/**
 * Hook for creating a new meal request
 */
export function useCreateRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateRequestInput) => {
      const { data, error } = await requestsApi.createRequest(input);
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requests'] });
    },
  });
}

/**
 * Hook for joining a meal request
 */
export function useJoinRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: { requestId: string; userId: string; joinType: 'open' | 'approval' }) => {
      const { error } = await requestsApi.joinRequest(input.requestId, input.userId, input.joinType);
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['requests'] });
      queryClient.invalidateQueries({ queryKey: ['request', variables.requestId] });
    },
  });
}

/**
 * Hook for cancelling a meal request
 */
export function useCancelRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (requestId: string) => {
      const { error } = await requestsApi.cancelRequest(requestId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requests'] });
    },
  });
}

/**
 * Hook for cancelling a join request (when user is pending)
 */
export function useCancelJoinRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (requestId: string) => {
      const { error } = await requestsApi.cancelJoinRequest(requestId);
      if (error) throw error;
    },
    onSuccess: (_, requestId) => {
      queryClient.invalidateQueries({ queryKey: ['request', requestId] });
      queryClient.invalidateQueries({ queryKey: ['requests'] });
      queryClient.invalidateQueries({ queryKey: ['my-participations'] });
    },
  });
}

/**
 * Hook for fetching pending participants for a request
 */
export function usePendingParticipants(requestId: string | undefined) {
  return useQuery({
    queryKey: ['pending-participants', requestId],
    queryFn: async () => {
      if (!requestId) return [];
      const { data, error } = await requestsApi.getPendingParticipants(requestId);
      if (error) throw error;
      return data;
    },
    enabled: !!requestId,
    refetchInterval: 2000, // Auto-refresh every 2 seconds for faster sync
  });
}

/**
 * Hook for approving a participant
 */
export function useApproveParticipant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      participantId,
      requestId,
    }: {
      participantId: string;
      requestId: string;
    }) => {
      const { error } = await requestsApi.approveParticipant(participantId, requestId);
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      // Optimistically decrement pending_count in cache
      queryClient.setQueryData(['request', variables.requestId], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          pending_count: Math.max(0, (old.pending_count ?? 0) - 1),
        };
      });

      // Then invalidate to ensure data consistency
      queryClient.invalidateQueries({ queryKey: ['pending-participants', variables.requestId] });
      queryClient.invalidateQueries({ queryKey: ['request', variables.requestId] });
      queryClient.invalidateQueries({ queryKey: ['requests'] });
      queryClient.invalidateQueries({ queryKey: ['chats'] });
      queryClient.invalidateQueries({ queryKey: ['my-participations'] });
    },
  });
}

/**
 * Hook for rejecting a participant
 */
export function useRejectParticipant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      participantId,
      requestId,
    }: {
      participantId: string;
      requestId: string;
    }) => {
      const { error } = await requestsApi.rejectParticipant(participantId);
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      // Optimistically decrement pending_count in cache
      queryClient.setQueryData(['request', variables.requestId], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          pending_count: Math.max(0, (old.pending_count ?? 0) - 1),
        };
      });

      // Then invalidate to ensure data consistency
      queryClient.invalidateQueries({ queryKey: ['pending-participants', variables.requestId] });
      queryClient.invalidateQueries({ queryKey: ['request', variables.requestId] });
      queryClient.invalidateQueries({ queryKey: ['my-participations'] });
    },
  });
}

/**
 * Hook for leaving a meal request (joined participant, not creator)
 */
export function useLeaveRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (requestId: string) => {
      const { error } = await requestsApi.leaveRequest(requestId);
      if (error) throw error;
    },
    onSuccess: (_, requestId) => {
      queryClient.invalidateQueries({ queryKey: ['request', requestId] });
      queryClient.invalidateQueries({ queryKey: ['requests'] });
      queryClient.invalidateQueries({ queryKey: ['chats'] });
      queryClient.invalidateQueries({ queryKey: ['my-participations'] });
    },
  });
}

/**
 * Hook for marking a meal as completed (creator only)
 */
export function useMarkMealCompleted() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (requestId: string) => {
      const { error } = await requestsApi.markMealCompleted(requestId);
      if (error) throw error;
    },
    onSuccess: (_, requestId) => {
      queryClient.invalidateQueries({ queryKey: ['request', requestId] });
      queryClient.invalidateQueries({ queryKey: ['requests'] });
      queryClient.invalidateQueries({ queryKey: ['chats'] });
      queryClient.invalidateQueries({ queryKey: ['my-participations'] });
      queryClient.invalidateQueries({ queryKey: ['ratings', 'pending'] });
    },
  });
}
