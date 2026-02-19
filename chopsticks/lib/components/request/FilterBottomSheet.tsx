import { View, Text, TouchableOpacity } from 'react-native';
import { BottomSheet } from '@/lib/components/ui/BottomSheet';

interface FilterOption {
  id: string;
  label: string;
}

interface FilterBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  options: FilterOption[];
  selected: string[];
  onToggle: (id: string) => void;
  multiSelect?: boolean;
}

export function FilterBottomSheet({
  visible,
  onClose,
  title,
  options,
  selected,
  onToggle,
  multiSelect = true,
}: FilterBottomSheetProps) {
  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title={title}
      showApply={true}
      applyLabel="Apply"
    >
      {/* Clear all button */}
      {multiSelect && selected.length > 0 && !selected.includes('__all__') && (
        <TouchableOpacity
          onPress={() => onToggle('__all__')}
          style={{
            paddingVertical: 8,
            marginBottom: 12,
          }}
        >
          <Text style={{ color: '#f97316', fontSize: 14, fontWeight: '600' }}>
            Clear all
          </Text>
        </TouchableOpacity>
      )}

      {/* Options grid with color variety */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -4, marginVertical: -4 }}>
        {options.map((option, index) => {
          const isSelected = selected.includes(option.id);
          const isAll = option.id === '__all__';

          // Color palette for variety (rotate through colors)
          const colors = ['#f97316', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b'];
          const bgColor = isSelected
            ? colors[index % colors.length]
            : '#262626';
          const borderColor = isSelected
            ? colors[index % colors.length]
            : '#404040';

          return (
            <TouchableOpacity
              key={option.id}
              onPress={() => onToggle(option.id)}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 12,
                borderRadius: 20,
                backgroundColor: bgColor,
                borderWidth: 1,
                borderColor: borderColor,
                alignItems: 'center',
                justifyContent: 'center',
                margin: 4,
              }}
            >
              <Text
                style={{
                  color: isSelected ? '#fff' : '#9ca3af',
                  fontSize: 14,
                  fontWeight: isSelected ? '600' : '500',
                }}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Selection summary */}
      {multiSelect && selected.length > 0 && !selected.includes('__all__') && (
        <View style={{ marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#262626' }}>
          <Text style={{ color: '#6b7280', fontSize: 13 }}>
            {selected.length} selected
          </Text>
        </View>
      )}
    </BottomSheet>
  );
}
