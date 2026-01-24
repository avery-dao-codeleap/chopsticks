import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import '../global.css';

import { useAuthStore } from '@/stores/auth';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(auth)',
};

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

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
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  const { initialize, isLoading: authLoading, session, isOnboarded, devBypass } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  // Initialize auth on mount
  useEffect(() => {
    initialize();
  }, []);

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

    // Dev bypass - skip auth checks
    if (devBypass) {
      if (inAuthGroup || inOnboardingGroup) {
        router.replace('/(tabs)');
      }
      return;
    }

    if (!session) {
      // Not logged in - go to auth
      if (!inAuthGroup) {
        router.replace('/(auth)/login');
      }
    } else if (!isOnboarded) {
      // Logged in but not onboarded
      if (!inOnboardingGroup) {
        router.replace('/(onboarding)/profile');
      }
    } else {
      // Logged in and onboarded - go to main app
      if (inAuthGroup || inOnboardingGroup) {
        router.replace('/(tabs)');
      }
    }
  }, [session, isOnboarded, segments, authLoading, fontsLoaded, devBypass]);

  if (!fontsLoaded || authLoading) {
    return null;
  }

  return (
    <ThemeProvider value={ChopsticksDarkTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(onboarding)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      </Stack>
    </ThemeProvider>
  );
}
