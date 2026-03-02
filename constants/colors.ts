// Ravenscroft design tokens
export const Colors = {
  ivory: '#EDEDED',
  ink: '#0A0A0A',
  charcoal: '#1C1C1C',
  muted: '#6B6B6B',
  border: '#D4D4D4',
  surface: '#F5F5F5',
  white: '#FFFFFF',
} as const;

export type ColorKey = keyof typeof Colors;
