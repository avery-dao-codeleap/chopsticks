import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Modal, TextInput, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { CUISINE_CATEGORIES, BUDGET_RANGES, HCMC_DISTRICTS } from '@/lib/constants';
import { useRequest, useJoinRequest, useCancelRequest, useCancelJoinRequest, usePendingParticipants, useApproveParticipant, useRejectParticipant } from '@/hooks/queries/useRequests';
import { useAuthStore } from '@/stores/auth';
import { useI18n } from '@/lib/i18n';
import { getMealStatus } from '@/lib/mealStatus';

const CUISINE_EMOJIS: Record<string, string> = {
  noodles_congee: '🍜', rice: '🍚', hotpot_grill: '🍲', seafood: '🦐',
  bread: '🥖', vietnamese_cakes: '🍰', snack: '🍿', dessert: '🍨',
  drinks: '🧋', fast_food: '🍔', international: '🌍', healthy: '🥗',
  veggie: '🥦', others: '🍽️',
};

function formatTimeWindow(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const dayStr = isToday ? 'Today' : 'Tomorrow';
  const timeStr = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  return `${dayStr}, ${timeStr}`;
}

export default function RequestDetailScreen() {
  const { requestId } = useLocalSearchParams<{ requestId: string }>();
  const router = useRouter();
  const { t, language } = useI18n();
  const session = useAuthStore(state => state.session);

  const { data: request, isLoading } = useRequest(requestId);
  const joinRequest = useJoinRequest();
  const cancelRequest = useCancelRequest();
  const cancelJoinRequest = useCancelJoinRequest();
  const { data: pendingParticipants = [], isLoading: loadingPending } = usePendingParticipants(requestId);
  const approveParticipant = useApproveParticipant();
  const rejectParticipant = useRejectParticipant();

  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinMessage, setJoinMessage] = useState('');
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  if (isLoading || !request) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0a0a0a', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#f97316" />
      </View>
    );
  }

  const { restaurants: restaurant, users: requester } = request;
  const isOwner = session?.user?.id === request.requester_id;
  const userStatus = 'user_status' in request ? request.user_status : 'none';
  const hasAlreadyJoined = userStatus === 'joined' || userStatus === 'pending';
  const spotsLeft = request.group_size - request.participant_count - 1; // -1 for the requester
  const cuisineEmoji = CUISINE_EMOJIS[request.cuisine] ?? '🍽️';
  const cuisineCat = CUISINE_CATEGORIES.find(c => c.id === request.cuisine);
  const cuisineLabel = cuisineCat ? (language === 'vi' ? cuisineCat.labelVi : cuisineCat.label) : request.cuisine;
  const budgetCat = BUDGET_RANGES.find(b => b.id === request.budget_range);
  const budgetLabel = budgetCat ? (language === 'vi' ? budgetCat.labelVi : budgetCat.label) : request.budget_range;

  // Map district ID to display name for approval requests
  const district = HCMC_DISTRICTS.find(d => d.id === restaurant.district);
  const districtLabel = district ? (language === 'vi' ? district.nameVi : district.name) : restaurant.district;

  // Calculate meal status (active, completed, archived)
  const mealCompletedAt = 'meal_completed_at' in request ? (request as any).meal_completed_at : null;
  const mealStatus = getMealStatus(request.time_window, mealCompletedAt, isOwner);

  const handleJoin = async () => {
    if (!session?.user?.id) return;

    if (request.join_type === 'open') {
      // Show confirmation dialog for open join (CSX-181)
      Alert.alert(
        'Join this meal?',
        `Join ${restaurant.name} at ${new Date(request.time_window).toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit'
        })}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Yes, Join',
            onPress: async () => {
              try {
                await joinRequest.mutateAsync({
                  requestId: request.id,
                  userId: session.user.id,
                  joinType: 'open',
                });
                Alert.alert(t('joinedTitle'), t('joinedBody', { name: restaurant.name }), [
                  { text: 'OK', onPress: () => router.back() },
                ]);
              } catch (error) {
                console.error('Join request error:', error);
                Alert.alert('Error', `Failed to join: ${error instanceof Error ? error.message : 'You may have already joined.'}`);
              }
            },
          },
        ]
      );
    } else {
      setShowJoinModal(true);
    }
  };

  const handleSendJoinRequest = async () => {
    if (!session?.user?.id) return;
    if (!joinMessage.trim()) {
      Alert.alert(t('sayAnything'), t('tellSomethingInteresting'));
      return;
    }

    try {
      await joinRequest.mutateAsync({
        requestId: request.id,
        userId: session.user.id,
        joinType: 'approval',
      });
      setShowJoinModal(false);
      setJoinMessage('');
      Alert.alert(t('requestSent'), t('requestSentBody', { name: requester?.name ?? '' }));
    } catch (error) {
      console.error('Send join request error:', error);
      Alert.alert('Error', `Failed to send request: ${error instanceof Error ? error.message : 'You may have already requested.'}`);
    }
  };

  const handleCancelRequest = async () => {
    try {
      await cancelRequest.mutateAsync(request.id);
      setShowCancelConfirm(false);
      Alert.alert('Request Cancelled', 'Your meal request has been cancelled and removed.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to cancel request. Please try again.');
    }
  };

  const handleCancelJoinRequest = async () => {
    Alert.alert(
      'Cancel your request?',
      `Cancel your request to join ${restaurant.name}?`,
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              await cancelJoinRequest.mutateAsync(request.id);
              Alert.alert('Request Cancelled', 'Your join request has been cancelled.', [
                { text: 'OK', onPress: () => router.back() },
              ]);
            } catch (error) {
              Alert.alert('Error', 'Failed to cancel request. Please try again.');
            }
          },
        },
      ]
    );
  };

  return (
    <>
      <ScrollView style={{ flex: 1, backgroundColor: '#0a0a0a' }}>
        {/* Restaurant header */}
        <View style={{ height: 180, backgroundColor: '#171717', alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: 56 }}>{cuisineEmoji}</Text>
          <Text style={{ color: '#6b7280', fontSize: 13, marginTop: 8 }}>{cuisineLabel} · {budgetLabel}</Text>
        </View>

        <View style={{ padding: 20 }}>
          {/* Restaurant info */}
          <Text style={{ color: '#fff', fontSize: 22, fontWeight: '700' }}>
            {isOwner || userStatus === 'joined' ? restaurant.name : (request.join_type === 'approval' ? districtLabel : restaurant.name)}
          </Text>
          <Text style={{ color: '#9ca3af', fontSize: 14, marginTop: 4 }}>
            {isOwner || userStatus === 'joined'
              ? restaurant.address
              : (request.join_type === 'approval' ? `📍 Area only (full address shared after approval)` : restaurant.address)
            }
          </Text>

          <View style={{ height: 1, backgroundColor: '#262626', marginVertical: 20 }} />

          {/* Requester profile */}
          <TouchableOpacity
            onPress={() => { if (!isOwner && requester?.id) router.push({ pathname: '/(screens)/user-profile', params: { userId: requester.id } }); }}
            activeOpacity={isOwner ? 1 : 0.7}
            style={{ flexDirection: 'row', alignItems: 'center' }}
          >
            <View style={{
              width: 52, height: 52, borderRadius: 26,
              backgroundColor: '#262626', alignItems: 'center', justifyContent: 'center', marginRight: 14,
            }}>
              <Text style={{ fontSize: 22, color: '#fff' }}>{requester?.name?.[0] ?? '?'}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ color: '#fff', fontSize: 17, fontWeight: '600' }}>
                  {requester?.name ?? 'Unknown'}{requester?.age ? `, ${requester.age}` : ''}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, flexWrap: 'wrap', gap: 6 }}>
                {requester?.persona && (
                  <View style={{ backgroundColor: requester.persona === 'local' ? '#16a34a20' : '#8b5cf620', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 }}>
                    <Text style={{ color: requester.persona === 'local' ? '#4ade80' : '#a78bfa', fontSize: 11, fontWeight: '600' }}>
                      {requester.persona === 'local' ? '📍 Local' : `✈️ ${requester.persona.charAt(0).toUpperCase() + requester.persona.slice(1)}`}
                    </Text>
                  </View>
                )}
                <Text style={{ color: '#6b7280', fontSize: 12 }}>🍜 {requester?.meal_count ?? 0} meals</Text>
              </View>
            </View>
            {!isOwner && <Text style={{ color: '#4b5563', fontSize: 18 }}>›</Text>}
          </TouchableOpacity>

          {/* Requester bio */}
          <Text style={{ color: '#9ca3af', fontSize: 13, marginTop: 12, fontStyle: 'italic' }}>
            "{requester?.bio || t('noBioYet')}"
          </Text>

          <View style={{ height: 1, backgroundColor: '#262626', marginVertical: 20 }} />

          {/* Pending participants — owner only, approval-type only */}
          {isOwner && request.join_type === 'approval' && (
            <>
              <View style={{
                backgroundColor: pendingParticipants.length > 0 ? '#171717' : '#0a0a0a',
                borderRadius: 12,
                padding: 14,
                borderWidth: 1,
                borderColor: pendingParticipants.length > 0 ? '#f97316' : '#262626',
              }}>
                <Text style={{
                  color: pendingParticipants.length > 0 ? '#f97316' : '#6b7280',
                  fontSize: 12,
                  fontWeight: '600',
                  marginBottom: pendingParticipants.length > 0 ? 12 : 0,
                }}>
                  {pendingParticipants.length > 0
                    ? `🔔 ${pendingParticipants.length} Pending Request${pendingParticipants.length !== 1 ? 's' : ''}`
                    : '⏳ No pending requests yet'
                  }
                </Text>
                {pendingParticipants.length > 0 && pendingParticipants.map((participant) => (
                  <View key={participant.id} style={{ marginBottom: 12 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                      <View style={{
                        width: 40, height: 40, borderRadius: 20,
                        backgroundColor: '#262626', alignItems: 'center', justifyContent: 'center', marginRight: 10,
                      }}>
                        <Text style={{ fontSize: 18, color: '#fff' }}>{participant.users.name?.[0] ?? '?'}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: '#fff', fontSize: 15, fontWeight: '600' }}>
                          {participant.users.name ?? 'Unknown'}{participant.users.age ? `, ${participant.users.age}` : ''}
                        </Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2, gap: 6 }}>
                          {participant.users.persona && (
                            <Text style={{ color: '#6b7280', fontSize: 11 }}>
                              {participant.users.persona === 'local' ? '📍 Local' : `✈️ ${participant.users.persona.charAt(0).toUpperCase() + participant.users.persona.slice(1)}`}
                            </Text>
                          )}
                          <Text style={{ color: '#6b7280', fontSize: 11 }}>🍜 {participant.users.meal_count ?? 0} meals</Text>
                        </View>
                      </View>
                    </View>
                    {participant.users.bio && (
                      <Text style={{ color: '#9ca3af', fontSize: 12, fontStyle: 'italic', marginBottom: 8 }}>
                        "{participant.users.bio}"
                      </Text>
                    )}
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      <TouchableOpacity
                        onPress={async () => {
                          try {
                            await approveParticipant.mutateAsync({ participantId: participant.id, requestId: request.id });
                            Alert.alert('Approved', `${participant.users.name} has been added to your meal!`);
                          } catch (error) {
                            Alert.alert('Error', 'Failed to approve participant.');
                          }
                        }}
                        disabled={approveParticipant.isPending}
                        style={{
                          flex: 1, backgroundColor: '#10b981', borderRadius: 8, paddingVertical: 8, alignItems: 'center',
                          opacity: approveParticipant.isPending ? 0.5 : 1,
                        }}
                      >
                        <Text style={{ color: '#fff', fontSize: 13, fontWeight: '600' }}>
                          {approveParticipant.isPending ? 'Approving...' : 'Approve'}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={async () => {
                          Alert.alert(
                            'Reject Request',
                            `Reject ${participant.users.name}'s request to join?`,
                            [
                              { text: 'Cancel', style: 'cancel' },
                              {
                                text: 'Reject',
                                style: 'destructive',
                                onPress: async () => {
                                  try {
                                    await rejectParticipant.mutateAsync({ participantId: participant.id, requestId: request.id });
                                    Alert.alert('Rejected', 'Join request has been rejected.');
                                  } catch (error) {
                                    Alert.alert('Error', 'Failed to reject participant.');
                                  }
                                },
                              },
                            ]
                          );
                        }}
                        disabled={rejectParticipant.isPending}
                        style={{
                          flex: 1, backgroundColor: '#262626', borderRadius: 8, paddingVertical: 8, alignItems: 'center',
                          borderWidth: 1, borderColor: '#ef4444',
                          opacity: rejectParticipant.isPending ? 0.5 : 1,
                        }}
                      >
                        <Text style={{ color: '#ef4444', fontSize: 13, fontWeight: '600' }}>
                          {rejectParticipant.isPending ? 'Rejecting...' : 'Reject'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
              <View style={{ height: 1, backgroundColor: '#262626', marginVertical: 20 }} />
            </>
          )}


          {/* Request description */}
          {request.description && (
            <>
              <View style={{ backgroundColor: '#171717', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#262626' }}>
                <Text style={{ color: '#9ca3af', fontSize: 12, fontWeight: '600', marginBottom: 6 }}>
                  💬 About this meal
                </Text>
                <Text style={{ color: '#fff', fontSize: 14, lineHeight: 20 }}>
                  {request.description}
                </Text>
              </View>
              <View style={{ height: 1, backgroundColor: '#262626', marginVertical: 20 }} />
            </>
          )}

          {/* Meal details */}
          <View style={{ gap: 14 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: '#9ca3af', fontSize: 14 }}>{t('time')}</Text>
              <Text style={{ color: '#fff', fontSize: 14, fontWeight: '500' }}>{formatTimeWindow(request.time_window)}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: '#9ca3af', fontSize: 14 }}>{t('spots')}</Text>
              <Text style={{ color: '#f97316', fontSize: 14, fontWeight: '500' }}>
                {spotsLeft}/{request.group_size} {t('available')}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: '#9ca3af', fontSize: 14 }}>{t('joinType')}</Text>
              <Text style={{ color: '#fff', fontSize: 14, fontWeight: '500' }}>
                {request.join_type === 'open' ? t('openInstantJoin') : t('approvalRequired')}
              </Text>
            </View>
          </View>

          {/* Join button — non-owner only */}
          {!isOwner && userStatus === 'pending' && (
            <>
              <View style={{
                backgroundColor: '#eab308', borderRadius: 14,
                paddingVertical: 16, alignItems: 'center', marginTop: 28,
              }}>
                <Text style={{ color: '#fff', fontSize: 17, fontWeight: '600' }}>⏳ Request Pending</Text>
                <Text style={{ color: '#fff', fontSize: 13, marginTop: 4, opacity: 0.9 }}>
                  Waiting for {requester?.name ?? 'creator'} to approve
                </Text>
              </View>
              <TouchableOpacity
                onPress={handleCancelJoinRequest}
                disabled={cancelJoinRequest.isPending}
                style={{
                  backgroundColor: '#262626', borderRadius: 14, borderWidth: 1, borderColor: '#ef4444',
                  paddingVertical: 14, alignItems: 'center', marginTop: 12,
                  opacity: cancelJoinRequest.isPending ? 0.5 : 1,
                }}
              >
                <Text style={{ color: '#ef4444', fontSize: 15, fontWeight: '600' }}>
                  {cancelJoinRequest.isPending ? 'Cancelling...' : 'Cancel Request'}
                </Text>
              </TouchableOpacity>
            </>
          )}

          {!isOwner && userStatus === 'joined' && (
            <View style={{
              backgroundColor: '#10b981', borderRadius: 14,
              paddingVertical: 16, alignItems: 'center', marginTop: 28,
            }}>
              <Text style={{ color: '#fff', fontSize: 17, fontWeight: '600' }}>Already Joined</Text>
            </View>
          )}

          {!isOwner && userStatus === 'none' && spotsLeft > 0 && (
            <TouchableOpacity
              onPress={handleJoin}
              disabled={joinRequest.isPending}
              style={{
                backgroundColor: '#f97316', borderRadius: 14,
                paddingVertical: 16, alignItems: 'center', marginTop: 28,
                opacity: joinRequest.isPending ? 0.5 : 1,
              }}
            >
              <Text style={{ color: '#fff', fontSize: 17, fontWeight: '700' }}>
                {joinRequest.isPending ? 'Joining...' : request.join_type === 'open' ? t('joinMeal') : t('requestToJoin')}
              </Text>
            </TouchableOpacity>
          )}

          {!isOwner && spotsLeft <= 0 && userStatus === 'none' && (
            <View style={{
              backgroundColor: '#262626', borderRadius: 14,
              paddingVertical: 16, alignItems: 'center', marginTop: 28,
            }}>
              <Text style={{ color: '#6b7280', fontSize: 17, fontWeight: '600' }}>Full</Text>
            </View>
          )}

          {/* Cancel button — owner only */}
          {isOwner && (
            <TouchableOpacity
              onPress={() => setShowCancelConfirm(true)}
              style={{
                backgroundColor: '#262626', borderRadius: 14, borderWidth: 1, borderColor: '#ef4444',
                paddingVertical: 16, alignItems: 'center', marginTop: 28,
              }}
            >
              <Text style={{ color: '#ef4444', fontSize: 17, fontWeight: '600' }}>Cancel Request</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* Approval join message modal */}
      <Modal visible={showJoinModal} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: '#171717', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24 }}>
            <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 6 }}>
              {t('requestToJoinTitle')}
            </Text>
            <Text style={{ color: '#6b7280', fontSize: 13, marginBottom: 16 }}>
              {t('tellThemAboutYou', { name: requester?.name ?? '', cuisine: cuisineLabel })}
            </Text>
            <TextInput
              value={joinMessage}
              onChangeText={setJoinMessage}
              placeholder={t('joinMessagePlaceholder')}
              placeholderTextColor="#4b5563"
              multiline numberOfLines={3}
              style={{
                backgroundColor: '#262626', borderRadius: 12, padding: 14,
                color: '#fff', fontSize: 15, minHeight: 100, textAlignVertical: 'top',
                marginBottom: 16,
              }}
            />
            <TouchableOpacity
              onPress={handleSendJoinRequest}
              disabled={joinRequest.isPending}
              style={{
                backgroundColor: '#f97316', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginBottom: 8,
                opacity: joinRequest.isPending ? 0.5 : 1,
              }}
            >
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>
                {joinRequest.isPending ? 'Sending...' : t('sendRequest')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => { setShowJoinModal(false); setJoinMessage(''); }}
              style={{ paddingVertical: 12, alignItems: 'center' }}
            >
              <Text style={{ color: '#6b7280', fontSize: 15 }}>{t('cancel')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Cancel confirmation modal */}
      <Modal visible={showCancelConfirm} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <View style={{ backgroundColor: '#171717', borderRadius: 16, padding: 24, maxWidth: 340, width: '100%' }}>
            <Text style={{ color: '#fff', fontSize: 20, fontWeight: '700', marginBottom: 8 }}>
              Cancel this request?
            </Text>
            <Text style={{ color: '#9ca3af', fontSize: 14, lineHeight: 20, marginBottom: 20 }}>
              This will permanently cancel your meal request. {request.participant_count > 0 && 'All participants will be notified.'}
            </Text>
            <TouchableOpacity
              onPress={handleCancelRequest}
              disabled={cancelRequest.isPending}
              style={{
                backgroundColor: '#ef4444', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginBottom: 10,
                opacity: cancelRequest.isPending ? 0.5 : 1,
              }}
            >
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>
                {cancelRequest.isPending ? 'Cancelling...' : 'Yes, Cancel Request'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setShowCancelConfirm(false)}
              style={{ paddingVertical: 12, alignItems: 'center' }}
            >
              <Text style={{ color: '#9ca3af', fontSize: 15 }}>Keep Request</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}
