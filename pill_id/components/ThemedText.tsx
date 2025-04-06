import { Text, type TextProps, StyleSheet, Platform } from 'react-native';

import { useThemeColor } from '@/hooks/useThemeColor';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'caption' | 'link' | 'header';
  greyText?: boolean;
};

// Determine system font family - use system sans-serif fonts
const fontFamily = Platform.select({
  ios: 'Helvetica',
  android: 'Roboto',
  default: 'System',
});

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  greyText = false,
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');
  const grayColor = useThemeColor({ light: '#687076', dark: '#9BA1A6' }, 'icon');

  return (
    <Text
      style={[
        { color: greyText ? grayColor : color, fontFamily },
        type === 'default' ? styles.default : undefined,
        type === 'title' ? styles.title : undefined,
        type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        type === 'caption' ? styles.caption : undefined,
        type === 'link' ? styles.link : undefined,
        type === 'header' ? styles.header : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
    letterSpacing: 0.15,
  },
  defaultSemiBold: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
    letterSpacing: 0.15,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 34,
    letterSpacing: 0.25,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 28,
    letterSpacing: 0.15,
  },
  header: {
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 32,
    letterSpacing: 0.15,
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400',
    letterSpacing: 0.4,
  },
  link: {
    fontSize: 16,
    lineHeight: 24,
    color: '#0077b6',
    fontWeight: '500',
    letterSpacing: 0.15,
  },
});