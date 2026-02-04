import { View, Image, Text } from 'react-native';

interface AvatarProps {
  uri?: string | null;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Avatar({ uri, name, size = 'md' }: AvatarProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-lg',
    xl: 'text-2xl',
  };

  const initials = name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  if (uri) {
    return (
      <Image
        source={{ uri }}
        className={`${sizeClasses[size]} rounded-full bg-card`}
      />
    );
  }

  return (
    <View
      className={`
        ${sizeClasses[size]}
        rounded-full
        bg-primary
        items-center
        justify-center
      `}
    >
      <Text className={`${textSizeClasses[size]} text-white font-bold`}>
        {initials || '?'}
      </Text>
    </View>
  );
}
