// components/profile/EditProfileModal.tsx
import { useUser } from '@clerk/clerk-expo';
import { X } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Alert, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export function EditProfileModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const { user } = useUser();
  const [name, setName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (visible && user) {
      setName(user.fullName ?? user.firstName ?? '');
    }
  }, [visible, user]);

  const handleSave = async () => {
    if (!user || !name.trim()) return;
    setIsSaving(true);
    try {
      const parts = name.trim().split(' ');
      const firstName = parts[0];
      const lastName = parts.length > 1 ? parts.slice(1).join(' ') : '';
      await user.update({ firstName, lastName });
      onClose();
    } catch {
      Alert.alert('Error', 'Failed to update name. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16 }}>
          <Pressable
            onPress={onClose}
            hitSlop={12}
            style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#F2F2F2', alignItems: 'center', justifyContent: 'center' }}
          >
            <X size={15} color="#0A0A0A" strokeWidth={2} />
          </Pressable>

          <Text style={{ fontFamily: 'PlayfairDisplay_700Bold', fontSize: 16, color: '#0A0A0A', letterSpacing: 0.2 }}>
            Edit Profile
          </Text>

          <Pressable
            onPress={handleSave}
            disabled={isSaving || !name.trim()}
            style={({ pressed }) => ({ opacity: pressed || isSaving || !name.trim() ? 0.4 : 1 })}
          >
            <Text style={{ fontSize: 15, fontWeight: '600', color: '#0A0A0A' }}>
              {isSaving ? 'Saving…' : 'Save'}
            </Text>
          </Pressable>
        </View>

        <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: '#E8E8E8' }} />

        {/* Name field */}
        <View style={{ paddingHorizontal: 20, paddingTop: 32 }}>
          <Text style={{ fontSize: 11, fontWeight: '700', letterSpacing: 1.6, color: '#ABABAB', textTransform: 'uppercase', marginBottom: 10 }}>
            Display Name
          </Text>
          <TextInput
            value={name}
            onChangeText={setName}
            style={{ height: 52, borderRadius: 14, backgroundColor: '#F7F7F7', paddingHorizontal: 16, fontSize: 16, color: '#0A0A0A', borderWidth: 1, borderColor: '#EBEBEB' }}
            placeholder="Your name"
            placeholderTextColor="#ABABAB"
            autoFocus
            returnKeyType="done"
            onSubmitEditing={handleSave}
          />
        </View>

        {/* Save button */}
        <View style={{ paddingHorizontal: 20, paddingTop: 24 }}>
          <Pressable
            onPress={handleSave}
            disabled={isSaving || !name.trim()}
            style={({ pressed }) => ({
              height: 52,
              borderRadius: 14,
              backgroundColor: '#0A0A0A',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: pressed || isSaving || !name.trim() ? 0.6 : 1,
            })}
          >
            <Text style={{ fontSize: 15, fontWeight: '600', color: '#FFFFFF', letterSpacing: 0.3 }}>
              {isSaving ? 'Saving…' : 'Save Changes'}
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </Modal>
  );
}
