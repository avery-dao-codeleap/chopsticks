import { useEffect, useRef } from 'react';
import { supabase } from '@/lib/services/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

/**
 * Hook to subscribe to Supabase Realtime Postgres Changes
 *
 * @example
 * useRealtime({
 *   channel: 'chat-messages',
 *   table: 'messages',
 *   filter: `chat_id=eq.${chatId}`,
 *   event: 'INSERT',
 *   onInsert: (payload) => {
 *     console.log('New message:', payload.new);
 *   },
 * });
 */

type RealtimeEvent = 'INSERT' | 'UPDATE' | 'DELETE' | '*';

interface UseRealtimeOptions {
  /** Unique channel name */
  channel: string;
  /** Table to listen to */
  table: string;
  /** Optional filter (e.g., 'chat_id=eq.abc123') */
  filter?: string;
  /** Event type to listen for */
  event?: RealtimeEvent;
  /** Callback for INSERT events */
  onInsert?: (payload: any) => void;
  /** Callback for UPDATE events */
  onUpdate?: (payload: any) => void;
  /** Callback for DELETE events */
  onDelete?: (payload: any) => void;
  /** Whether to enable the subscription (default: true) */
  enabled?: boolean;
}

export function useRealtime(options: UseRealtimeOptions) {
  const {
    channel: channelName,
    table,
    filter,
    event = '*',
    onInsert,
    onUpdate,
    onDelete,
    enabled = true,
  } = options;

  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    // Create channel
    const channel = supabase.channel(channelName);

    // Build the postgres changes config
    let config: any = {
      event,
      schema: 'public',
      table,
    };

    if (filter) {
      config.filter = filter;
    }

    // Subscribe to postgres changes
    channel
      .on('postgres_changes', config, (payload) => {
        if (payload.eventType === 'INSERT' && onInsert) {
          onInsert(payload);
        } else if (payload.eventType === 'UPDATE' && onUpdate) {
          onUpdate(payload);
        } else if (payload.eventType === 'DELETE' && onDelete) {
          onDelete(payload);
        }
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`✓ Subscribed to ${channelName}`);
        } else if (status === 'CHANNEL_ERROR') {
          console.warn(`Realtime subscription error for ${channelName} — will retry automatically`);
        }
      });

    channelRef.current = channel;

    // Cleanup on unmount
    return () => {
      if (channelRef.current) {
        console.log(`Unsubscribing from ${channelName}`);
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [channelName, table, filter, event, enabled, onInsert, onUpdate, onDelete]);

  return {
    channel: channelRef.current,
  };
}
