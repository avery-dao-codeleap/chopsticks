import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { CUISINE_CATEGORIES, BUDGET_RANGES, HCMC_DISTRICTS } from '@/lib/constants';
import { useRestaurants, useAddRestaurant } from '@/hooks/queries/useRestaurants';
import { useCreateRequest } from '@/hooks/queries/useRequests';
import { useAuthStore } from '@/stores/auth';
import { useI18n } from '@/lib/i18n';
import { TimePicker } from '@/components/forms/TimePicker';
import type { RestaurantRow } from '@/services/api/restaurants';

const CUISINE_EMOJIS: Record<string, string> = {
  noodles_congee: '🍜', rice: '🍚', hotpot_grill: '🍲', seafood: '🦐',
  bread: '🥖', vietnamese_cakes: '🍰', snack: '🍿', dessert: '🍨',
  drinks: '🧋', fast_food: '🍔', international: '🌍', healthy: '🥗',
  veggie: '🥦', others: '🍽️',
};

export default function CreateRequestScreen() {
  const router = useRouter();
  const { t, language } = useI18n();
  const session = useAuthStore(state => state.session);
  const createRequest = useCreateRequest();
  const addRestaurant = useAddRestaurant();

  // Restaurant selection
  const [search, setSearch] = useState('');
  const [cuisineFilter, setCuisineFilter] = useState<string | null>(null); // Filter for browsing restaurants
  const { data: restaurants, isLoading: loadingRestaurants } = useRestaurants(search);
  const [selectedRestaurant, setSelectedRestaurant] = useState<RestaurantRow | null>(null);

  // Manual restaurant entry
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [manualName, setManualName] = useState('');
  const [manualAddress, setManualAddress] = useState('');
  const [manualDistrict, setManualDistrict] = useState<string | null>(null);

  // Request details
  const [selectedCuisineId, setSelectedCuisineId] = useState<string | null>(null);
  const [selectedBudget, setSelectedBudget] = useState<string | null>(null);
  const [isAsap, setIsAsap] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<Date | null>(null);
  const [groupSize, setGroupSize] = useState(2);
  const [joinType, setJoinType] = useState<'open' | 'approval'>('open');
  const [description, setDescription] = useState('');

  const handleAsapToggle = (asap: boolean) => {
    setIsAsap(asap);
    if (asap) {
      setJoinType('open');
      setSelectedSlot(null);
    }
  };

  const handleAddManualRestaurant = async () => {
    if (!manualName.trim() || !manualAddress.trim() || !manualDistrict || !selectedCuisineId) {
      Alert.alert(t('missingInfo'), 'Please fill in all restaurant details including cuisine type.');
      return;
    }

    try {
      const result = await addRestaurant.mutateAsync({
        name: manualName.trim(),
        address: manualAddress.trim(),
        district: manualDistrict,
        cuisine_type: selectedCuisineId ?? 'others',
      });

      if (result) {
        setSelectedRestaurant(result);
        setShowManualEntry(false);
        setManualName('');
        setManualAddress('');
        setManualDistrict(null);
        setSelectedCuisineId(null); // Reset after adding restaurant
      }
    } catch {
      Alert.alert(t('missingInfo'), 'Failed to add restaurant. Please try again.');
    }
  };

  const handleCreate = async () => {
    if (!selectedRestaurant) {
      Alert.alert(t('missingInfo'), 'Please select a restaurant.');
      return;
    }
    if (!selectedBudget) {
      Alert.alert(t('missingInfo'), 'Please select a budget range.');
      return;
    }
    if (!isAsap && !selectedSlot) {
      Alert.alert(t('missingInfo'), t('missingTime'));
      return;
    }
    if (!session?.user?.id) {
      Alert.alert(t('missingInfo'), 'You must be logged in.');
      return;
    }

    const timeWindow = isAsap
      ? new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString() // 4h from now for ASAP
      : selectedSlot!.toISOString();

    try {
      await createRequest.mutateAsync({
        requester_id: session.user.id,
        restaurant_id: selectedRestaurant.id,
        cuisine: selectedRestaurant.cuisine_type, // Use restaurant's cuisine type
        budget_range: selectedBudget,
        time_window: timeWindow,
        group_size: groupSize,
        join_type: joinType,
        description: description.trim() || undefined,
      });

      Alert.alert(t('requestCreated'), t('mealIsLive', { name: selectedRestaurant.name }), [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch {
      Alert.alert('Error', 'Failed to create request. Please try again.');
    }
  };

  const isFormValid = selectedRestaurant && selectedBudget && (isAsap || selectedSlot);

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
      ) : showManualEntry ? (
        <View style={{ marginBottom: 20 }}>
          <TextInput
            value={manualName}
            onChangeText={setManualName}
            placeholder="Restaurant name"
            placeholderTextColor="#6b7280"
            style={{
              backgroundColor: '#171717', borderRadius: 12, padding: 14,
              color: '#fff', fontSize: 15, borderWidth: 1, borderColor: '#262626', marginBottom: 8,
            }}
          />
          <TextInput
            value={manualAddress}
            onChangeText={setManualAddress}
            placeholder="Address"
            placeholderTextColor="#6b7280"
            style={{
              backgroundColor: '#171717', borderRadius: 12, padding: 14,
              color: '#fff', fontSize: 15, borderWidth: 1, borderColor: '#262626', marginBottom: 8,
            }}
          />
          <Text style={{ color: '#9ca3af', fontSize: 13, marginBottom: 6 }}>District</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
            {HCMC_DISTRICTS.map(d => (
              <TouchableOpacity
                key={d.id}
                onPress={() => setManualDistrict(d.id)}
                style={{
                  paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, marginRight: 6,
                  backgroundColor: manualDistrict === d.id ? '#f97316' : '#171717',
                  borderWidth: 1, borderColor: manualDistrict === d.id ? '#f97316' : '#262626',
                }}
              >
                <Text style={{ color: manualDistrict === d.id ? '#fff' : '#9ca3af', fontSize: 12 }}>{d.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <Text style={{ color: '#9ca3af', fontSize: 13, marginBottom: 6 }}>Cuisine Type</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
            {CUISINE_CATEGORIES.map(c => (
              <TouchableOpacity
                key={c.id}
                onPress={() => setSelectedCuisineId(c.id)}
                style={{
                  paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, marginRight: 6,
                  backgroundColor: selectedCuisineId === c.id ? '#f97316' : '#171717',
                  borderWidth: 1, borderColor: selectedCuisineId === c.id ? '#f97316' : '#262626',
                  flexDirection: 'row', alignItems: 'center', gap: 4,
                }}
              >
                <Text style={{ fontSize: 14 }}>{CUISINE_EMOJIS[c.id] || '🍽️'}</Text>
                <Text style={{ color: selectedCuisineId === c.id ? '#fff' : '#9ca3af', fontSize: 12 }}>
                  {language === 'vi' ? c.labelVi : c.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity
              onPress={() => setShowManualEntry(false)}
              style={{ flex: 1, backgroundColor: '#262626', borderRadius: 10, paddingVertical: 12, alignItems: 'center' }}
            >
              <Text style={{ color: '#9ca3af', fontSize: 14 }}>{t('cancel')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleAddManualRestaurant}
              style={{
                flex: 1, backgroundColor: '#f97316', borderRadius: 10, paddingVertical: 12, alignItems: 'center',
                opacity: manualName.trim() && manualAddress.trim() && manualDistrict && selectedCuisineId ? 1 : 0.5,
              }}
            >
              <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600' }}>Add</Text>
            </TouchableOpacity>
          </View>
        </View>
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

          {/* Cuisine filter */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8, marginBottom: 8 }}>
            <TouchableOpacity
              onPress={() => setCuisineFilter(null)}
              style={{
                paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, marginRight: 6,
                backgroundColor: cuisineFilter === null ? '#f97316' : '#171717',
                borderWidth: 1, borderColor: cuisineFilter === null ? '#f97316' : '#262626',
              }}
            >
              <Text style={{ color: cuisineFilter === null ? '#fff' : '#9ca3af', fontSize: 12 }}>All</Text>
            </TouchableOpacity>
            {CUISINE_CATEGORIES.map(c => (
              <TouchableOpacity
                key={c.id}
                onPress={() => setCuisineFilter(c.id)}
                style={{
                  paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, marginRight: 6,
                  backgroundColor: cuisineFilter === c.id ? '#f97316' : '#171717',
                  borderWidth: 1, borderColor: cuisineFilter === c.id ? '#f97316' : '#262626',
                  flexDirection: 'row', alignItems: 'center', gap: 4,
                }}
              >
                <Text style={{ fontSize: 12 }}>{CUISINE_EMOJIS[c.id] || '🍽️'}</Text>
                <Text style={{ color: cuisineFilter === c.id ? '#fff' : '#9ca3af', fontSize: 11 }}>
                  {language === 'vi' ? c.labelVi : c.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={{ marginTop: 8 }}>
            <TouchableOpacity
              onPress={() => setShowManualEntry(true)}
              style={{
                backgroundColor: '#171717', borderRadius: 10, padding: 12, marginBottom: 6,
                borderWidth: 1, borderColor: '#262626', borderStyle: 'dashed',
              }}
            >
              <Text style={{ color: '#f97316', fontSize: 14, fontWeight: '500', textAlign: 'center' }}>+ Add restaurant manually</Text>
            </TouchableOpacity>
            <View style={{ maxHeight: 300 }}>
              <FlatList
                data={(restaurants ?? [])
                  .filter(r => !cuisineFilter || r.cuisine_type === cuisineFilter)}
                keyExtractor={r => r.id}
                keyboardShouldPersistTaps="handled"
                nestedScrollEnabled
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => { setSelectedRestaurant(item); setSearch(''); setCuisineFilter(null); }}
                    style={{ backgroundColor: '#171717', borderRadius: 10, padding: 12, marginBottom: 6 }}
                  >
                    <Text style={{ color: '#fff', fontSize: 14, fontWeight: '500' }}>{item.name}</Text>
                    <Text style={{ color: '#6b7280', fontSize: 12, marginTop: 2 }}>{item.cuisine_type} · {item.district} · {item.address}</Text>
                  </TouchableOpacity>
                )}
                ListEmptyComponent={
                  <View style={{ padding: 20, alignItems: 'center' }}>
                    <Text style={{ color: '#6b7280', fontSize: 13 }}>
                      {search || cuisineFilter ? 'No restaurants found' : 'Start typing to search'}
                    </Text>
                  </View>
                }
              />
            </View>
          </View>
        </View>
      )}

      {/* Budget range */}
      <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600', marginBottom: 8 }}>{t('budget')}</Text>
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 20 }}>
        {BUDGET_RANGES.map(b => (
          <TouchableOpacity
            key={b.id}
            onPress={() => setSelectedBudget(b.id)}
            style={{
              flex: 1, paddingVertical: 10, borderRadius: 10,
              backgroundColor: selectedBudget === b.id ? '#f97316' : '#171717',
              borderWidth: 1, borderColor: selectedBudget === b.id ? '#f97316' : '#262626',
              alignItems: 'center',
            }}
          >
            <Text style={{ color: selectedBudget === b.id ? '#fff' : '#9ca3af', fontSize: 12, fontWeight: '600' }}>
              {language === 'vi' ? b.labelVi : b.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Time */}
      <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600', marginBottom: 8 }}>{t('time')}</Text>
      <TimePicker
        value={selectedSlot}
        onChange={setSelectedSlot}
        isAsap={isAsap}
        onToggleAsap={handleAsapToggle}
      />
      {isAsap && (
        <Text style={{ color: '#6b7280', fontSize: 12, marginBottom: 16 }}>{t('someoneShowUp')}</Text>
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

      {/* Description/Message */}
      <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600', marginBottom: 8 }}>{t('description')}</Text>
      <TextInput
        value={description}
        onChangeText={setDescription}
        placeholder={t('descriptionPlaceholder')}
        placeholderTextColor="#6b7280"
        multiline
        numberOfLines={3}
        style={{
          backgroundColor: '#171717',
          borderRadius: 12,
          padding: 14,
          color: '#fff',
          fontSize: 15,
          borderWidth: 1,
          borderColor: '#262626',
          minHeight: 80,
          textAlignVertical: 'top',
          marginBottom: 20,
        }}
      />

      {/* Create button */}
      <TouchableOpacity
        onPress={handleCreate}
        disabled={!isFormValid || createRequest.isPending}
        style={{
          backgroundColor: '#f97316', borderRadius: 14, paddingVertical: 16, alignItems: 'center',
          opacity: isFormValid && !createRequest.isPending ? 1 : 0.5,
        }}
      >
        <Text style={{ color: '#fff', fontSize: 17, fontWeight: '700' }}>
          {createRequest.isPending ? 'Creating...' : t('createRequest')}
        </Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}
