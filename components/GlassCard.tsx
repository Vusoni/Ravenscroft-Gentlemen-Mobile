// components/GlassCard.tsx
// Reusable glassmorphism surface.
// Uses GlassBlur for platform-split blur (iOS BlurView / Android no-op).
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { GlassBlur } from '@/components/GlassBlur';
import { cardShadow } from '@/utils/shadows';

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
  borderRadius = 22,
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
          backgroundColor: fillColor,
        },
        !noShadow && cardShadow,
        style,
      ]}
    >
      {/* Platform-split blur layer */}
      <GlassBlur intensity={intensity} />

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
