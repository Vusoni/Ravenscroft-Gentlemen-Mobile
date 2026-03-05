// components/GlassCard.tsx
// Reusable 2027 glassmorphism surface.
// Uses expo-blur on iOS for true frosted glass; Android gets a semi-transparent fallback.
import { BlurView } from 'expo-blur';
import { Platform, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

interface GlassCardProps {
  children: React.ReactNode;
  intensity?: number;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
  /** Override the glass fill colour (default rgba(255,255,255,0.62)) */
  fillColor?: string;
  /** Disable shadow entirely */
  noShadow?: boolean;
}

export function GlassCard({
  children,
  intensity = 52,
  borderRadius = 18,
  style,
  fillColor = 'rgba(255,255,255,0.62)',
  noShadow = false,
}: GlassCardProps) {
  const br = borderRadius;

  return (
    <View
      style={[
        {
          borderRadius: br,
          overflow: 'hidden',
          // White top/left inner highlight + dark bottom/right hairline
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.82)',
          backgroundColor: Platform.select({
            ios: 'transparent',
            android: fillColor,
          }),
        },
        !noShadow && styles.shadow,
        style,
      ]}
    >
      {/* True blur layer (iOS only) */}
      {Platform.OS === 'ios' && (
        <BlurView
          intensity={intensity}
          tint="systemChromeMaterialLight"
          style={StyleSheet.absoluteFill}
        />
      )}

      {/* Semi-transparent fill overlay (tints the blur) */}
      <View
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: fillColor,
            borderRadius: br,
          },
        ]}
        pointerEvents="none"
      />

      {/* Bottom/right dark hairline to create depth illusion */}
      <View
        style={[
          StyleSheet.absoluteFill,
          {
            borderRadius: br,
            borderWidth: 1,
            borderColor: 'rgba(0,0,0,0.055)',
          },
        ]}
        pointerEvents="none"
      />

      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  shadow: {
    ...Platform.select({
      ios: {
        shadowColor: '#1C1C1C',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.09,
        shadowRadius: 20,
      },
      android: {
        elevation: 8,
      },
    }),
  },
});
