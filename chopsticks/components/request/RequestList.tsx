import { FlatList, View, Text, ActivityIndicator } from 'react-native';
import { RequestCard } from './RequestCard';
import type { MealRequestWithDetails } from '@/services/api/requests';

interface RequestListProps {
  requests: MealRequestWithDetails[];
  isLoading: boolean;
  onPressRequest: (requestId: string) => void;
  language?: 'en' | 'vi';
  emptyTitle?: string;
  emptySubtitle?: string;
  header?: React.ReactElement;
}

export function RequestList({
  requests,
  isLoading,
  onPressRequest,
  language,
  emptyTitle = 'No matching requests',
  emptySubtitle = 'Try adjusting your filters or create one!',
  header,
}: RequestListProps) {
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 60 }}>
        <ActivityIndicator size="large" color="#f97316" />
      </View>
    );
  }

  return (
    <FlatList
      data={requests}
      keyExtractor={item => item.id}
      contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
      ListHeaderComponent={header}
      renderItem={({ item }) => (
        <RequestCard
          request={item}
          onPress={() => onPressRequest(item.id)}
          language={language}
        />
      )}
      ListEmptyComponent={
        <View style={{ alignItems: 'center', paddingTop: 40 }}>
          <Text style={{ fontSize: 40, marginBottom: 12 }}>🍜</Text>
          <Text style={{ color: '#fff', fontSize: 18, fontWeight: '600' }}>{emptyTitle}</Text>
          <Text style={{ color: '#6b7280', marginTop: 4, textAlign: 'center' }}>{emptySubtitle}</Text>
        </View>
      }
    />
  );
}
