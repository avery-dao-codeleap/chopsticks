import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import FontAwesome from '@expo/vector-icons/FontAwesome';

/**
 * Banner that appears at the top of the screen when offline
 */
export function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOffline(!(state.isConnected && state.isInternetReachable !== false));
    });

    return () => unsubscribe();
  }, []);

  if (!isOffline) {
    return null;
  }

  return (
    <View
      style={{
        backgroundColor: '#dc2626',
        paddingVertical: 8,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
      }}
    >
      <FontAwesome name="wifi" size={14} color="#fff" />
      <Text style={{ color: '#fff', fontSize: 13, fontWeight: '600' }}>
        No internet connection
      </Text>
    </View>
  );
}
