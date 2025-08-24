export * from './colors';
export * from './spacing';
export * from './typography';

// Re-export all tokens for easy import
import { colors } from './colors';
import { spacing, radius, shadows } from './spacing';
import { fontSize, fontWeight, lineHeight, letterSpacing, fontFamily } from './typography';

export const tokens = {
  colors,
  spacing,
  radius,
  shadows,
  fontSize,
  fontWeight,
  lineHeight,
  letterSpacing,
  fontFamily,
} as const;