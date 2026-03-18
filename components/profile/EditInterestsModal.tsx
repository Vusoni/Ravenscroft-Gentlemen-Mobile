// components/profile/EditInterestsModal.tsx
import { InterestTag } from '@/components/InterestTag';
import { INTERESTS } from '@/constants/interests';
import { useOnboardingStore } from '@/store/onboardingStore';
import { X } from 'lucide-react-native';
import { Modal, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export function EditInterestsModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const selectedInterests = useOnboardingStore((s) => s.selectedInterests);
  const toggleInterest = useOnboardingStore((s) => s.toggleInterest);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: '#EDEDED' }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16 }}>
          <Text style={{ fontFamily: 'PlayfairDisplay_700Bold', fontSize: 20, color: '#0A0A0A' }}>
            Edit Interests
          </Text>
          <Pressable onPress={onClose} hitSlop={12}>
            <X size={22} color="#0A0A0A" strokeWidth={1.8} />
          </Pressable>
        </View>

        {/* Interest tags */}
        <View style={{ paddingHorizontal: 16, flexDirection: 'row', flexWrap: 'wrap' }}>
          {INTERESTS.map((tag) => (
            <InterestTag
              key={tag}
              label={tag}
              selected={selectedInterests.includes(tag)}
              onToggle={() => toggleInterest(tag)}
            />
          ))}
        </View>

        {/* Summary */}
        {selectedInterests.length > 0 && (
          <View style={{ marginHorizontal: 20, marginTop: 20, backgroundColor: 'rgba(10,10,10,0.05)', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12 }}>
            <Text style={{ fontFamily: 'PlayfairDisplay_400Regular', fontSize: 10, color: 'rgba(10,10,10,0.4)', letterSpacing: 1.6, textTransform: 'uppercase', marginBottom: 4 }}>
              Your selection · {selectedInterests.length}
            </Text>
            <Text style={{ fontFamily: 'PlayfairDisplay_400Regular', fontSize: 13, color: '#0A0A0A', lineHeight: 20 }}>
              {selectedInterests.join(' · ')}
            </Text>
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
}
