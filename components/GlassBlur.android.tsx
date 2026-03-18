// components/GlassBlur.android.tsx
// Android: transparent no-op — the semi-transparent fillColor overlay
// on GlassCard already provides the glass appearance fallback.
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

interface GlassBlurProps {
  intensity?: number;
  style?: StyleProp<ViewStyle>;
}

export function GlassBlur({ style }: GlassBlurProps) {
  return <View style={[StyleSheet.absoluteFill, style]} pointerEvents="none" />;
}
