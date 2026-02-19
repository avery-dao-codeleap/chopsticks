import { View, Text, Pressable } from 'react-native';
import { REQUEST_SETTINGS } from '@/lib/constants';

interface GroupSizeSliderProps {
  value: number;
  onChange: (size: number) => void;
}

export function GroupSizeSlider({ value, onChange }: GroupSizeSliderProps) {
  const sizes = Array.from(
    { length: REQUEST_SETTINGS.maxGroupSize - REQUEST_SETTINGS.minGroupSize + 1 },
    (_, i) => i + REQUEST_SETTINGS.minGroupSize
  );

  return (
    <View className="flex-row gap-3">
      {sizes.map((size) => {
        const isSelected = value === size;
        return (
          <Pressable
            key={size}
            onPress={() => onChange(size)}
            className={`flex-1 py-3 rounded-xl border-2 items-center ${
              isSelected
                ? 'bg-primary border-primary'
                : 'bg-card border-border'
            }`}
          >
            <Text className={`text-lg font-bold ${isSelected ? 'text-white' : 'text-gray-300'}`}>
              {size}
            </Text>
            <Text className={`text-xs ${isSelected ? 'text-white/70' : 'text-gray-500'}`}>
              people
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
