// Type declarations for platform-specific GlassBlur files
// (GlassBlur.ios.tsx and GlassBlur.android.tsx).
import { StyleProp, ViewStyle } from 'react-native';

export interface GlassBlurProps {
  intensity?: number;
  style?: StyleProp<ViewStyle>;
}

export declare function GlassBlur(props: GlassBlurProps): React.ReactElement | null;
