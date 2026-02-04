import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="birthdate" />
      <Stack.Screen name="gender" />
      <Stack.Screen name="privacy" />
      <Stack.Screen name="city" />
      <Stack.Screen name="persona" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="preferences" />
    </Stack>
  );
}
