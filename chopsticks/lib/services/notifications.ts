import { Platform } from 'react-native';
import type { Notification, NotificationResponse, Subscription } from 'expo-notifications';
import { supabase } from './supabase';

// expo-notifications is a built-in Expo module (works in Expo Go)
let Notifications: typeof import('expo-notifications') | null = null;
let Device: typeof import('expo-device') | null = null;
try {
  Notifications = require('expo-notifications');
  Device = require('expo-device');
  (Notifications as typeof import('expo-notifications')).setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
} catch {
  // Native module unavailable (e.g. Expo Go)
}

export interface NotificationService {
  requestPermissions: () => Promise<boolean>;
  registerForPushNotifications: () => Promise<string | null>;
  savePushToken: (userId: string, token: string) => Promise<void>;
  addNotificationReceivedListener: (callback: (notification: Notification) => void) => Subscription;
  addNotificationResponseReceivedListener: (callback: (response: NotificationResponse) => void) => Subscription;
}

class NotificationManager implements NotificationService {
  async requestPermissions(): Promise<boolean> {
    if (!Notifications) return false;

    // Skip Device.isDevice check — it can return false in Expo Go
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    return finalStatus === 'granted';
  }

  async registerForPushNotifications(): Promise<string | null> {
    if (!Notifications) return null;
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) return null;

      const projectId = process.env.EXPO_PUBLIC_PROJECT_ID;
      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId,
      });

      if (Platform.OS === 'android') {
        const N = Notifications as typeof import('expo-notifications');
        await N.setNotificationChannelAsync('default', {
          name: 'default',
          importance: N.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#f97316',
        });
      }

      return tokenData.data;
    } catch (error) {
      console.error('[Notifications] Error registering:', error);
      return null;
    }
  }

  async savePushToken(userId: string, token: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('users')
        .update({ expo_push_token: token })
        .eq('id', userId);

      if (error) console.error('Error saving push token:', error);
    } catch (error) {
      console.error('Error saving push token:', error);
    }
  }

  addNotificationReceivedListener(callback: (notification: Notification) => void): Subscription {
    if (!Notifications) return { remove: () => {} } as unknown as Subscription;
    return Notifications.addNotificationReceivedListener(callback);
  }

  addNotificationResponseReceivedListener(callback: (response: NotificationResponse) => void): Subscription {
    if (!Notifications) return { remove: () => {} } as unknown as Subscription;
    return Notifications.addNotificationResponseReceivedListener(callback);
  }
}

// Export singleton instance
export const notificationService = new NotificationManager();
