import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Modal,
  ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useCreateList } from '@/lib/hooks/queries/useLists';
import { LIST_TEMPLATES } from '@/lib/utils/suggestListName';

interface Props {
  visible: boolean;
  onClose: () => void;
  /** Pre-fill name+emoji based on a restaurant (from Save to List flow) */
  suggestion?: { title: string; emoji: string };
}

const EMOJI_OPTIONS = ['📌','🎬','💑','💰','☕','🍺','🌙','🍜','🥖','🏢','🌶️','🦐','🥗','🌍','🍨','🍰','🍿','🍚','🍲','🍔'];

export function CreateListSheet({ visible, onClose, suggestion }: Props) {
  const createList = useCreateList();
  const [name, setName] = useState(suggestion?.title ?? '');
  const [emoji, setEmoji] = useState(suggestion?.emoji ?? '📌');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const handleTemplate = (t: { title: string; emoji: string }) => {
    setName(t.title);
    setEmoji(t.emoji);
  };

  const handleCreate = async () => {
    if (!name.trim()) return;
    try {
      await createList.mutateAsync({ title: name.trim(), emoji });
      setName('');
      setEmoji('📌');
      onClose();
    } catch {
      // error handled by mutation
    }
  };

  const handleClose = () => {
    setName('');
    setEmoji('📌');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <TouchableOpacity
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' }}
        activeOpacity={1}
        onPress={handleClose}
      />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={{ backgroundColor: '#171717', borderTopLeftRadius: 16, borderTopRightRadius: 16, paddingBottom: 40 }}>
          {/* Handle */}
          <View style={{ width: 40, height: 4, backgroundColor: '#374151', borderRadius: 2, alignSelf: 'center', marginTop: 12, marginBottom: 16 }} />

          <Text style={{ color: '#fff', fontSize: 17, fontWeight: '700', marginHorizontal: 20, marginBottom: 16 }}>
            Create a list
          </Text>

          {/* Name + Emoji row */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, marginBottom: 16, gap: 10 }}>
            <TouchableOpacity
              onPress={() => setShowEmojiPicker(!showEmojiPicker)}
              style={{ width: 44, height: 44, backgroundColor: '#262626', borderRadius: 10, alignItems: 'center', justifyContent: 'center' }}
            >
              <Text style={{ fontSize: 22 }}>{emoji}</Text>
            </TouchableOpacity>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Name your list..."
              placeholderTextColor="#6b7280"
              style={{ flex: 1, backgroundColor: '#262626', color: '#fff', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15 }}
              autoFocus={!suggestion}
              returnKeyType="done"
              onSubmitEditing={handleCreate}
            />
          </View>

          {/* Emoji picker */}
          {showEmojiPicker && (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: 20, marginBottom: 12, gap: 8 }}>
              {EMOJI_OPTIONS.map(e => (
                <TouchableOpacity
                  key={e}
                  onPress={() => { setEmoji(e); setShowEmojiPicker(false); }}
                  style={{
                    width: 44, height: 44, backgroundColor: e === emoji ? '#f97316' : '#262626',
                    borderRadius: 10, alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <Text style={{ fontSize: 22 }}>{e}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Quick-start templates (only show if no suggestion pre-fill) */}
          {!suggestion && (
            <>
              <View style={{ height: 1, backgroundColor: '#262626', marginHorizontal: 20, marginBottom: 12 }} />
              <Text style={{ color: '#6b7280', fontSize: 12, fontWeight: '600', marginHorizontal: 20, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Quick start
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 8, flexDirection: 'row' }}>
                {LIST_TEMPLATES.map(t => (
                  <TouchableOpacity
                    key={t.title}
                    onPress={() => handleTemplate(t)}
                    style={{ backgroundColor: '#262626', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', gap: 6 }}
                  >
                    <Text style={{ fontSize: 16 }}>{t.emoji}</Text>
                    <Text style={{ color: '#d1d5db', fontSize: 13 }}>{t.title}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </>
          )}

          {/* Create button */}
          <TouchableOpacity
            onPress={handleCreate}
            disabled={!name.trim() || createList.isPending}
            style={{
              marginHorizontal: 20, marginTop: 16, backgroundColor: name.trim() ? '#f97316' : '#374151',
              borderRadius: 12, paddingVertical: 14, alignItems: 'center',
            }}
          >
            <Text style={{ color: '#fff', fontSize: 15, fontWeight: '700' }}>
              {createList.isPending ? 'Creating...' : 'Create List'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
