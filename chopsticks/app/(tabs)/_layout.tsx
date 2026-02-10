import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs, useRouter } from 'expo-router';
import { TouchableOpacity, View } from 'react-native';
import { RatingPrompt } from '@/components/ui/RatingPrompt';
import { OfflineBanner } from '@/components/ui/OfflineBanner';

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome name={props.name} size={24} color={props.color} style={{ marginBottom: -3 }} />;
}

export default function TabLayout() {
  const router = useRouter();

  return (
    <>
      <RatingPrompt />
      <View style={{ flex: 1 }}>
        <OfflineBanner />
        <Tabs
          screenOptions={{
          tabBarActiveTintColor: '#f97316',
          tabBarInactiveTintColor: '#6b7280',
          tabBarStyle: {
            backgroundColor: '#171717',
            borderTopColor: '#262626',
            borderTopWidth: 1,
            paddingTop: 8,
            paddingBottom: 8,
            height: 60,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '500',
          },
          headerStyle: {
            backgroundColor: '#0a0a0a',
          },
          headerTintColor: '#ffffff',
          headerShadowVisible: false,
        }}
      >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Discover',
          tabBarIcon: ({ color }) => <TabBarIcon name="cutlery" color={color} />,
          headerTitle: 'Chopsticks',
          headerRight: () => (
            <TouchableOpacity
              onPress={() => router.push('/(screens)/notifications')}
              style={{ marginRight: 16 }}
            >
              <FontAwesome name="bell-o" size={20} color="#ffffff" />
            </TouchableOpacity>
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Chat',
          tabBarIcon: ({ color }) => <TabBarIcon name="comments" color={color} />,
          headerTitle: 'Messages',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <TabBarIcon name="user" color={color} />,
          headerTitle: 'My Profile',
        }}
      />
        </Tabs>
      </View>
    </>
  );
}
