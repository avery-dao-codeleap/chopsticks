import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useRef } from 'react';
import 'react-native-reanimated';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { Subscription } from 'expo-notifications';

import { useAuthStore } from '@/lib/stores/auth';
import { notificationService } from '@/lib/services/notifications';
import '../global.css';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(auth)',
};

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

// Create a client for TanStack Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes (formerly cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Custom dark theme for the app
const ChopsticksDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: '#f97316', // Orange
    background: '#0a0a0a',
    card: '#171717',
    text: '#ffffff',
    border: '#262626',
  },
};

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    ...FontAwesome.font,
  });

  const { initialize, isLoading: authLoading, session, isOnboarded } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();
  const notificationListenerRef = useRef<Subscription | null>(null);
  const responseListenerRef = useRef<Subscription | null>(null);

  // Initialize auth on mount
  useEffect(() => {
    initialize();
  }, []);

  // Set up push notification listeners
  useEffect(() => {
    if (!session || !isOnboarded) return;

    // Foreground: invalidate notifications query so badge updates
    notificationListenerRef.current = notificationService.addNotificationReceivedListener(() => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unreadCount'] });
    });

    // User tapped a notification — deep link to the right screen
    responseListenerRef.current = notificationService.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data as Record<string, string> | undefined;
        if (!data) return;

        if (data.chatId) {
          // new_message → open chat (chat-detail expects chatId param)
          router.push(`/(screens)/chat-detail?chatId=${data.chatId}`);
        } else if (data.type === 'join_request' && data.requestId) {
          // Someone wants to join your request
          router.push(`/(screens)/pending-requests?requestId=${data.requestId}`);
        } else if (data.type === 'join_approved' && data.requestId) {
          // Your join was approved
          router.push(`/(screens)/request-detail?requestId=${data.requestId}`);
        }
      },
    );

    return () => {
      notificationListenerRef.current?.remove();
      responseListenerRef.current?.remove();
    };
  }, [session, isOnboarded]);

  // Handle font loading errors
  useEffect(() => {
    if (fontError) throw fontError;
  }, [fontError]);

  // Hide splash screen when ready
  useEffect(() => {
    if (fontsLoaded && !authLoading) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, authLoading]);

  // Auth-based navigation
  useEffect(() => {
    if (authLoading || !fontsLoaded) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inOnboardingGroup = segments[0] === '(onboarding)';

    if (!session) {
      // Not logged in - go to welcome screen
      if (!inAuthGroup) {
        router.replace('/(auth)/welcome');
      }
    } else if (!isOnboarded) {
      // Logged in but not onboarded
      if (!inOnboardingGroup) {
        router.replace('/(onboarding)/birthdate');
      }
    } else {
      // Logged in and onboarded - go to main app
      if (inAuthGroup || inOnboardingGroup) {
        router.replace('/(tabs)');
      }
    }
  }, [session, isOnboarded, segments, authLoading, fontsLoaded]);

  if (!fontsLoaded || authLoading) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={ChopsticksDarkTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(onboarding)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="(screens)"
            options={{
              headerShown: false,
              presentation: 'card',
            }}
          />
        </Stack>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
