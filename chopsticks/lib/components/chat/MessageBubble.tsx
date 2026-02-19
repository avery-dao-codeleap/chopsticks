import { View, Text, TouchableOpacity, Image } from 'react-native';
import { format } from 'date-fns';
import { useRouter } from 'expo-router';

interface MessageBubbleProps {
  id: string;
  content: string;
  imageUrl?: string | null;
  senderId: string;
  senderName?: string;
  senderPhotoUrl?: string | null;
  createdAt: string;
  isCurrentUser: boolean;
  onLongPress?: () => void;
}

export function MessageBubble({
  content,
  imageUrl,
  senderId,
  senderName,
  senderPhotoUrl,
  createdAt,
  isCurrentUser,
  onLongPress,
}: MessageBubbleProps) {
  const router = useRouter();

  const formatTime = (timestamp: string) => {
    try {
      return format(new Date(timestamp), 'h:mm a');
    } catch {
      return '';
    }
  };

  const navigateToProfile = () => {
    if (!isCurrentUser) {
      router.push({ pathname: '/(screens)/user-profile', params: { userId: senderId } });
    }
  };

  return (
    <View
      style={{
        flexDirection: 'row',
        alignSelf: isCurrentUser ? 'flex-end' : 'flex-start',
        maxWidth: '85%',
        marginBottom: 10,
      }}
    >
      {/* Avatar for other users */}
      {!isCurrentUser && (
        <TouchableOpacity
          onPress={navigateToProfile}
          style={{ marginRight: 8, alignSelf: 'flex-end' }}
        >
          <View
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: '#262626',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}
          >
            {senderPhotoUrl ? (
              <Image
                source={{ uri: senderPhotoUrl }}
                style={{ width: 32, height: 32 }}
              />
            ) : (
              <Text style={{ color: '#fff', fontSize: 14 }}>
                {senderName?.[0] || '?'}
              </Text>
            )}
          </View>
        </TouchableOpacity>
      )}

      <View style={{ flex: 1, maxWidth: isCurrentUser ? '100%' : undefined }}>
        {/* Sender name for other users */}
        {!isCurrentUser && senderName && (
          <TouchableOpacity onPress={navigateToProfile}>
            <Text
              style={{
                color: '#6b7280',
                fontSize: 11,
                marginBottom: 2,
                marginLeft: 4,
              }}
            >
              {senderName}
            </Text>
          </TouchableOpacity>
        )}

        {/* Message bubble */}
        <TouchableOpacity
          onLongPress={onLongPress}
          activeOpacity={0.7}
          style={{
            backgroundColor: isCurrentUser ? '#f97316' : '#262626',
            borderRadius: 16,
            borderTopRightRadius: isCurrentUser ? 4 : 16,
            borderTopLeftRadius: isCurrentUser ? 16 : 4,
            paddingHorizontal: imageUrl ? 4 : 14,
            paddingVertical: imageUrl ? 4 : 10,
            alignSelf: isCurrentUser ? 'flex-end' : 'flex-start',
          }}
        >
          {imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              style={{
                width: 200,
                height: 200,
                borderRadius: 12,
              }}
              resizeMode="cover"
            />
          ) : (
            <Text style={{ color: '#fff', fontSize: 15 }}>{content}</Text>
          )}
        </TouchableOpacity>

        {/* Timestamp */}
        <Text
          style={{
            color: '#4b5563',
            fontSize: 10,
            marginTop: 2,
            alignSelf: isCurrentUser ? 'flex-end' : 'flex-start',
            marginHorizontal: 4,
          }}
        >
          {formatTime(createdAt)}
        </Text>
      </View>
    </View>
  );
}
