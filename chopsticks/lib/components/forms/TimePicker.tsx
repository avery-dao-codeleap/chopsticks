import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, Alert } from 'react-native';

interface TimePickerProps {
  value: Date | null;
  onChange: (date: Date) => void;
  isAsap: boolean;
  onToggleAsap: (asap: boolean) => void;
}

const MINUTES = ['00', '15', '30', '45'];
const HOURS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
const PERIODS = ['AM', 'PM'];

function formatTime(date: Date): string {
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const dayStr = isToday ? 'Today' : 'Tomorrow';
  const timeStr = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
  return `${dayStr}, ${timeStr}`;
}

function validateTime(date: Date): { valid: boolean; message?: string } {
  const now = new Date();
  const oneHourFromNow = new Date(now.getTime() + 65 * 60 * 1000);
  const twentyFourHoursFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  if (date < oneHourFromNow) {
    return {
      valid: false,
      message: 'Time must be at least 1 hour from now. Please select ASAP for immediate meals.'
    };
  }

  if (date > twentyFourHoursFromNow) {
    return {
      valid: false,
      message: 'Time must be within 24 hours from now.'
    };
  }

  return { valid: true };
}

export function TimePicker({ value, onChange, isAsap, onToggleAsap }: TimePickerProps) {
  const [showPicker, setShowPicker] = useState(false);

  // Picker state
  const [selectedDay, setSelectedDay] = useState<'today' | 'tomorrow'>('today');
  const [selectedHour, setSelectedHour] = useState('12');
  const [selectedMinute, setSelectedMinute] = useState('00');
  const [selectedPeriod, setSelectedPeriod] = useState<'AM' | 'PM'>('PM');

  // Initialize picker with current value or smart default
  useEffect(() => {
    if (value) {
      const now = new Date();
      const isToday = value.toDateString() === now.toDateString();
      setSelectedDay(isToday ? 'today' : 'tomorrow');

      let hours = value.getHours();
      const isPM = hours >= 12;
      if (hours > 12) hours -= 12;
      if (hours === 0) hours = 12;

      setSelectedHour(hours.toString());
      setSelectedMinute(value.getMinutes().toString().padStart(2, '0'));
      setSelectedPeriod(isPM ? 'PM' : 'AM');
    } else {
      // Smart default: round to next 15-min interval, at least 1 hour 5 min from now
      const now = new Date();
      const oneHourFromNow = new Date(now.getTime() + 65 * 60 * 1000);

      // Round up to next 15-min mark
      const minutes = oneHourFromNow.getMinutes();
      const roundedMinutes = Math.ceil(minutes / 15) * 15;
      oneHourFromNow.setMinutes(roundedMinutes, 0, 0);

      // If we rolled over to next hour
      if (roundedMinutes >= 60) {
        oneHourFromNow.setHours(oneHourFromNow.getHours() + 1);
        oneHourFromNow.setMinutes(0, 0, 0);
      }

      const isToday = oneHourFromNow.toDateString() === now.toDateString();
      setSelectedDay(isToday ? 'today' : 'tomorrow');

      let hours = oneHourFromNow.getHours();
      const isPM = hours >= 12;
      if (hours > 12) hours -= 12;
      if (hours === 0) hours = 12;

      setSelectedHour(hours.toString());
      setSelectedMinute(oneHourFromNow.getMinutes().toString().padStart(2, '0'));
      setSelectedPeriod(isPM ? 'PM' : 'AM');
    }
  }, [value, showPicker]);

  const handleConfirm = () => {
    const now = new Date();
    const baseDate = selectedDay === 'today' ? new Date() : new Date(now.getTime() + 24 * 60 * 60 * 1000);

    let hours = parseInt(selectedHour);
    if (selectedPeriod === 'PM' && hours !== 12) hours += 12;
    if (selectedPeriod === 'AM' && hours === 12) hours = 0;

    baseDate.setHours(hours);
    baseDate.setMinutes(parseInt(selectedMinute));
    baseDate.setSeconds(0);
    baseDate.setMilliseconds(0);

    const validation = validateTime(baseDate);
    if (!validation.valid) {
      Alert.alert('Invalid Time', validation.message);
      return;
    }

    onChange(baseDate);
    setShowPicker(false);
  };

  const handlePickTime = () => {
    onToggleAsap(false);
    setShowPicker(true);
  };

  return (
    <View>
      {/* Main buttons */}
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
        <TouchableOpacity
          onPress={() => onToggleAsap(true)}
          style={{
            flex: 1,
            paddingVertical: 12,
            paddingHorizontal: 16,
            borderRadius: 10,
            backgroundColor: isAsap ? '#f97316' : '#171717',
            borderWidth: 1,
            borderColor: isAsap ? '#f97316' : '#262626',
            alignItems: 'center',
          }}
        >
          <Text style={{
            color: isAsap ? '#fff' : '#9ca3af',
            fontSize: 14,
            fontWeight: '600'
          }}>
            ⚡ ASAP
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handlePickTime}
          style={{
            flex: 1,
            paddingVertical: 12,
            paddingHorizontal: 16,
            borderRadius: 10,
            backgroundColor: !isAsap && value ? '#f97316' : '#171717',
            borderWidth: 1,
            borderColor: !isAsap && value ? '#f97316' : '#262626',
            alignItems: 'center',
          }}
        >
          <Text style={{
            color: !isAsap && value ? '#fff' : '#9ca3af',
            fontSize: 14,
            fontWeight: '600'
          }}>
            🕐 Pick a time
          </Text>
        </TouchableOpacity>
      </View>

      {/* Selected time display */}
      {!isAsap && value && (
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
          <View style={{
            flex: 1,
            backgroundColor: '#f9731620',
            borderWidth: 1.5,
            borderColor: '#f97316',
            borderRadius: 10,
            paddingVertical: 10,
            paddingHorizontal: 14,
          }}>
            <Text style={{ color: '#f97316', fontSize: 14, fontWeight: '600' }}>
              {formatTime(value)}
            </Text>
          </View>
          <TouchableOpacity
            onPress={handlePickTime}
            style={{
              backgroundColor: '#262626',
              borderRadius: 10,
              paddingVertical: 10,
              paddingHorizontal: 14,
              justifyContent: 'center',
            }}
          >
            <Text style={{ color: '#9ca3af', fontSize: 13 }}>Change</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Picker Modal */}
      <Modal
        visible={showPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPicker(false)}
      >
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.7)',
          justifyContent: 'flex-end'
        }}>
          <View style={{
            backgroundColor: '#0a0a0a',
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            paddingBottom: 40,
          }}>
            {/* Header */}
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingHorizontal: 20,
              paddingTop: 20,
              paddingBottom: 16,
              borderBottomWidth: 1,
              borderBottomColor: '#262626',
            }}>
              <TouchableOpacity onPress={() => setShowPicker(false)}>
                <Text style={{ color: '#9ca3af', fontSize: 16 }}>Cancel</Text>
              </TouchableOpacity>
              <Text style={{ color: '#fff', fontSize: 17, fontWeight: '600' }}>
                Pick a time
              </Text>
              <TouchableOpacity onPress={handleConfirm}>
                <Text style={{ color: '#f97316', fontSize: 16, fontWeight: '600' }}>
                  Done
                </Text>
              </TouchableOpacity>
            </View>

            {/* Picker columns */}
            <View style={{
              flexDirection: 'row',
              height: 200,
              paddingHorizontal: 20,
              paddingTop: 16,
            }}>
              {/* Day column */}
              <View style={{ flex: 1.2, marginRight: 8 }}>
                <ScrollView showsVerticalScrollIndicator={false}>
                  {['today', 'tomorrow'].map((day) => (
                    <TouchableOpacity
                      key={day}
                      onPress={() => setSelectedDay(day as 'today' | 'tomorrow')}
                      style={{
                        paddingVertical: 12,
                        paddingHorizontal: 16,
                        borderRadius: 8,
                        marginBottom: 8,
                        backgroundColor: selectedDay === day ? '#f97316' : '#171717',
                      }}
                    >
                      <Text style={{
                        color: selectedDay === day ? '#fff' : '#9ca3af',
                        fontSize: 15,
                        fontWeight: selectedDay === day ? '600' : '400',
                        textAlign: 'center',
                      }}>
                        {day.charAt(0).toUpperCase() + day.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Hour column */}
              <View style={{ flex: 0.8, marginRight: 8 }}>
                <ScrollView showsVerticalScrollIndicator={false}>
                  {HOURS.map((hour) => (
                    <TouchableOpacity
                      key={hour}
                      onPress={() => setSelectedHour(hour)}
                      style={{
                        paddingVertical: 12,
                        paddingHorizontal: 12,
                        borderRadius: 8,
                        marginBottom: 8,
                        backgroundColor: selectedHour === hour ? '#f97316' : '#171717',
                      }}
                    >
                      <Text style={{
                        color: selectedHour === hour ? '#fff' : '#9ca3af',
                        fontSize: 15,
                        fontWeight: selectedHour === hour ? '600' : '400',
                        textAlign: 'center',
                      }}>
                        {hour}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Minute column */}
              <View style={{ flex: 0.8, marginRight: 8 }}>
                <ScrollView showsVerticalScrollIndicator={false}>
                  {MINUTES.map((minute) => (
                    <TouchableOpacity
                      key={minute}
                      onPress={() => setSelectedMinute(minute)}
                      style={{
                        paddingVertical: 12,
                        paddingHorizontal: 12,
                        borderRadius: 8,
                        marginBottom: 8,
                        backgroundColor: selectedMinute === minute ? '#f97316' : '#171717',
                      }}
                    >
                      <Text style={{
                        color: selectedMinute === minute ? '#fff' : '#9ca3af',
                        fontSize: 15,
                        fontWeight: selectedMinute === minute ? '600' : '400',
                        textAlign: 'center',
                      }}>
                        {minute}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Period column */}
              <View style={{ flex: 0.8 }}>
                <ScrollView showsVerticalScrollIndicator={false}>
                  {PERIODS.map((period) => (
                    <TouchableOpacity
                      key={period}
                      onPress={() => setSelectedPeriod(period as 'AM' | 'PM')}
                      style={{
                        paddingVertical: 12,
                        paddingHorizontal: 12,
                        borderRadius: 8,
                        marginBottom: 8,
                        backgroundColor: selectedPeriod === period ? '#f97316' : '#171717',
                      }}
                    >
                      <Text style={{
                        color: selectedPeriod === period ? '#fff' : '#9ca3af',
                        fontSize: 15,
                        fontWeight: selectedPeriod === period ? '600' : '400',
                        textAlign: 'center',
                      }}>
                        {period}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>

            {/* Helper text */}
            <View style={{ paddingHorizontal: 20, paddingTop: 16 }}>
              <Text style={{
                color: '#6b7280',
                fontSize: 12,
                textAlign: 'center',
                lineHeight: 16,
              }}>
                Time must be at least 1 hour from now{'\n'}and within 24 hours
              </Text>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
