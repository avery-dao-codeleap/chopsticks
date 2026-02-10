import { supabase } from '../supabase';

/**
 * List all chats for the current user
 * Returns chats with participant info and last message
 */
export async function listChats() {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      return { data: null, error: new Error('Not authenticated') };
    }

    // Get all chats where the user is a participant
    const { data, error } = await supabase
      .from('chat_participants')
      .select(`
        chat_id,
        chats!inner (
          id,
          request_id,
          expires_at,
          created_at,
          meal_requests!inner (
            id,
            time_window,
            restaurants!inner (
              id,
              name,
              address,
              district
            )
          )
        )
      `)
      .eq('user_id', user.user.id)
      .order('joined_at', { ascending: false });

    if (error) {
      console.error('Error listing chats:', error);
      return { data: null, error };
    }

    // For each chat, get the last message and participant count
    const chatsWithDetails = await Promise.all(
      (data || []).map(async (item) => {
        const chat = item.chats;

        // Get last message
        const { data: messages } = await supabase
          .from('messages')
          .select('id, content, sender_id, created_at, image_url')
          .eq('chat_id', chat.id)
          .order('created_at', { ascending: false })
          .limit(1);

        // Get participant count
        const { count } = await supabase
          .from('chat_participants')
          .select('*', { count: 'exact', head: true })
          .eq('chat_id', chat.id);

        const lastMessage = messages?.[0] || null;
        const mealRequest = chat.meal_requests;
        const restaurant = mealRequest?.restaurants;

        return {
          id: chat.id,
          request_id: chat.request_id,
          expires_at: chat.expires_at,
          created_at: chat.created_at,
          participant_count: count || 0,
          last_message: lastMessage,
          meal_request: mealRequest,
          restaurant: restaurant,
        };
      })
    );

    return { data: chatsWithDetails, error: null };
  } catch (error) {
    console.error('Error in listChats:', error);
    return { data: null, error: error as Error };
  }
}

/**
 * Get messages for a specific chat
 * Returns messages with sender info
 */
export async function getChatMessages(chatId: string) {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        id,
        chat_id,
        sender_id,
        content,
        image_url,
        flagged,
        created_at,
        users!messages_sender_id_fkey (
          id,
          name,
          photo_url
        )
      `)
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error getting chat messages:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error in getChatMessages:', error);
    return { data: null, error: error as Error };
  }
}

/**
 * Get chat details including participants
 */
export async function getChat(chatId: string) {
  try {
    const { data, error } = await supabase
      .from('chats')
      .select(`
        id,
        request_id,
        expires_at,
        created_at,
        meal_requests!inner (
          id,
          requester_id,
          time_window,
          group_size,
          cuisine,
          budget_range,
          restaurants!inner (
            id,
            name,
            address,
            district
          )
        )
      `)
      .eq('id', chatId)
      .single();

    if (error) {
      console.error('Error getting chat:', error);
      return { data: null, error };
    }

    // Get participants
    const { data: participants, error: participantsError } = await supabase
      .from('chat_participants')
      .select(`
        user_id,
        joined_at,
        users!chat_participants_user_id_fkey (
          id,
          name,
          photo_url,
          persona,
          meal_count
        )
      `)
      .eq('chat_id', chatId)
      .order('joined_at', { ascending: true });

    if (participantsError) {
      console.error('Error getting participants:', participantsError);
    }

    return {
      data: {
        ...data,
        participants: participants || [],
      },
      error: null,
    };
  } catch (error) {
    console.error('Error in getChat:', error);
    return { data: null, error: error as Error };
  }
}

/**
 * Send a text message to a chat
 */
export async function sendMessage(chatId: string, content: string) {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      return { data: null, error: new Error('Not authenticated') };
    }

    const { data, error } = await supabase
      .from('messages')
      .insert({
        chat_id: chatId,
        sender_id: user.user.id,
        content: content.trim(),
      })
      .select(`
        id,
        chat_id,
        sender_id,
        content,
        image_url,
        flagged,
        created_at,
        users!messages_sender_id_fkey (
          id,
          name,
          photo_url
        )
      `)
      .single();

    if (error) {
      console.error('Error sending message:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error in sendMessage:', error);
    return { data: null, error: error as Error };
  }
}

/**
 * Send an image message to a chat
 * Uploads image to Supabase Storage and creates message with image_url
 */
export async function sendImageMessage(chatId: string, imageUri: string) {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      return { data: null, error: new Error('Not authenticated') };
    }

    // Upload image to storage
    const fileExt = imageUri.split('.').pop() || 'jpg';
    const fileName = `${user.user.id}-${Date.now()}.${fileExt}`;
    const filePath = `chat-images/${chatId}/${fileName}`;

    // Convert URI to blob for upload
    const response = await fetch(imageUri);
    const blob = await response.blob();

    const { error: uploadError } = await supabase.storage
      .from('chat-images')
      .upload(filePath, blob, {
        contentType: `image/${fileExt}`,
        upsert: false,
      });

    if (uploadError) {
      console.error('Error uploading image:', uploadError);
      return { data: null, error: uploadError };
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('chat-images')
      .getPublicUrl(filePath);

    // Create message with image URL
    const { data, error } = await supabase
      .from('messages')
      .insert({
        chat_id: chatId,
        sender_id: user.user.id,
        content: '[Image]',
        image_url: publicUrl,
      })
      .select(`
        id,
        chat_id,
        sender_id,
        content,
        image_url,
        flagged,
        created_at,
        users!messages_sender_id_fkey (
          id,
          name,
          photo_url
        )
      `)
      .single();

    if (error) {
      console.error('Error creating image message:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error in sendImageMessage:', error);
    return { data: null, error: error as Error };
  }
}

/**
 * Remove a user from a chat (creator only)
 */
export async function removeUserFromChat(chatId: string, userId: string) {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      return { data: null, error: new Error('Not authenticated') };
    }

    // Verify the current user is the creator of the request
    const { data: chat } = await supabase
      .from('chats')
      .select('request_id, meal_requests!inner(requester_id)')
      .eq('id', chatId)
      .single();

    if (!chat || chat.meal_requests.requester_id !== user.user.id) {
      return { data: null, error: new Error('Unauthorized') };
    }

    // Remove user from chat participants
    const { error } = await supabase
      .from('chat_participants')
      .delete()
      .eq('chat_id', chatId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error removing user from chat:', error);
      return { data: null, error };
    }

    // Also remove from request participants
    const { error: participantError } = await supabase
      .from('request_participants')
      .delete()
      .eq('request_id', chat.request_id)
      .eq('user_id', userId);

    if (participantError) {
      console.error('Error removing user from request:', participantError);
    }

    return { data: true, error: null };
  } catch (error) {
    console.error('Error in removeUserFromChat:', error);
    return { data: null, error: error as Error };
  }
}

/**
 * Leave a chat (any participant)
 */
export async function leaveChat(chatId: string) {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      return { data: null, error: new Error('Not authenticated') };
    }

    // Get request_id for this chat
    const { data: chat } = await supabase
      .from('chats')
      .select('request_id')
      .eq('id', chatId)
      .single();

    if (!chat) {
      return { data: null, error: new Error('Chat not found') };
    }

    // Remove from chat participants
    const { error } = await supabase
      .from('chat_participants')
      .delete()
      .eq('chat_id', chatId)
      .eq('user_id', user.user.id);

    if (error) {
      console.error('Error leaving chat:', error);
      return { data: null, error };
    }

    // Also remove from request participants
    const { error: participantError } = await supabase
      .from('request_participants')
      .delete()
      .eq('request_id', chat.request_id)
      .eq('user_id', user.user.id);

    if (participantError) {
      console.error('Error leaving request:', participantError);
    }

    return { data: true, error: null };
  } catch (error) {
    console.error('Error in leaveChat:', error);
    return { data: null, error: error as Error };
  }
}

/**
 * Create a chat for a meal request (auto-created when first user joins)
 */
export async function createChat(requestId: string) {
  try {
    const { data, error } = await supabase
      .from('chats')
      .insert({
        request_id: requestId,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating chat:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error in createChat:', error);
    return { data: null, error: error as Error };
  }
}
