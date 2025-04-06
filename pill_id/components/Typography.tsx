// ===== Typography Components =====
// components/Typography.tsx
import React from 'react';
import { Text, StyleSheet, TextProps } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

type TypographyProps = TextProps & {
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'caption' | 'button' | 'label';
  color?: string;
  align?: 'auto' | 'left' | 'right' | 'center' | 'justify';
  weight?: 'normal' | 'bold' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
};

export const Typography = ({
  variant = 'body',
  style,
  color,
  align = 'left',
  weight,
  children,
  ...rest
}: TypographyProps) => {
  const { theme } = useTheme();
  
  return (
    <Text
      style={[
        styles.base,
        styles[variant],
        {
          color: color || theme.text,
          textAlign: align,
          fontWeight: weight,
        },
        style,
      ]}
      {...rest}
    >
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  base: {
    fontFamily: 'System',
  },
  h1: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 16,
    lineHeight: 40,
  },
  h2: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 14,
    lineHeight: 36,
  },
  h3: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    lineHeight: 32,
  },
  h4: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    lineHeight: 28,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
  },
  caption: {
    fontSize: 14,
    lineHeight: 20,
  },
  button: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
  },
});