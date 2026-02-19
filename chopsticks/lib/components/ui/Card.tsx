import { View, ViewProps } from 'react-native';

interface CardProps extends ViewProps {
  variant?: 'default' | 'elevated';
}

export function Card({ variant = 'default', children, ...props }: CardProps) {
  return (
    <View
      {...props}
      className={`
        bg-card
        rounded-xl
        p-4
        border border-border
        ${variant === 'elevated' ? 'shadow-lg' : ''}
      `}
    >
      {children}
    </View>
  );
}
