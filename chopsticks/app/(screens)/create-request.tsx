import { useState, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { CUISINE_CATEGORIES } from '@/lib/constants';
import { MOCK_RESTAURANTS, CURRENT_USER, type MockRestaurant } from '@/lib/mockData';
import { useRequestsStore } from '@/stores/requests';
import { useI18n } from '@/lib/i18n';

const CUISINE_EMOJIS: Record<string, string> = {
  noodles_congee: '🍜', rice: '🍚', hotpot_grill: '🍲', seafood: '🦐',
  bread: '🥖', vietnamese_cakes: '🍰', snack: '🍿', dessert: '🍨',
  drinks: '🧋', fast_food: '🍔', international: '🌍', healthy: '🥗',
  veggie: '🥦', others: '🍽️',
};

export default function CreateRequestScreen() {
  const router = useRouter();
  const { t, language } = useI18n();
  const addRequest = useRequestsStore(state => state.addRequest);
  const [search, setSearch] = useState('');
  const [selectedRestaurant, setSelectedRestaurant] = useState<MockRestaurant | null>(null);
  const [selectedCuisineId, setSelectedCuisineId] = useState<string | null>(null);
  const [isAsap, setIsAsap] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<Date | null>(null);
  const [groupSize, setGroupSize] = useState(2);
  const [joinType, setJoinType] = useState<'open' | 'approval'>('open');
  const [description, setDescription] = useState('');

  const timeSlots = useMemo(() => {
    const now = Date.now();
    const thirtyMin = 30 * 60 * 1000;
    const slots: Date[] = [];
    let cursor = Math.ceil(now / thirtyMin) * thirtyMin;
    const max = now + 24 * 60 * 60 * 1000;
    while (cursor <= max) {
      slots.push(new Date(cursor));
      cursor += thirtyMin;
    }
    return slots;
  }, []);

  const formatSlot = (date: Date) => {
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const dayStr = isToday ? 'Today' : 'Tomorrow';
    const timeStr = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    return `${dayStr}, ${timeStr}`;
  };

  const filteredRestaurants = search.length > 0
    ? MOCK_RESTAURANTS.filter(r =>
        r.name.toLowerCase().includes(search.toLowerCase()) ||
        r.cuisine.toLowerCase().includes(search.toLowerCase())
      )
    : MOCK_RESTAURANTS;

  const handleAsapToggle = () => {
    const next = !isAsap;
    setIsAsap(next);
    if (next) { setJoinType('open'); setSelectedSlot(null); }
  };

  const handleCreate = () => {
    if (!selectedRestaurant || !selectedCuisineId) {
      Alert.alert(t('missingInfo'), t('missingRestaurantCuisine'));
      return;
    }
    if (!isAsap && !selectedSlot) {
      Alert.alert(t('missingInfo'), t('missingTime'));
      return;
    }
    const cuisineCat = CUISINE_CATEGORIES.find(c => c.id === selectedCuisineId);
    const timeWindow = isAsap ? 'ASAP' : formatSlot(selectedSlot!);
    const newRequest = {
      id: `req_${Date.now()}`,
      restaurant: selectedRestaurant,
      requester: CURRENT_USER,
      cuisine: cuisineCat ? (language === 'vi' ? cuisineCat.labelVi : cuisineCat.label) : '',
      cuisineId: selectedCuisineId,
      cuisineEmoji: CUISINE_EMOJIS[selectedCuisineId] || '🍽️',
      timeWindow,
      description: description.trim() || undefined,
      spotsTotal: groupSize,
      spotsTaken: 0,
      joinType,
    };
    addRequest(newRequest);
    router.push({ pathname: '/(screens)/request-detail', params: { requestId: newRequest.id } });
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#0a0a0a' }} contentContainerStyle={{ padding: 20 }}>
      {/* Restaurant search */}
      <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600', marginBottom: 8 }}>{t('restaurant')}</Text>
      {selectedRestaurant ? (
        <TouchableOpacity
          onPress={() => setSelectedRestaurant(null)}
          style={{ backgroundColor: '#171717', borderRadius: 12, padding: 14, marginBottom: 20, flexDirection: 'row', alignItems: 'center' }}
        >
          <View style={{ flex: 1 }}>
            <Text style={{ color: '#fff', fontSize: 15, fontWeight: '600' }}>{selectedRestaurant.name}</Text>
            <Text style={{ color: '#9ca3af', fontSize: 12, marginTop: 2 }}>{selectedRestaurant.address}</Text>
          </View>
          <Text style={{ color: '#f97316', fontSize: 13 }}>{t('change')}</Text>
        </TouchableOpacity>
      ) : (
        <View style={{ marginBottom: 20 }}>
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder={t('searchRestaurants')}
            placeholderTextColor="#6b7280"
            style={{
              backgroundColor: '#171717', borderRadius: 12, padding: 14,
              color: '#fff', fontSize: 15, borderWidth: 1, borderColor: '#262626',
            }}
          />
          <View style={{ maxHeight: 200, marginTop: 8 }}>
            <FlatList
              data={filteredRestaurants}
              keyExtractor={r => r.id}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => { setSelectedRestaurant(item); setSearch(''); }}
                  style={{ backgroundColor: '#171717', borderRadius: 10, padding: 12, marginBottom: 6 }}
                >
                  <Text style={{ color: '#fff', fontSize: 14, fontWeight: '500' }}>{item.name}</Text>
                  <Text style={{ color: '#6b7280', fontSize: 12, marginTop: 2 }}>{item.cuisine} · {item.priceRange} · {item.address}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      )}

      {/* Cuisine type */}
      <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600', marginBottom: 8 }}>{t('cuisineType')}</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
        {CUISINE_CATEGORIES.map(c => (
          <TouchableOpacity
            key={c.id}
            onPress={() => setSelectedCuisineId(c.id)}
            style={{
              paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10,
              backgroundColor: selectedCuisineId === c.id ? '#f97316' : '#171717',
              borderWidth: 1, borderColor: selectedCuisineId === c.id ? '#f97316' : '#262626',
              flexDirection: 'row', alignItems: 'center', gap: 6,
            }}
          >
            <Text style={{ fontSize: 16 }}>{CUISINE_EMOJIS[c.id] || '🍽️'}</Text>
            <Text style={{ color: selectedCuisineId === c.id ? '#fff' : '#9ca3af', fontSize: 13 }}>
              {language === 'vi' ? c.labelVi : c.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Description */}
      <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600', marginBottom: 8 }}>{t('description')}</Text>
      <TextInput
        value={description}
        onChangeText={setDescription}
        placeholder={t('descriptionPlaceholder')}
        placeholderTextColor="#6b7280"
        multiline numberOfLines={3}
        style={{
          backgroundColor: '#171717', borderRadius: 12, padding: 14, color: '#fff',
          fontSize: 15, borderWidth: 1, borderColor: '#262626',
          minHeight: 80, textAlignVertical: 'top', marginBottom: 20,
        }}
      />

      {/* Time */}
      <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600', marginBottom: 8 }}>{t('time')}</Text>
      <TouchableOpacity
        onPress={handleAsapToggle}
        style={{
          paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10,
          backgroundColor: isAsap ? '#f97316' : '#171717',
          borderWidth: 1, borderColor: isAsap ? '#f97316' : '#262626',
          marginBottom: 8, alignSelf: 'flex-start',
        }}
      >
        <Text style={{ color: isAsap ? '#fff' : '#9ca3af', fontSize: 13, fontWeight: '600' }}>⚡ {t('asap')}</Text>
      </TouchableOpacity>
      {isAsap && (
        <Text style={{ color: '#6b7280', fontSize: 12, marginBottom: 16 }}>{t('someoneShowUp')}</Text>
      )}
      {!isAsap && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
          {timeSlots.map((slot, i) => {
            const isSelected = selectedSlot?.getTime() === slot.getTime();
            return (
              <TouchableOpacity
                key={i}
                onPress={() => setSelectedSlot(slot)}
                style={{
                  paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10,
                  backgroundColor: isSelected ? '#f97316' : '#171717',
                  borderWidth: 1, borderColor: isSelected ? '#f97316' : '#262626',
                  marginRight: 8, minWidth: 110,
                }}
              >
                <Text style={{ color: isSelected ? '#fff' : '#9ca3af', fontSize: 12, fontWeight: '600', textAlign: 'center' }}>
                  {formatSlot(slot)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

      {/* Group size */}
      <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600', marginBottom: 8 }}>{t('groupSize')}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
        <TouchableOpacity
          onPress={() => setGroupSize(Math.max(2, groupSize - 1))}
          style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: '#262626', alignItems: 'center', justifyContent: 'center' }}
        >
          <Text style={{ color: '#fff', fontSize: 20 }}>−</Text>
        </TouchableOpacity>
        <Text style={{ color: '#fff', fontSize: 20, fontWeight: '700', marginHorizontal: 24 }}>{groupSize}</Text>
        <TouchableOpacity
          onPress={() => setGroupSize(Math.min(4, groupSize + 1))}
          style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: '#262626', alignItems: 'center', justifyContent: 'center' }}
        >
          <Text style={{ color: '#fff', fontSize: 20 }}>+</Text>
        </TouchableOpacity>
      </View>
      <Text style={{ color: '#6b7280', fontSize: 12, marginBottom: 20 }}>
        {groupSize === 2 ? t('onePlusConnection') : t('upToPeople', { count: groupSize })}
      </Text>

      {/* Join type */}
      <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600', marginBottom: 8 }}>{t('whoCanJoin')}</Text>
      {isAsap ? (
        <View style={{
          padding: 14, borderRadius: 12,
          backgroundColor: '#f9731620', borderWidth: 1.5, borderColor: '#f97316', marginBottom: 8,
        }}>
          <Text style={{ color: '#f97316', fontSize: 14, fontWeight: '600' }}>{t('openJoinLabel')}</Text>
          <Text style={{ color: '#6b7280', fontSize: 11, marginTop: 4 }}>{t('anyoneCanJoin')}</Text>
        </View>
      ) : (
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 8 }}>
          <TouchableOpacity
            onPress={() => setJoinType('open')}
            style={{
              flex: 1, padding: 14, borderRadius: 12,
              backgroundColor: joinType === 'open' ? '#f9731620' : '#171717',
              borderWidth: 1.5, borderColor: joinType === 'open' ? '#f97316' : '#262626',
            }}
          >
            <Text style={{ color: joinType === 'open' ? '#f97316' : '#9ca3af', fontSize: 14, fontWeight: '600' }}>{t('openJoinLabel')}</Text>
            <Text style={{ color: '#6b7280', fontSize: 11, marginTop: 4 }}>{t('anyoneCanJoin')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setJoinType('approval')}
            style={{
              flex: 1, padding: 14, borderRadius: 12,
              backgroundColor: joinType === 'approval' ? '#f9731620' : '#171717',
              borderWidth: 1.5, borderColor: joinType === 'approval' ? '#f97316' : '#262626',
            }}
          >
            <Text style={{ color: joinType === 'approval' ? '#f97316' : '#9ca3af', fontSize: 14, fontWeight: '600' }}>{t('approvalLabel')}</Text>
            <Text style={{ color: '#6b7280', fontSize: 11, marginTop: 4 }}>{t('youApproveEach')}</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Location sharing info */}
      {(joinType === 'open' || isAsap) && (
        <View style={{ backgroundColor: '#171717', borderRadius: 8, padding: 10, marginBottom: 20 }}>
          <Text style={{ color: '#6b7280', fontSize: 12 }}>{t('locationShared')}</Text>
        </View>
      )}
      {joinType === 'approval' && !isAsap && (
        <View style={{ backgroundColor: '#171717', borderRadius: 8, padding: 10, marginBottom: 20 }}>
          <Text style={{ color: '#6b7280', fontSize: 12 }}>{t('locationApproval')}</Text>
        </View>
      )}

      {/* Create button */}
      <TouchableOpacity
        onPress={handleCreate}
        style={{
          backgroundColor: '#f97316', borderRadius: 14, paddingVertical: 16, alignItems: 'center',
          opacity: selectedRestaurant && selectedCuisineId && (isAsap || selectedSlot) ? 1 : 0.5,
        }}
      >
        <Text style={{ color: '#fff', fontSize: 17, fontWeight: '700' }}>{t('createRequest')}</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}
