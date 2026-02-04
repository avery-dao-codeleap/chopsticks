import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/stores/auth';
import { CUISINE_TYPES, DIETARY_RESTRICTIONS, COMMON_ALLERGIES } from '@/types';

const BUDGET_OPTIONS = [
  { label: 'Budget-friendly', value: [0, 100000], emoji: '💵' },
  { label: 'Mid-range', value: [100000, 300000], emoji: '💰' },
  { label: 'Flexible', value: [0, 1000000], emoji: '💎' },
];

export default function PreferencesScreen() {
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);
  const [selectedDietary, setSelectedDietary] = useState<string[]>([]);
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>([]);
  const [selectedBudget, setSelectedBudget] = useState<number[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { updatePreferences, setOnboarded } = useAuthStore();

  const toggleItem = (
    item: string,
    list: string[],
    setList: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    if (list.includes(item)) {
      setList(list.filter(i => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  const handleFinish = async () => {
    if (selectedCuisines.length === 0) {
      setError('Please select at least one cuisine type');
      return;
    }

    if (!selectedBudget) {
      setError('Please select a budget range');
      return;
    }

    setIsLoading(true);
    setError('');

    const { error: updateError } = await updatePreferences({
      cuisineTypes: selectedCuisines,
      dietaryRestrictions: selectedDietary,
      allergies: selectedAllergies,
      budgetMin: selectedBudget[0],
      budgetMax: selectedBudget[1],
      preferredRadiusKm: 10, // Default 10km
    });

    setIsLoading(false);

    if (updateError) {
      setError(updateError.message);
    } else {
      setOnboarded(true);
      // Navigation handled by root layout
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        <View className="py-8">
          {/* Header */}
          <Text className="text-3xl font-bold text-white mb-2">Food Preferences</Text>
          <Text className="text-gray-400 mb-8">Help us find better matches for you</Text>

          {/* Cuisine Types */}
          <View className="mb-8">
            <Text className="text-white font-semibold text-lg mb-3">What do you like to eat?</Text>
            <View className="flex-row flex-wrap gap-2">
              {CUISINE_TYPES.map(cuisine => (
                <TouchableOpacity
                  key={cuisine}
                  className={`px-4 py-2 rounded-full ${
                    selectedCuisines.includes(cuisine)
                      ? 'bg-primary-500'
                      : 'bg-surface'
                  }`}
                  onPress={() => toggleItem(cuisine, selectedCuisines, setSelectedCuisines)}
                >
                  <Text
                    className={selectedCuisines.includes(cuisine) ? 'text-white' : 'text-gray-300'}
                  >
                    {cuisine}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Budget */}
          <View className="mb-8">
            <Text className="text-white font-semibold text-lg mb-3">Budget per meal (VND)</Text>
            <View className="gap-2">
              {BUDGET_OPTIONS.map(option => (
                <TouchableOpacity
                  key={option.label}
                  className={`flex-row items-center px-4 py-4 rounded-xl ${
                    selectedBudget === option.value
                      ? 'bg-primary-500'
                      : 'bg-surface'
                  }`}
                  onPress={() => setSelectedBudget(option.value)}
                >
                  <Text className="text-2xl mr-3">{option.emoji}</Text>
                  <View>
                    <Text
                      className={`font-medium ${
                        selectedBudget === option.value ? 'text-white' : 'text-gray-300'
                      }`}
                    >
                      {option.label}
                    </Text>
                    <Text
                      className={`text-sm ${
                        selectedBudget === option.value ? 'text-white/70' : 'text-gray-500'
                      }`}
                    >
                      {option.value[0].toLocaleString()} - {option.value[1].toLocaleString()}đ
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Dietary Restrictions */}
          <View className="mb-8">
            <Text className="text-white font-semibold text-lg mb-1">Dietary Restrictions</Text>
            <Text className="text-gray-500 text-sm mb-3">Optional</Text>
            <View className="flex-row flex-wrap gap-2">
              {DIETARY_RESTRICTIONS.map(diet => (
                <TouchableOpacity
                  key={diet}
                  className={`px-4 py-2 rounded-full ${
                    selectedDietary.includes(diet)
                      ? 'bg-secondary-500'
                      : 'bg-surface'
                  }`}
                  onPress={() => toggleItem(diet, selectedDietary, setSelectedDietary)}
                >
                  <Text
                    className={selectedDietary.includes(diet) ? 'text-white' : 'text-gray-300'}
                  >
                    {diet}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Allergies */}
          <View className="mb-8">
            <Text className="text-white font-semibold text-lg mb-1">Allergies</Text>
            <Text className="text-gray-500 text-sm mb-3">Important for safety</Text>
            <View className="flex-row flex-wrap gap-2">
              {COMMON_ALLERGIES.map(allergy => (
                <TouchableOpacity
                  key={allergy}
                  className={`px-4 py-2 rounded-full ${
                    selectedAllergies.includes(allergy)
                      ? 'bg-red-500'
                      : 'bg-surface'
                  }`}
                  onPress={() => toggleItem(allergy, selectedAllergies, setSelectedAllergies)}
                >
                  <Text
                    className={selectedAllergies.includes(allergy) ? 'text-white' : 'text-gray-300'}
                  >
                    {allergy}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {error ? (
            <Text className="text-red-500 text-center mb-4">{error}</Text>
          ) : null}

          {/* Finish Button */}
          <TouchableOpacity
            className={`py-4 rounded-xl ${isLoading ? 'bg-primary-700' : 'bg-primary-500'}`}
            onPress={handleFinish}
            disabled={isLoading}
          >
            <Text className="text-white text-center font-semibold text-lg">
              {isLoading ? 'Saving...' : "Let's Go! 🥢"}
            </Text>
          </TouchableOpacity>

          {/* Progress indicator */}
          <View className="flex-row justify-center mt-8 gap-2">
            <View className="w-8 h-2 rounded-full bg-primary-500" />
            <View className="w-8 h-2 rounded-full bg-primary-500" />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
