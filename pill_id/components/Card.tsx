// components/Card.tsx
import React from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

type CardProps = ViewProps & {
  variant?: 'elevated' | 'outlined' | 'filled';
  padding?: number;
};

export const Card = ({
  variant = 'elevated',
  style,
  padding = 16,
  children,
  ...rest
}: CardProps) => {
  const { theme } = useTheme();
  
  const getCardStyle = () => {
    switch (variant) {
      case 'elevated':
        return {
          backgroundColor: theme.card,
          shadowColor: theme.shadow,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 3,
        };
      case 'outlined':
        return {
          backgroundColor: theme.background,
          borderWidth: 1,
          borderColor: theme.border,
        };
      case 'filled':
        return {
          backgroundColor: theme.primaryLight,
        };
      default:
        return {};
    }
  };
  
  return (
    <View
      style={[
        styles.card,
        getCardStyle(),
        { padding },
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    marginVertical: 8,
  },
});