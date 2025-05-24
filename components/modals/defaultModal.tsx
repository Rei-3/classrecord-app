import React from 'react';
import { View, Text} from 'react-native';

interface ModalProps {
  isOpen: boolean;

  title?: string;
  children: React.ReactNode;
}

const DefaultModal: React.FC<ModalProps> = ({ isOpen, title, children }) => {
  if (!isOpen) return null;

  return (
    <View className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <View className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
        {title && <Text className="text-xl font-semibold mb-4">{title}</Text>}
        {children}
      </View>
    </View>
  );
};

export default DefaultModal;
