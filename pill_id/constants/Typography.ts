/**
 * PillSnap Typography System
 * 
 * A consistent typography system using the Inter font family,
 * with fallbacks to system sans-serif fonts for better cross-platform support.
 */

import { Platform } from 'react-native';

// Primary font stack - uses platform-specific optimal fonts
export const fontFamily = Platform.select({
  ios: 'SF Pro Text',
  android: 'Roboto',
  default: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif'
});

// Font weights
export const fontWeights = {
  light: '300',
  regular: '400',
  medium: '500', 
  semiBold: '600',
  bold: '700',
};

// Text sizes (in pixels)
export const fontSizes = {
  xs: 12,
  sm: 14,
  base: 16,
  md: 18,
  lg: 20,
  xl: 24,
  xxl: 32,
};

// Line heights (multiplier of font size)
export const lineHeights = {
  tight: 1.2,
  base: 1.5,
  relaxed: 1.625,
};

// Letter spacing
export const letterSpacing = {
  tight: -0.5,
  normal: 0,
  wide: 0.5,
  wider: 1,
};

// Typography variants for different content types
export const variants = {
  h1: {
    fontFamily,
    fontSize: fontSizes.xxl,
    fontWeight: fontWeights.bold,
    lineHeight: fontSizes.xxl * lineHeights.tight,
    letterSpacing: letterSpacing.tight,
    marginBottom: 16,
  },
  h2: {
    fontFamily,
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.bold,
    lineHeight: fontSizes.xl * lineHeights.tight,
    letterSpacing: letterSpacing.tight,
    marginBottom: 12,
  },
  h3: {
    fontFamily,
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold,
    lineHeight: fontSizes.lg * lineHeights.tight,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily,
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semiBold,
    lineHeight: fontSizes.md * lineHeights.base,
    marginBottom: 8,
  },
  body: {
    fontFamily,
    fontSize: fontSizes.base,
    fontWeight: fontWeights.regular,
    lineHeight: fontSizes.base * lineHeights.relaxed,
    marginBottom: 8,
  },
  bodyBold: {
    fontFamily,
    fontSize: fontSizes.base,
    fontWeight: fontWeights.semiBold,
    lineHeight: fontSizes.base * lineHeights.relaxed,
    marginBottom: 8,
  },
  caption: {
    fontFamily,
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.regular,
    lineHeight: fontSizes.sm * lineHeights.base,
  },
  small: {
    fontFamily,
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.regular,
    lineHeight: fontSizes.xs * lineHeights.base,
  },
  label: {
    fontFamily,
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semiBold,
    lineHeight: fontSizes.sm * lineHeights.base,
    letterSpacing: letterSpacing.wide,
    textTransform: 'uppercase',
  },
  button: {
    fontFamily,
    fontSize: fontSizes.base,
    fontWeight: fontWeights.semiBold,
    lineHeight: fontSizes.base * lineHeights.base,
  },
  tabLabel: {
    fontFamily,
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.semiBold,
    lineHeight: fontSizes.xs * lineHeights.base,
  }
};