import { Pressable, Text, StyleSheet, Platform, ViewStyle, TextStyle, ActivityIndicator } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export type ThemedButtonProps = {
  title: string;
  onPress: () => void;
  textStyle?: TextStyle;
  buttonStyle?: ViewStyle;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'outline' | 'text';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  icon?: React.ReactNode;
};

// Determine system font family
const fontFamily = Platform.select({
  ios: 'Helvetica',
  android: 'Roboto',
  default: 'System',
});

export function ThemedButton({
  title,
  onPress,
  textStyle,
  buttonStyle,
  disabled = false,
  variant = 'primary',
  size = 'medium',
  loading = false,
  icon,
}: ThemedButtonProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  // Dynamic styles based on variant and size
  const getButtonStyles = () => {
    // Base styles for all variants
    const baseStyle: ViewStyle = {
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      ...getSizeStyles().container,
    };

    // Apply styles based on variant
    switch (variant) {
      case 'primary':
        return {
          ...baseStyle,
          backgroundColor: colors.tint,
        };
      case 'secondary':
        return {
          ...baseStyle,
          backgroundColor: colorScheme === 'light' ? '#e6f2ff' : '#1e3a5f',
          borderWidth: 1,
          borderColor: colors.tint,
        };
      case 'outline':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: colors.tint,
        };
      case 'text':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
        };
      default:
        return baseStyle;
    }
  };

  // Get text color based on variant
  const getTextColor = () => {
    switch (variant) {
      case 'primary':
        return '#ffffff';
      case 'secondary':
      case 'outline':
      case 'text':
        return colors.tint;
      default:
        return '#ffffff';
    }
  };

  // Size styles
  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          container: {
            paddingVertical: 8,
            paddingHorizontal: 12,
          },
          text: {
            fontSize: 14,
          },
        };
      case 'large':
        return {
          container: {
            paddingVertical: 16,
            paddingHorizontal: 24,
          },
          text: {
            fontSize: 18,
          },
        };
      case 'medium':
      default:
        return {
          container: {
            paddingVertical: 12,
            paddingHorizontal: 20,
          },
          text: {
            fontSize: 16,
          },
        };
    }
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        getButtonStyles(),
        pressed && styles.pressed,
        disabled && styles.disabled,
        buttonStyle,
      ]}
    >
      {loading && (
        <ActivityIndicator 
          size="small" 
          color={getTextColor()} 
          style={styles.loader} 
        />
      )}
      
      {icon && !loading && icon}
      
      <Text
        style={[
          {
            color: getTextColor(),
            fontFamily,
            fontWeight: '600',
            ...getSizeStyles().text,
          },
          icon ? styles.textWithIcon : undefined,
          textStyle,
        ]}
      >
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressed: {
    opacity: 0.8,
  },
  disabled: {
    opacity: 0.5,
  },
  textWithIcon: {
    marginLeft: 8,
  },
  loader: {
    marginRight: 8,
  },
});