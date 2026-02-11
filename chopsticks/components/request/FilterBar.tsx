import { View, Text, ScrollView, TouchableOpacity } from 'react-native';

interface FilterSectionProps {
  title: string;
  options: { id: string; label: string }[];
  active: string;
  onSelect: (id: string) => void;
}

export function FilterSection({ title, options, active, onSelect }: FilterSectionProps) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ color: '#9ca3af', fontSize: 12, fontWeight: '600', marginBottom: 8, marginLeft: 4 }}>
        {title}
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {options.map(option => (
          <TouchableOpacity
            key={option.id}
            onPress={() => onSelect(option.id)}
            style={{
              paddingHorizontal: 14,
              paddingVertical: 8,
              borderRadius: 20,
              marginRight: 8,
              backgroundColor: active === option.id ? '#f97316' : '#262626',
            }}
          >
            <Text style={{ color: active === option.id ? '#fff' : '#9ca3af', fontSize: 13, fontWeight: '500' }}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

interface MultiSelectFilterSectionProps {
  title: string;
  options: { id: string; label: string }[];
  selected: string[];
  onToggle: (id: string) => void;
}

export function MultiSelectFilterSection({ title, options, selected, onToggle }: MultiSelectFilterSectionProps) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ color: '#9ca3af', fontSize: 12, fontWeight: '600', marginBottom: 8, marginLeft: 4 }}>
        {title} {selected.length > 0 && `(${selected.length})`}
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {options.map(option => {
          const isSelected = selected.includes(option.id);
          const isAll = option.id === '__all__';

          return (
            <TouchableOpacity
              key={option.id}
              onPress={() => onToggle(option.id)}
              style={{
                paddingHorizontal: 14,
                paddingVertical: 8,
                borderRadius: 20,
                marginRight: 8,
                backgroundColor: isSelected ? '#f97316' : '#262626',
                borderWidth: isSelected ? 0 : 1,
                borderColor: '#404040',
              }}
            >
              <Text style={{ color: isSelected ? '#fff' : '#9ca3af', fontSize: 13, fontWeight: '500' }}>
                {isAll && !isSelected && selected.length > 0 ? '•' : ''} {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}
