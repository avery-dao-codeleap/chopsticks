import { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, ActivityIndicator, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useI18n } from '@/lib/i18n';

interface ChatInputProps {
  onSendMessage: (content: string) => void;
  onSendImage?: (imageUri: string) => void;
  isSending?: boolean;
  placeholder?: string;
  disabled?: boolean;
  disabledMessage?: string;
}

export function ChatInput({
  onSendMessage,
  onSendImage,
  isSending = false,
  placeholder,
  disabled = false,
  disabledMessage = 'This chat is archived',
}: ChatInputProps) {
  const { t } = useI18n();
  const [text, setText] = useState('');

  const handleSend = () => {
    if (!text.trim() || isSending || disabled) return;
    onSendMessage(text.trim());
    setText('');
  };

  const handlePickImage = async () => {
    if (!onSendImage) return;

    // Request permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'We need access to your photos to send images.');
      return;
    }

    // Pick image
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    if (!result.canceled && result.assets[0]) {
      onSendImage(result.assets[0].uri);
    }
  };

  // Show disabled state for archived chats
  if (disabled) {
    return (
      <View
        style={{
          paddingHorizontal: 16,
          paddingVertical: 16,
          borderTopWidth: 1,
          borderTopColor: '#262626',
          backgroundColor: '#171717',
          alignItems: 'center',
        }}
      >
        <Text style={{ color: '#6b7280', fontSize: 14 }}>
          📦 {disabledMessage}
        </Text>
      </View>
    );
  }

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderTopWidth: 1,
        borderTopColor: '#262626',
        backgroundColor: '#171717',
      }}
    >
      {/* Image picker button */}
      {onSendImage && (
        <TouchableOpacity
          onPress={handlePickImage}
          disabled={isSending}
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: '#262626',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 8,
          }}
        >
          <Text style={{ fontSize: 18 }}>📷</Text>
        </TouchableOpacity>
      )}

      {/* Text input */}
      <TextInput
        value={text}
        onChangeText={setText}
        placeholder={placeholder || t('typeAMessage')}
        placeholderTextColor="#6b7280"
        editable={!isSending}
        style={{
          flex: 1,
          backgroundColor: '#262626',
          borderRadius: 20,
          paddingHorizontal: 16,
          paddingVertical: 10,
          color: '#fff',
          fontSize: 15,
        }}
        onSubmitEditing={handleSend}
        returnKeyType="send"
        multiline
        maxLength={2000}
      />

      {/* Send button */}
      <TouchableOpacity
        onPress={handleSend}
        disabled={!text.trim() || isSending}
        style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: text.trim() && !isSending ? '#f97316' : '#262626',
          alignItems: 'center',
          justifyContent: 'center',
          marginLeft: 8,
        }}
      >
        {isSending ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={{ color: '#fff', fontSize: 16 }}>↑</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}
