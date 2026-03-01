import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs, useRouter } from 'expo-router';
import { TouchableOpacity, View, Text } from 'react-native';
import { RatingPrompt } from '@/lib/components/ui/RatingPrompt';
import { OfflineBanner } from '@/lib/components/ui/OfflineBanner';
import { useUnreadDot, markChatTabSeen } from '@/lib/hooks/queries/useChats';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/lib/stores/auth';

function TabBarIcon(props: { name: React.ComponentProps<typeof FontAwesome>['name']; color: string }) {
  return <FontAwesome name={props.name} size={24} color={props.color} style={{ marginBottom: -3 }} />;
}

function ProfileAvatar() {
  const router = useRouter();
  const user = useAuthStore(state => state.user);
  const initials = user?.name ? user.name.charAt(0).toUpperCase() : '?';

  return (
    <TouchableOpacity
      onPress={() => router.push('/(screens)/user-profile')}
      style={{ marginLeft: 16 }}
    >
      <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#f97316', alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: '#fff', fontSize: 14, fontWeight: '700' }}>{initials}</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function TabLayout() {
  const { data: hasUnread } = useUnreadDot();
  const queryClient = useQueryClient();

  const handleChatTabPress = () => {
    markChatTabSeen().then(() => {
      queryClient.invalidateQueries({ queryKey: ['unread-dot'] });
    });
  };

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
            tabBarShowLabel: false,
            headerStyle: { backgroundColor: '#0a0a0a' },
            headerTintColor: '#ffffff',
            headerShadowVisible: false,
          }}
        >
          <Tabs.Screen
            name="index"
            options={{
              tabBarIcon: ({ color }) => <TabBarIcon name="cutlery" color={color} />,
              headerTitle: 'Chopsticks',
              headerLeft: () => <ProfileAvatar />,
            }}
          />
          <Tabs.Screen
            name="explore"
            options={{
              tabBarIcon: ({ color }) => <TabBarIcon name="compass" color={color} />,
              headerTitle: 'Chopsticks',
              headerLeft: () => <ProfileAvatar />,
            }}
          />
          <Tabs.Screen
            name="chat"
            options={{
              tabBarIcon: ({ color }) => (
                <View>
                  <TabBarIcon name="comments" color={color} />
                  {hasUnread && (
                    <View style={{
                      position: 'absolute', top: -2, right: -6,
                      width: 10, height: 10, borderRadius: 5,
                      backgroundColor: '#ef4444', borderWidth: 2, borderColor: '#171717',
                    }} />
                  )}
                </View>
              ),
              headerTitle: 'Messages',
            }}
            listeners={{ tabPress: handleChatTabPress }}
          />
          <Tabs.Screen
            name="notifications"
            options={{
              tabBarIcon: ({ color }) => <TabBarIcon name="bell" color={color} />,
              headerTitle: 'Notifications',
            }}
          />
          <Tabs.Screen
            name="profile"
            options={{ href: null }}
          />
        </Tabs>
      </View>
    </>
  );
}
