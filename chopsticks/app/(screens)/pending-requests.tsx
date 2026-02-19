import { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert, Image } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useI18n } from '@/lib/i18n';
import { usePendingParticipants, useApproveParticipant, useRejectParticipant } from '@/lib/hooks/queries/useRequests';

export default function PendingRequestsScreen() {
  const { requestId } = useLocalSearchParams<{ requestId: string }>();
  const router = useRouter();
  const { t } = useI18n();

  const { data: pendingParticipants = [], isLoading } = usePendingParticipants(requestId);
  const approveParticipantMutation = useApproveParticipant();
  const rejectParticipantMutation = useRejectParticipant();

  // Filter states
  const [genderFilter, setGenderFilter] = useState<string | null>(null);
  const [personaFilter, setPersonaFilter] = useState<string | null>(null);

  const handleApprove = (participantId: string, userName: string) => {
    Alert.alert(
      'Approve Request',
      `Approve ${userName} to join this meal?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve',
          style: 'default',
          onPress: () => {
            approveParticipantMutation.mutate(
              { participantId, requestId: requestId || '' },
              {
                onSuccess: () => {
                  Alert.alert('Success', `${userName} has been approved!`);
                },
                onError: (error) => {
                  Alert.alert('Error', 'Failed to approve participant. Please try again.');
                  console.error('Approve error:', error);
                },
              }
            );
          },
        },
      ]
    );
  };

  const handleReject = (participantId: string, userName: string) => {
    Alert.alert(
      'Reject Request',
      `Reject ${userName}'s request to join?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: () => {
            rejectParticipantMutation.mutate(
              { participantId, requestId: requestId || '' },
              {
                onSuccess: () => {
                  Alert.alert('Rejected', `${userName}'s request has been rejected.`);
                },
                onError: (error) => {
                  Alert.alert('Error', 'Failed to reject participant. Please try again.');
                  console.error('Reject error:', error);
                },
              }
            );
          },
        },
      ]
    );
  };

  const navigateToProfile = (userId: string) => {
    router.push({ pathname: '/(screens)/user-profile', params: { userId } });
  };

  // Apply filters
  const filteredParticipants = pendingParticipants.filter((p) => {
    if (genderFilter && p.users?.gender !== genderFilter) return false;
    if (personaFilter && p.users?.persona !== personaFilter) return false;
    return true;
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0a0a0a' }} edges={['left', 'right']}>
      <Stack.Screen
        options={{
          headerTitle: 'Pending Requests',
          headerBackTitle: 'Back',
        }}
      />

      {/* Filters */}
      {pendingParticipants.length > 3 && (
        <View style={{ paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#262626' }}>
          <Text style={{ color: '#9ca3af', fontSize: 12, marginBottom: 8 }}>
            Filter by:
          </Text>
          <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
            {['male', 'female', 'non-binary'].map((gender) => (
              <TouchableOpacity
                key={gender}
                onPress={() => setGenderFilter(genderFilter === gender ? null : gender)}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 16,
                  backgroundColor: genderFilter === gender ? '#f97316' : '#262626',
                }}
              >
                <Text style={{ color: '#fff', fontSize: 12 }}>
                  {gender.charAt(0).toUpperCase() + gender.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {isLoading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color="#f97316" />
        </View>
      ) : filteredParticipants.length > 0 ? (
        <>
          <View style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
            <Text style={{ color: '#9ca3af', fontSize: 13 }}>
              {filteredParticipants.length} pending {filteredParticipants.length === 1 ? 'request' : 'requests'}
            </Text>
          </View>
          <FlatList
            data={filteredParticipants}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
            renderItem={({ item }) => {
              const user = item.users;
              return (
                <View
                  style={{
                    backgroundColor: '#171717',
                    borderRadius: 14,
                    padding: 16,
                    marginBottom: 12,
                  }}
                >
                  {/* User Info */}
                  <TouchableOpacity
                    onPress={() => navigateToProfile(item.user_id)}
                    style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}
                  >
                    <View
                      style={{
                        width: 60,
                        height: 60,
                        borderRadius: 30,
                        backgroundColor: '#262626',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: 12,
                        overflow: 'hidden',
                      }}
                    >
                      {user?.photo_url ? (
                        <Image
                          source={{ uri: user.photo_url }}
                          style={{ width: 60, height: 60 }}
                        />
                      ) : (
                        <Text style={{ color: '#fff', fontSize: 24 }}>
                          {user?.name?.[0] || '?'}
                        </Text>
                      )}
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>
                        {user?.name || 'Unknown'}
                      </Text>
                      <Text style={{ color: '#9ca3af', fontSize: 13, marginTop: 2 }}>
                        {user?.age} • {user?.gender} • {user?.persona}
                      </Text>
                      <Text style={{ color: '#f97316', fontSize: 13, marginTop: 2 }}>
                        🍽️ {user?.meal_count || 0} meals
                      </Text>
                    </View>

                    <Text style={{ color: '#4b5563', fontSize: 20 }}>›</Text>
                  </TouchableOpacity>

                  {/* Bio */}
                  {user?.bio && (
                    <Text
                      style={{
                        color: '#9ca3af',
                        fontSize: 14,
                        marginBottom: 16,
                        fontStyle: 'italic',
                      }}
                      numberOfLines={2}
                    >
                      "{user.bio}"
                    </Text>
                  )}

                  {/* Actions */}
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <TouchableOpacity
                      onPress={() => handleReject(item.id, user?.name || 'User')}
                      disabled={rejectParticipantMutation.isPending || approveParticipantMutation.isPending}
                      style={{
                        flex: 1,
                        backgroundColor: '#262626',
                        borderRadius: 10,
                        paddingVertical: 12,
                        alignItems: 'center',
                      }}
                    >
                      <Text style={{ color: '#fff', fontWeight: '600' }}>
                        {rejectParticipantMutation.isPending ? 'Rejecting...' : 'Reject'}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => handleApprove(item.id, user?.name || 'User')}
                      disabled={rejectParticipantMutation.isPending || approveParticipantMutation.isPending}
                      style={{
                        flex: 1,
                        backgroundColor: '#f97316',
                        borderRadius: 10,
                        paddingVertical: 12,
                        alignItems: 'center',
                      }}
                    >
                      <Text style={{ color: '#fff', fontWeight: '700' }}>
                        {approveParticipantMutation.isPending ? 'Approving...' : 'Approve'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            }}
          />
        </>
      ) : (
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 32,
          }}
        >
          <Text style={{ fontSize: 48, marginBottom: 16 }}>✅</Text>
          <Text
            style={{
              color: '#fff',
              fontSize: 20,
              fontWeight: '600',
              textAlign: 'center',
            }}
          >
            {t('noPendingRequests') || 'No pending requests'}
          </Text>
          <Text
            style={{
              color: '#6b7280',
              textAlign: 'center',
              marginTop: 8,
              fontSize: 14,
            }}
          >
            {t('noPendingRequestsDescription') || 'All join requests have been handled'}
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}
