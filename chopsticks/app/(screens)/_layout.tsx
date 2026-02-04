import { Stack, useRouter } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';

export default function ScreensLayout() {
  const router = useRouter();

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: '#0a0a0a' },
        headerTintColor: '#ffffff',
        headerShadowVisible: false,
        headerBackVisible: false,
        headerLeft: () => (
          <TouchableOpacity onPress={() => router.back()} style={{ paddingRight: 16, paddingLeft: 4 }}>
            <FontAwesome name="chevron-left" size={18} color="#fff" />
          </TouchableOpacity>
        ),
        contentStyle: { backgroundColor: '#0a0a0a' },
      }}
    >
      <Stack.Screen name="request-detail" options={{ headerTitle: 'Request Detail' }} />
      <Stack.Screen name="create-request" options={{ headerTitle: 'Create Request' }} />
      <Stack.Screen name="chat-detail" options={{ headerTitle: 'Chat' }} />
      <Stack.Screen name="notifications" options={{ headerTitle: 'Notifications' }} />
      <Stack.Screen name="user-profile" options={{ headerTitle: '' }} />
      <Stack.Screen name="edit-profile" options={{ headerTitle: 'Edit Profile' }} />
      <Stack.Screen name="my-requests" options={{ headerTitle: 'My Requests' }} />
      <Stack.Screen name="post-meal" options={{ headerTitle: 'Meal Complete' }} />
    </Stack>
  );
}
