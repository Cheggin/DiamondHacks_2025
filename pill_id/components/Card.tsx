import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { ThemedView, ThemedViewProps } from './ThemedView';
import { ThemedText } from './ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';

type CardProps = ThemedViewProps & {
  title?: string;
  subtitle?: string;
  elevation?: 'none' | 'low' | 'medium' | 'high';
  contentStyle?: ViewStyle;
  headerStyle?: ViewStyle;
  footer?: React.ReactNode;
};

export function Card({
  children,
  title,
  subtitle,
  style,
  lightColor,
  darkColor,
  elevation = 'low',
  contentStyle,
  headerStyle,
  footer,
  ...otherProps
}: CardProps) {
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'card');
  const borderColor = useThemeColor({}, 'border');

  // Determine shadow based on elevation
  const getShadowStyle = () => {
    switch (elevation) {
      case 'none':
        return {};
      case 'low':
        return styles.shadowLow;
      case 'medium':
        return styles.shadowMedium;
      case 'high':
        return styles.shadowHigh;
      default:
        return styles.shadowLow;
    }
  };

  return (
    <ThemedView
      style={[
        styles.container,
        { backgroundColor, borderColor },
        getShadowStyle(),
        style,
      ]}
      {...otherProps}
    >
      {(title || subtitle) && (
        <View style={[styles.header, headerStyle]}>
          {title && <ThemedText type="subtitle">{title}</ThemedText>}
          {subtitle && <ThemedText type="caption" greyText>{subtitle}</ThemedText>}
        </View>
      )}
      
      <View style={[styles.content, contentStyle]}>
        {children}
      </View>

      {footer && (
        <View style={styles.footer}>
          {footer}
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    marginVertical: 8,
  },
  shadowLow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  shadowMedium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 4,
  },
  shadowHigh: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 8,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  content: {
    padding: 16,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
});