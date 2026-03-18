// components/profile/InterestChips.tsx
import { GlassBlur } from '@/components/GlassBlur';
import { PenLine } from 'lucide-react-native';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

export function InterestChips({
  interests,
  onEdit,
}: {
  interests: string[];
  onEdit: () => void;
}) {
  if (interests.length === 0) return null;

  return (
    <Animated.View entering={FadeInDown.delay(650).duration(500)}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 24, gap: 8, paddingVertical: 4 }}
        style={{ marginTop: 16 }}
      >
        <Pressable
          onPress={onEdit}
          style={[styles.chip, { flexDirection: 'row', alignItems: 'center', gap: 4 }]}
        >
          <GlassBlur intensity={40} />
          <View style={[StyleSheet.absoluteFill, styles.chipFill]} pointerEvents="none" />
          <PenLine size={11} color="#1C1C1C" strokeWidth={1.8} />
          <Text style={styles.chipLabel}>Edit</Text>
        </Pressable>
        {interests.map((tag) => (
          <View key={tag} style={styles.chip}>
            <GlassBlur intensity={40} />
            <View style={[StyleSheet.absoluteFill, styles.chipFill]} pointerEvents="none" />
            <Text style={styles.chipLabel}>{tag}</Text>
          </View>
        ))}
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  chip: {
    overflow: 'hidden',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.85)',
    paddingHorizontal: 14,
    paddingVertical: 7,
    backgroundColor: Platform.select({
      ios: 'transparent',
      android: 'rgba(255,255,255,0.65)',
    }),
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
      },
    }),
  },
  chipFill: {
    backgroundColor: 'rgba(255,255,255,0.62)',
    borderRadius: 20,
  },
  chipLabel: {
    fontSize: 12,
    color: '#1C1C1C',
    letterSpacing: 0.2,
  },
});
