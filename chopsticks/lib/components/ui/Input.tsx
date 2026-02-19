import { TextInput, View, Text, TextInputProps } from 'react-native';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerClassName?: string;
}

export function Input({ label, error, containerClassName, ...props }: InputProps) {
  return (
    <View className={containerClassName}>
      {label && (
        <Text className="text-white text-sm font-medium mb-2">{label}</Text>
      )}
      <TextInput
        {...props}
        className={`
          bg-card
          border-2
          ${error ? 'border-red-500' : 'border-border'}
          rounded-xl
          px-4 py-3
          text-white text-base
          placeholder:text-gray-400
        `}
        placeholderTextColor="#9ca3af"
      />
      {error && (
        <Text className="text-red-500 text-sm mt-1">{error}</Text>
      )}
    </View>
  );
}
