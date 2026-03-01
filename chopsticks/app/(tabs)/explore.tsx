import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ExploreTab() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0a0a0a', justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ color: '#6b7280' }}>Explore — coming soon</Text>
    </SafeAreaView>
  );
}
