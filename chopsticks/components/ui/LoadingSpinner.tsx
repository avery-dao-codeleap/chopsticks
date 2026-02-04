import { ActivityIndicator, View, Text } from 'react-native';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'small' | 'large';
}

export function LoadingSpinner({ message, size = 'large' }: LoadingSpinnerProps) {
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <ActivityIndicator size={size} color="#f97316" />
      {message && (
        <Text className="text-white text-base mt-4">{message}</Text>
      )}
    </View>
  );
}
