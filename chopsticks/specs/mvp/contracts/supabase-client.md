# Supabase Client API Contracts

**Date**: 2026-01-31 | **Plan**: [plan.md](../plan.md)

This document defines the client-side API patterns for interacting with Supabase tables and realtime subscriptions.

---

## Authentication

### Token Storage

```typescript
// services/auth.ts
import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'supabase_jwt';
const REFRESH_KEY = 'supabase_refresh';

export const storeTokens = async (access: string, refresh: string) => {
  await SecureStore.setItemAsync(TOKEN_KEY, access);
  await SecureStore.setItemAsync(REFRESH_KEY, refresh);
};

export const getAccessToken = () => SecureStore.getItemAsync(TOKEN_KEY);
export const clearTokens = async () => {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
  await SecureStore.deleteItemAsync(REFRESH_KEY);
};
```

### Session Initialization

```typescript
// services/supabase.ts
import { createClient } from '@supabase/supabase-js';
import { getAccessToken } from './auth';

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      storage: {
        getItem: getAccessToken,
        setItem: storeTokens,
        removeItem: clearTokens,
      },
      autoRefreshToken: true,
      persistSession: true,
    },
  }
);
```

---

## User Operations

### Get Current User Profile

```typescript
// hooks/queries/useUser.ts
const getCurrentUser = async (): Promise<User> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('users')
    .select('*, user_preferences(*)')
    .eq('id', user.id)
    .single();

  if (error) throw error;
  return data;
};
```

### Update User Profile

```typescript
interface UpdateProfileInput {
  name?: string;
  photo_url?: string;
  language?: 'vi' | 'en';
}

const updateProfile = async (input: UpdateProfileInput): Promise<User> => {
  const { data: { user } } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from('users')
    .update({
      ...input,
      last_active_at: new Date().toISOString(),
    })
    .eq('id', user!.id)
    .select()
    .single();

  if (error) throw error;
  return data;
};
```

### Update Preferences

```typescript
interface UpdatePreferencesInput {
  cuisines?: string[];
  budget_ranges?: string[];
}

const updatePreferences = async (input: UpdatePreferencesInput): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();

  const { error } = await supabase
    .from('user_preferences')
    .upsert({
      user_id: user!.id,
      ...input,
      updated_at: new Date().toISOString(),
    });

  if (error) throw error;
};
```

---

## Meal Request Operations

### List Active Requests

```typescript
interface RequestFilters {
  district?: string;    // One of 22 HCMC districts
  cuisine?: string;     // One of 14 cuisine categories
  budget_range?: string; // One of 4 budget ranges
}

const listRequests = async (filters: RequestFilters): Promise<MealRequest[]> => {
  let query = supabase
    .from('meal_requests')
    .select(`
      *,
      requester:users!requester_id(id, name, photo_url, age, gender, persona, meal_count),
      restaurant:restaurants(id, name, address, district),
      participants:request_participants(count)
    `)
    .gt('time_window', new Date().toISOString());

  if (filters.district) {
    query = query.eq('restaurant.district', filters.district);
  }

  if (filters.cuisine) {
    query = query.eq('cuisine', filters.cuisine);
  }

  if (filters.budget_range) {
    query = query.eq('budget_range', filters.budget_range);
  }

  const { data, error } = await query.order('time_window', { ascending: true });

  if (error) throw error;
  return data;
};
```

### Create Request

```typescript
interface CreateRequestInput {
  restaurant_id: string;
  cuisine: string;
  budget_range: string;
  time_window: string; // ISO timestamp (must be within next 24h)
  group_size: number;  // 2-4 for MVP
  join_type: 'open' | 'approval';
}

const createRequest = async (input: CreateRequestInput): Promise<MealRequest> => {
  const { data: { user } } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from('meal_requests')
    .insert({
      ...input,
      requester_id: user!.id,
    })
    .select()
    .single();

  if (error) throw error;

  return data;
};
```

### Join Request

```typescript
const joinRequest = async (requestId: string): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();

  const { error } = await supabase
    .from('request_participants')
    .insert({
      request_id: requestId,
      user_id: user!.id,
      status: 'pending', // or 'joined' for open requests
    });

  if (error) {
    if (error.code === 'P0001') {
      // Custom error from trigger
      throw new Error('This meal is now full');
    }
    throw error;
  }
};
```

### Approve/Reject Participant

```typescript
const updateParticipantStatus = async (
  participantId: string,
  status: 'joined' | 'rejected'
): Promise<void> => {
  const { error } = await supabase
    .from('request_participants')
    .update({
      status,
      joined_at: status === 'joined' ? new Date().toISOString() : null,
    })
    .eq('id', participantId);

  if (error) throw error;
};
```

---

## Chat Operations

### List User's Chats

```typescript
const listChats = async (): Promise<Chat[]> => {
  const { data: { user } } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from('chats')
    .select(`
      *,
      participants:chat_participants(
        user:users(id, name, photo_url)
      ),
      request:meal_requests(id, cuisine, restaurant:restaurants(name)),
      last_message:messages(content, created_at, sender:users(name))
    `)
    .in('id', supabase
      .from('chat_participants')
      .select('chat_id')
      .eq('user_id', user!.id)
    )
    .order('created_at', { foreignTable: 'messages', ascending: false })
    .limit(1, { foreignTable: 'messages' });

  if (error) throw error;
  return data;
};
```

### Get Chat Messages

```typescript
const getChatMessages = async (
  chatId: string,
  cursor?: string,
  limit = 50
): Promise<{ messages: Message[]; nextCursor?: string }> => {
  let query = supabase
    .from('messages')
    .select(`
      *,
      sender:users(id, name, photo_url)
    `)
    .eq('chat_id', chatId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (cursor) {
    query = query.lt('created_at', cursor);
  }

  const { data, error } = await query;

  if (error) throw error;

  return {
    messages: data.reverse(), // Return in chronological order
    nextCursor: data.length === limit ? data[0].created_at : undefined,
  };
};
```

### Send Message

```typescript
const sendMessage = async (chatId: string, content: string): Promise<Message> => {
  const { data: { user } } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from('messages')
    .insert({
      chat_id: chatId,
      sender_id: user!.id,
      content: content.trim(),
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23514') {
      // Check constraint violation (rate limit)
      throw new Error('Message rate limit exceeded');
    }
    throw error;
  }

  return data;
};
```

---

## Realtime Subscriptions

### Chat Messages Subscription

```typescript
const subscribeToChatMessages = (
  chatId: string,
  onMessage: (message: Message) => void
): RealtimeChannel => {
  return supabase
    .channel(`chat:${chatId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `chat_id=eq.${chatId}`,
      },
      async (payload) => {
        // Fetch full message with sender info
        const { data } = await supabase
          .from('messages')
          .select('*, sender:users(id, name, photo_url)')
          .eq('id', payload.new.id)
          .single();

        if (data) onMessage(data);
      }
    )
    .subscribe();
};
```

### Request Updates Subscription

```typescript
const subscribeToRequestUpdates = (
  requestId: string,
  onUpdate: (request: MealRequest) => void
): RealtimeChannel => {
  return supabase
    .channel(`request:${requestId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'meal_requests',
        filter: `id=eq.${requestId}`,
      },
      (payload) => {
        if (payload.eventType === 'UPDATE') {
          onUpdate(payload.new as MealRequest);
        }
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'request_participants',
        filter: `request_id=eq.${requestId}`,
      },
      () => {
        // Refetch to get updated participant count
        // TanStack Query invalidation handles this
      }
    )
    .subscribe();
};
```

---

## Image Upload

### Upload Profile Photo

```typescript
const uploadProfilePhoto = async (uri: string): Promise<string> => {
  const { data: { user } } = await supabase.auth.getUser();

  // Compress image first (see research.md)
  const compressed = await compressImage(uri);

  const response = await fetch(compressed.uri);
  const blob = await response.blob();

  const path = `avatars/${user!.id}.jpg`;

  const { error } = await supabase.storage
    .from('public')
    .upload(path, blob, {
      contentType: 'image/jpeg',
      upsert: true,
    });

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage
    .from('public')
    .getPublicUrl(path);

  return publicUrl;
};
```

### Upload Chat Image

```typescript
const uploadChatImage = async (chatId: string, messageId: string, uri: string): Promise<string> => {
  // Compress image first (see research.md)
  const compressed = await compressImage(uri);

  const response = await fetch(compressed.uri);
  const blob = await response.blob();

  const path = `chat-images/${chatId}/${messageId}.jpg`;

  const { error } = await supabase.storage
    .from('public')
    .upload(path, blob, { contentType: 'image/jpeg' });

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage
    .from('public')
    .getPublicUrl(path);

  return publicUrl;
};
```

---

## Error Handling

### Standard Error Codes

| Code | Meaning | User Message |
|------|---------|--------------|
| `PGRST116` | No rows returned | "Not found" |
| `23505` | Unique violation | "Already exists" |
| `23503` | Foreign key violation | "Invalid reference" |
| `42501` | RLS policy violation | "Not authorized" |
| `P0001` | Custom trigger error | (use error message, e.g., "This meal is now full") |

### Error Handler

```typescript
const handleSupabaseError = (error: PostgrestError): never => {
  switch (error.code) {
    case 'PGRST116':
      throw new NotFoundError(error.message);
    case '23505':
      throw new ConflictError('This already exists');
    case '42501':
      throw new ForbiddenError('You do not have permission');
    case 'P0001':
      throw new ValidationError(error.message);
    default:
      throw new APIError(error.message);
  }
};
```
