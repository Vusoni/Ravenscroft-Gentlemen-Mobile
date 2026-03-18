// utils/shadows.ts
// Shared shadow presets for iOS (shadowColor/offset/opacity/radius)
// and Android (elevation). Import and spread into StyleSheet entries.
import { Platform } from 'react-native';

/** Large card shadow — used on GlassCard and primary surface containers. */
export const cardShadow = Platform.select({
  ios: {
    shadowColor: '#1C1C1C',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
  },
  android: { elevation: 8 },
}) as object;

/** Medium button/panel shadow — used on CTAs and floating panels. */
export const buttonShadow = Platform.select({
  ios: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
  },
  android: { elevation: 3 },
}) as object;

/** Subtle border shadow — used on OAuth buttons and secondary surfaces. */
export const subtleShadow = Platform.select({
  ios: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  android: { elevation: 2 },
}) as object;
