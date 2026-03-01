import { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useUserLists, useDeleteList } from '@/lib/hooks/queries/useLists';
import { CreateListSheet } from '@/lib/components/lists/CreateListSheet';

export default function MyListsScreen() {
  const router = useRouter();
  const { data: userLists = [], isLoading } = useUserLists();
  const deleteList = useDeleteList();
  const [showCreate, setShowCreate] = useState(false);

  const handleDelete = (list: { id: string; title: string }) => {
    Alert.alert('Delete List', `Delete "${list.title}"? This cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: () => deleteList.mutate(list.id),
      },
    ]);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0a0a0a' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#1f1f1f' }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
          <FontAwesome name="chevron-left" size={18} color="#fff" />
        </TouchableOpacity>
        <Text style={{ flex: 1, color: '#fff', fontSize: 18, fontWeight: '700' }}>My Lists</Text>
        <TouchableOpacity onPress={() => setShowCreate(true)}>
          <Text style={{ color: '#f97316', fontSize: 14, fontWeight: '600' }}>+ New</Text>
        </TouchableOpacity>
      </View>

      <Text style={{ color: '#6b7280', fontSize: 13, margin: 16, lineHeight: 18 }}>
        Save restaurants from TikTok, Instagram, or anywhere — all in one place, ready to act on.
      </Text>

      {isLoading ? (
        <ActivityIndicator size="large" color="#f97316" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={userLists}
          keyExtractor={item => item.id}
          contentContainerStyle={{ paddingBottom: 40 }}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', marginTop: 60, gap: 12 }}>
              <Text style={{ fontSize: 40 }}>📋</Text>
              <Text style={{ color: '#6b7280', fontSize: 15, textAlign: 'center' }}>
                Create your first list{'\n'}to start saving restaurants
              </Text>
              <TouchableOpacity
                onPress={() => setShowCreate(true)}
                style={{ backgroundColor: '#f97316', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 20, marginTop: 8 }}
              >
                <Text style={{ color: '#fff', fontWeight: '700' }}>Create a list</Text>
              </TouchableOpacity>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => router.push({ pathname: '/(screens)/list-detail', params: { listId: item.id, listType: 'personal' } })}
              onLongPress={() => handleDelete(item)}
              style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#1f1f1f', gap: 14 }}
            >
              <Text style={{ fontSize: 26 }}>{item.emoji ?? '📌'}</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#fff', fontSize: 15, fontWeight: '500' }}>{item.title}</Text>
              </View>
              <FontAwesome name="chevron-right" size={12} color="#6b7280" />
            </TouchableOpacity>
          )}
        />
      )}

      <CreateListSheet visible={showCreate} onClose={() => setShowCreate(false)} />
    </SafeAreaView>
  );
}
