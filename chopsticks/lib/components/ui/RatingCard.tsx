import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { PendingRating } from '@/lib/services/api/ratings';

type RatingCardProps = {
  rating: PendingRating;
  onRate: (showedUp: boolean) => void;
  disabled?: boolean;
};

export function RatingCard({ rating, onRate, disabled }: RatingCardProps) {
  const [selected, setSelected] = React.useState<boolean | null>(null);

  const handleRate = (showedUp: boolean) => {
    setSelected(showedUp);
    onRate(showedUp);
  };

  return (
    <View style={{
      backgroundColor: '#171717', borderRadius: 14, padding: 16, marginBottom: 12,
      borderWidth: 1, borderColor: '#262626',
    }}>
      {/* User Info */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
        {rating.rated_photo_url ? (
          <Image
            source={{ uri: rating.rated_photo_url }}
            style={{ width: 50, height: 50, borderRadius: 25, marginRight: 12 }}
          />
        ) : (
          <View style={{
            width: 50, height: 50, borderRadius: 25, backgroundColor: '#262626',
            marginRight: 12, alignItems: 'center', justifyContent: 'center',
          }}>
            <Text style={{ color: '#fff', fontSize: 18, fontWeight: '600' }}>
              {rating.rated_name?.[0]?.toUpperCase() || '?'}
            </Text>
          </View>
        )}
        <View style={{ flex: 1 }}>
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>
            {rating.rated_name || 'Unknown'}
          </Text>
          <Text style={{ color: '#f97316', fontSize: 13, marginTop: 2 }}>
            {rating.restaurant_name}
          </Text>
          <Text style={{ color: '#6b7280', fontSize: 11, marginTop: 2 }}>
            {new Date(rating.time_window).toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
            })}
          </Text>
        </View>
      </View>

      {/* Question */}
      <Text style={{ color: '#9ca3af', fontSize: 13, textAlign: 'center', marginBottom: 12 }}>
        Did they show up?
      </Text>

      {/* Yes/No Buttons */}
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <TouchableOpacity
          onPress={() => handleRate(true)}
          disabled={disabled}
          style={{
            flex: 1, paddingVertical: 12, borderRadius: 10, borderWidth: 2, alignItems: 'center',
            backgroundColor: selected === true ? '#10b98120' : '#262626',
            borderColor: selected === true ? '#10b981' : '#3f3f46',
            opacity: disabled ? 0.5 : 1,
          }}
        >
          <Text style={{
            fontWeight: '600', fontSize: 15,
            color: selected === true ? '#10b981' : '#9ca3af',
          }}>
            ✓ Yes
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleRate(false)}
          disabled={disabled}
          style={{
            flex: 1, paddingVertical: 12, borderRadius: 10, borderWidth: 2, alignItems: 'center',
            backgroundColor: selected === false ? '#ef444420' : '#262626',
            borderColor: selected === false ? '#ef4444' : '#3f3f46',
            opacity: disabled ? 0.5 : 1,
          }}
        >
          <Text style={{
            fontWeight: '600', fontSize: 15,
            color: selected === false ? '#ef4444' : '#9ca3af',
          }}>
            ✗ No
          </Text>
        </TouchableOpacity>
      </View>

      {/* Selected Indicator */}
      {selected !== null && (
        <Text style={{ color: '#6b7280', fontSize: 11, textAlign: 'center', marginTop: 8 }}>
          {selected ? 'Marked as showed up' : 'Marked as no-show'}
        </Text>
      )}
    </View>
  );
}
