import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';
import {
  listChats,
  getChat,
  getChatMessages,
  sendMessage,
  sendImageMessage,
  removeUserFromChat,
  leaveChat,
} from '@/services/api/chats';

/**
 * Query hook to list all chats for the current user
 */
export function useChats() {
  return useQuery({
    queryKey: ['chats'],
    queryFn: async () => {
      const { data, error } = await listChats();
      if (error) throw error;
      return data || [];
    },
    refetchInterval: 2000, // Auto-refresh every 2 seconds for real-time updates
  });
}

/**
 * Query hook to get a single chat with participants
 */
export function useChat(chatId: string | undefined) {
  return useQuery({
    queryKey: ['chat', chatId],
    queryFn: async () => {
      if (!chatId) return null;
      const { data, error } = await getChat(chatId);
      if (error) throw error;
      return data;
    },
    enabled: !!chatId,
  });
}

/**
 * Query hook to get messages for a chat
 */
export function useChatMessages(chatId: string | undefined) {
  return useQuery({
    queryKey: ['chat-messages', chatId],
    queryFn: async () => {
      if (!chatId) return [];
      const { data, error } = await getChatMessages(chatId);
      if (error) throw error;
      return data || [];
    },
    enabled: !!chatId,
    refetchInterval: false, // Will use realtime subscriptions instead
  });
}

/**
 * Mutation hook to send a text message
 */
export function useSendMessage(chatId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (content: string) => {
      const { data, error } = await sendMessage(chatId, content);
      if (error) throw error;
      return data;
    },
    onMutate: async (content) => {
      // Optimistic update - add message immediately
      await queryClient.cancelQueries({ queryKey: ['chat-messages', chatId] });

      const previousMessages = queryClient.getQueryData(['chat-messages', chatId]);

      // Add temporary message
      const tempMessage = {
        id: `temp-${Date.now()}`,
        chat_id: chatId,
        sender_id: 'temp',
        content,
        image_url: null,
        flagged: false,
        created_at: new Date().toISOString(),
        users: null,
      };

      queryClient.setQueryData(['chat-messages', chatId], (old: any) => {
        return [...(old || []), tempMessage];
      });

      return { previousMessages };
    },
    onError: (error, variables, context) => {
      // Revert optimistic update on error
      if (context?.previousMessages) {
        queryClient.setQueryData(['chat-messages', chatId], context.previousMessages);
      }
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message. Please try again.');
    },
    onSuccess: (data) => {
      // Remove temp message and replace with real one
      queryClient.setQueryData(['chat-messages', chatId], (old: any[] = []) => {
        // Remove temp message
        const withoutTemp = old.filter(msg => !msg.id.startsWith('temp-'));
        // Add real message if not already added by realtime
        const exists = withoutTemp.some((msg: any) => msg.id === data?.id);
        if (!exists && data) {
          return [...withoutTemp, data];
        }
        return withoutTemp;
      });
      // Update chat list last message
      queryClient.invalidateQueries({ queryKey: ['chats'] });
    },
  });
}

/**
 * Mutation hook to send an image message
 */
export function useSendImageMessage(chatId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (imageUri: string) => {
      const { data, error } = await sendImageMessage(chatId, imageUri);
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      // Add message directly to cache (realtime will also pick it up)
      queryClient.setQueryData(['chat-messages', chatId], (old: any[] = []) => {
        const exists = old?.some((msg: any) => msg.id === data?.id);
        if (!exists && data) {
          return [...(old || []), data];
        }
        return old || [];
      });
      // Update chat list last message
      queryClient.invalidateQueries({ queryKey: ['chats'] });
    },
    onError: (error) => {
      console.error('Error sending image:', error);
      Alert.alert('Error', 'Failed to send image. Please try again.');
    },
  });
}

/**
 * Mutation hook to remove a user from chat (creator only)
 */
export function useRemoveUserFromChat(chatId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      const { data, error } = await removeUserFromChat(chatId, userId);
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat', chatId] });
      queryClient.invalidateQueries({ queryKey: ['chat-messages', chatId] });
    },
    onError: (error) => {
      console.error('Error removing user:', error);
      Alert.alert('Error', 'Failed to remove user. Please try again.');
    },
  });
}

/**
 * Mutation hook to leave a chat
 */
export function useLeaveChat() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (chatId: string) => {
      const { data, error } = await leaveChat(chatId);
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chats'] });
    },
    onError: (error) => {
      console.error('Error leaving chat:', error);
      Alert.alert('Error', 'Failed to leave chat. Please try again.');
    },
  });
}
