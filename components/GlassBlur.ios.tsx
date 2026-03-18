// components/GlassBlur.ios.tsx
// iOS: real frosted glass via expo-blur BlurView.
import { BlurView } from 'expo-blur';
import { StyleProp, StyleSheet, ViewStyle } from 'react-native';

interface GlassBlurProps {
  intensity?: number;
  style?: StyleProp<ViewStyle>;
}

export function GlassBlur({ intensity = 52, style }: GlassBlurProps) {
  return (
    <BlurView
      intensity={intensity}
      tint="systemChromeMaterialLight"
      style={[StyleSheet.absoluteFill, style]}
    />
  );
}
