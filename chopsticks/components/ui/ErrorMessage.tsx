import { View, Text } from 'react-native';
import { Button } from './Button';

interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export function ErrorMessage({
  title = 'Error',
  message,
  onRetry,
}: ErrorMessageProps) {
  return (
    <View className="flex-1 items-center justify-center bg-background px-6">
      <Text className="text-red-500 text-xl font-bold mb-2">{title}</Text>
      <Text className="text-white text-base text-center mb-6">{message}</Text>
      {onRetry && (
        <Button
          title="Try Again"
          variant="primary"
          onPress={onRetry}
        />
      )}
    </View>
  );
}
