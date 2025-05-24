import React from 'react';
import { View, ActivityIndicator } from 'react-native';

interface LoadingProps {
  size?: 'small' | 'large';
  color?: string; // Tailwind color class (e.g., "bg-blue-500")
  fullScreen?: boolean;
  className?: string;
}

export const Loading = ({
  size = 'large',
  color = 'text-blue-500', // Default Tailwind blue
  fullScreen = false,
  className = '',
}: LoadingProps) => {
  return (
    <View
      className={`
        flex justify-center items-center
        ${fullScreen ? 'flex-1 bg-white dark:bg-gray-900' : ''}
        ${className}
      `}
    >
      <ActivityIndicator
        size={size}
        className={color} // NativeWind v4+ supports className on ActivityIndicator
        accessibilityLabel="Loading"
      />
    </View>
  );
};