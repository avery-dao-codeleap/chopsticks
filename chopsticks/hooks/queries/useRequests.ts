import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as requestsApi from '@/services/api/requests';
import type { CreateRequestInput } from '@/services/api/requests';

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
      queryClient.invalidateQueries({ queryKey: ['pending-participants', variables.requestId] });
      queryClient.invalidateQueries({ queryKey: ['request', variables.requestId] });
      queryClient.invalidateQueries({ queryKey: ['requests'] });
      queryClient.invalidateQueries({ queryKey: ['chats'] });
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
      queryClient.invalidateQueries({ queryKey: ['pending-participants', variables.requestId] });
      queryClient.invalidateQueries({ queryKey: ['request', variables.requestId] });
    },
  });
}
