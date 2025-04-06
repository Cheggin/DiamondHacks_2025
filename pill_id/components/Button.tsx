// components/Button.tsx
import React from 'react';
import { 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator, 
  TouchableOpacityProps,
  View,
} from 'react-native';
import { Typography } from './Typography';
import { useTheme } from '../theme/ThemeProvider';

type ButtonProps = TouchableOpacityProps & {
  variant?: 'primary' | 'secondary' | 'outline' | 'text';
  size?: 'small' | 'medium' | 'large';
  title: string;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
};

export const Button = ({
  variant = 'primary',
  size = 'medium',
  title,
  loading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  style,
  fullWidth = false,
  ...rest
}: ButtonProps) => {
  const { theme } = useTheme();

  const getBackgroundColor = () => {
    if (disabled) return theme.disabled;
    
    switch (variant) {
      case 'primary':
        return theme.primary;
      case 'secondary':
        return theme.primaryLight;
      case 'outline':
      case 'text':
        return 'transparent';
      default:
        return theme.primary;
    }
  };

  const getTextColor = () => {
    if (disabled) return theme.textSecondary;
    
    switch (variant) {
      case 'primary':
        return theme.buttonText;
      case 'secondary':
        return theme.primary;
      case 'outline':
      case 'text':
        return theme.primary;
      default:
        return theme.buttonText;
    }
  };

  const getBorderColor = () => {
    if (disabled) return theme.disabled;
    
    return variant === 'outline' ? theme.primary : 'transparent';
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        styles[size],
        {
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
          borderWidth: variant === 'outline' ? 2 : 0,
          opacity: disabled ? 0.7 : 1,
          width: fullWidth ? '100%' : undefined,
        },
        style,
      ]}
      disabled={disabled || loading}
      activeOpacity={0.8}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} size="small" />
      ) : (
        <View style={[styles.contentContainer, { flexDirection: iconPosition === 'left' ? 'row' : 'row-reverse' }]}>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          <Typography variant="button" color={getTextColor()}>
            {title}
          </Typography>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginRight: 8,
    marginLeft: 8,
  },
  small: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    minWidth: 80,
  },
  medium: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    minWidth: 120,
  },
  large: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    minWidth: 160,
  },
});