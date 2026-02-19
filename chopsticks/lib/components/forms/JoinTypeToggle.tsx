import { View, Text, Pressable } from 'react-native';
import { JOIN_TYPES } from '@/lib/constants';

interface JoinTypeToggleProps {
  value: 'open' | 'approval';
  onChange: (type: 'open' | 'approval') => void;
}

export function JoinTypeToggle({ value, onChange }: JoinTypeToggleProps) {
  return (
    <View className="flex-row gap-3">
      {JOIN_TYPES.map((type) => {
        const isSelected = value === type.id;
        return (
          <Pressable
            key={type.id}
            onPress={() => onChange(type.id as 'open' | 'approval')}
            className={`flex-1 px-4 py-3 rounded-xl border-2 ${
              isSelected
                ? 'bg-primary border-primary'
                : 'bg-card border-border'
            }`}
          >
            <Text
              className={`font-semibold text-center ${
                isSelected ? 'text-white' : 'text-gray-300'
              }`}
            >
              {type.label}
            </Text>
            <Text
              className={`text-xs text-center mt-1 ${
                isSelected ? 'text-white/70' : 'text-gray-500'
              }`}
            >
              {type.description}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
