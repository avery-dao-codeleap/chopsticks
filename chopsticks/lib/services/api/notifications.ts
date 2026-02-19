import { supabase } from '../supabase';

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string;
  data: Record<string, any>;
  read: boolean;
  created_at: string;
}

/**
 * List notifications for the current user
 */
export async function listNotifications(): Promise<{
  data: Notification[];
  error: Error | null;
}> {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      return { data: [], error: new Error('Not authenticated') };
    }

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.user.id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error listing notifications:', error);
      return { data: [], error: new Error(error.message) };
    }

    return { data: data ?? [], error: null };
  } catch (error) {
    console.error('Error in listNotifications:', error);
    return { data: [], error: error as Error };
  }
}

/**
 * Mark a notification as read
 */
export async function markNotificationAsRead(
  notificationId: string
): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);

    if (error) {
      console.error('Error marking notification as read:', error);
      return { error: new Error(error.message) };
    }

    return { error: null };
  } catch (error) {
    console.error('Error in markNotificationAsRead:', error);
    return { error: error as Error };
  }
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsAsRead(): Promise<{
  error: Error | null;
}> {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      return { error: new Error('Not authenticated') };
    }

    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', user.user.id)
      .eq('read', false);

    if (error) {
      console.error('Error marking all notifications as read:', error);
      return { error: new Error(error.message) };
    }

    return { error: null };
  } catch (error) {
    console.error('Error in markAllNotificationsAsRead:', error);
    return { error: error as Error };
  }
}

/**
 * Delete a notification
 */
export async function deleteNotification(
  notificationId: string
): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId);

    if (error) {
      console.error('Error deleting notification:', error);
      return { error: new Error(error.message) };
    }

    return { error: null };
  } catch (error) {
    console.error('Error in deleteNotification:', error);
    return { error: error as Error };
  }
}

/**
 * Get unread notification count
 */
export async function getUnreadCount(): Promise<{
  data: number;
  error: Error | null;
}> {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      return { data: 0, error: new Error('Not authenticated') };
    }

    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.user.id)
      .eq('read', false);

    if (error) {
      console.error('Error getting unread count:', error);
      return { data: 0, error: new Error(error.message) };
    }

    return { data: count ?? 0, error: null };
  } catch (error) {
    console.error('Error in getUnreadCount:', error);
    return { data: 0, error: error as Error };
  }
}
