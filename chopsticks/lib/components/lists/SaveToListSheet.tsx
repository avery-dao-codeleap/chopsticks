import { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, ActivityIndicator } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useUserLists, useListRestaurants, useAddToList, useRemoveFromList } from '@/lib/hooks/queries/useLists';
import { CreateListSheet } from './CreateListSheet';
import { suggestListName } from '@/lib/utils/suggestListName';

interface Restaurant {
  id: string;
  name: string;
  cuisine_type: string;
  district?: string;
}

interface Props {
  visible: boolean;
  restaurant: Restaurant | null;
  onClose: () => void;
}

function ListRow({ list, restaurantId }: { list: { id: string; title: string; emoji: string | null }; restaurantId: string }) {
  const { data: items = [], isLoading } = useListRestaurants(list.id);
  const addToList = useAddToList();
  const removeFromList = useRemoveFromList();
  const isInList = items.some(item => item.restaurant_id === restaurantId);

  const handleToggle = async () => {
    if (isInList) {
      await removeFromList.mutateAsync({ listId: list.id, restaurantId });
    } else {
      await addToList.mutateAsync({ listId: list.id, restaurantId });
    }
  };

  return (
    <TouchableOpacity
      onPress={handleToggle}
      style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 20, gap: 12 }}
    >
      <View style={{
        width: 24, height: 24, borderRadius: 12,
        backgroundColor: isInList ? '#f97316' : 'transparent',
        borderWidth: isInList ? 0 : 2, borderColor: '#374151',
        alignItems: 'center', justifyContent: 'center',
      }}>
        {isInList && <FontAwesome name="check" size={12} color="#fff" />}
      </View>
      <Text style={{ fontSize: 20 }}>{list.emoji ?? '📌'}</Text>
      <Text style={{ flex: 1, color: '#fff', fontSize: 15 }}>{list.title}</Text>
      <Text style={{ color: '#6b7280', fontSize: 13 }}>{isLoading ? '...' : items.length}</Text>
    </TouchableOpacity>
  );
}

export function SaveToListSheet({ visible, restaurant, onClose }: Props) {
  const { data: userLists = [], isLoading } = useUserLists();
  const [showCreate, setShowCreate] = useState(false);

  const suggestion = restaurant ? suggestListName(restaurant) : undefined;

  return (
    <>
      <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
        <TouchableOpacity style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' }} activeOpacity={1} onPress={onClose} />
        <View style={{ backgroundColor: '#171717', borderTopLeftRadius: 16, borderTopRightRadius: 16, maxHeight: '60%', paddingBottom: 40 }}>
          <View style={{ width: 40, height: 4, backgroundColor: '#374151', borderRadius: 2, alignSelf: 'center', marginTop: 12, marginBottom: 16 }} />
          <Text style={{ color: '#fff', fontSize: 17, fontWeight: '700', marginHorizontal: 20, marginBottom: 4 }}>
            Save to list...
          </Text>
          {restaurant && (
            <Text style={{ color: '#6b7280', fontSize: 13, marginHorizontal: 20, marginBottom: 12 }}>{restaurant.name}</Text>
          )}
          <View style={{ height: 1, backgroundColor: '#262626' }} />

          {isLoading ? (
            <ActivityIndicator size="small" color="#f97316" style={{ marginTop: 24 }} />
          ) : (
            <ScrollView>
              {userLists.map(list => (
                <ListRow key={list.id} list={list} restaurantId={restaurant?.id ?? ''} />
              ))}
              <View style={{ height: 1, backgroundColor: '#262626', marginTop: 4 }} />
              <TouchableOpacity
                onPress={() => setShowCreate(true)}
                style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 20, gap: 12 }}
              >
                <FontAwesome name="plus" size={16} color="#f97316" />
                <Text style={{ color: '#f97316', fontSize: 15, fontWeight: '500' }}>Create new list</Text>
              </TouchableOpacity>
            </ScrollView>
          )}
        </View>
      </Modal>

      <CreateListSheet
        visible={showCreate}
        onClose={() => setShowCreate(false)}
        suggestion={suggestion}
      />
    </>
  );
}
