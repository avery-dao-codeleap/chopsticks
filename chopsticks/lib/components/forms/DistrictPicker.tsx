import { View, Text, Pressable, ScrollView } from 'react-native';
import { HCMC_DISTRICTS } from '@/lib/constants';

interface DistrictPickerProps {
  selected: string | null;
  onSelect: (districtId: string) => void;
}

export function DistrictPicker({ selected, onSelect }: DistrictPickerProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View className="flex-row gap-2">
        {HCMC_DISTRICTS.map((district) => {
          const isSelected = selected === district.id;
          return (
            <Pressable
              key={district.id}
              onPress={() => onSelect(district.id)}
              className={`px-4 py-2 rounded-full border-2 ${
                isSelected
                  ? 'bg-primary border-primary'
                  : 'bg-card border-border'
              }`}
            >
              <Text
                className={`text-sm font-medium ${
                  isSelected ? 'text-white' : 'text-gray-300'
                }`}
              >
                {district.name}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}
