// components/profile/SettingSection.tsx
import { GlassBlur } from '@/components/GlassBlur';
import { Platform, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SettingItem, SettingRow } from './SettingItem';

function SectionLabel({ title }: { title: string }) {
  return (
    <Text style={{
      fontSize: 10,
      fontWeight: '700',
      letterSpacing: 2.2,
      color: '#ABABAB',
      textTransform: 'uppercase',
      paddingHorizontal: 24,
      paddingTop: 28,
      paddingBottom: 10,
    }}>
      {title}
    </Text>
  );
}

export function SettingSection({
  title,
  rows,
  delay,
  onRowPress,
}: {
  title: string;
  rows: SettingRow[];
  delay: number;
  onRowPress?: (id: string) => void;
}) {
  return (
    <Animated.View entering={FadeInDown.delay(delay).duration(400)}>
      <SectionLabel title={title} />
      <View style={{
        marginHorizontal: 24,
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.85)',
        ...Platform.select({
          ios: { shadowColor: '#1C1C1C', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.10, shadowRadius: 20 },
          android: { elevation: 6 },
        }),
      }}>
        <GlassBlur intensity={48} />
        {rows.map((row, i) => (
          <SettingItem
            key={row.id}
            index={i}
            total={rows.length}
            row={row}
            onPress={onRowPress ? () => onRowPress(row.id) : undefined}
          />
        ))}
      </View>
    </Animated.View>
  );
}
