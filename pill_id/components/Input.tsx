// components/Input.tsx
import React, { useState } from 'react';
import { 
  View, 
  TextInput, 
  StyleSheet, 
  TextInputProps,
  TouchableOpacity,
} from 'react-native';
import { Typography } from './Typography';
import { useTheme } from '../theme/ThemeProvider';

type InputProps = TextInputProps & {
  label?: string;
  error?: string;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  onEndIconPress?: () => void;
};

export const Input = ({
  label,
  error,
  style,
  startIcon,
  endIcon,
  onEndIconPress,
  ...rest
}: InputProps) => {
  const { theme } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  
  return (
    <View style={styles.container}>
      {label && (
        <Typography variant="label" style={styles.label}>
          {label}
        </Typography>
      )}
      
      <View
        style={[
          styles.inputContainer,
          {
            borderColor: error
              ? theme.error
              : isFocused
              ? theme.primary
              : theme.border,
            backgroundColor: theme.card,
          },
        ]}
      >
        {startIcon && <View style={styles.iconContainer}>{startIcon}</View>}
        
        <TextInput
          style={[
            styles.input,
            {
              color: theme.text,
              paddingLeft: startIcon ? 0 : 16,
              paddingRight: endIcon ? 0 : 16,
            },
            style,
          ]}
          placeholderTextColor={theme.placeholder}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...rest}
        />
        
        {endIcon && (
          <TouchableOpacity 
            style={styles.iconContainer} 
            onPress={onEndIconPress}
            disabled={!onEndIconPress}
          >
            {endIcon}
          </TouchableOpacity>
        )}
      </View>
      
      {error && (
        <Typography 
          variant="caption" 
          color={theme.error}
          style={styles.errorText}
        >
          {error}
        </Typography>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: '100%',
  },
  label: {
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 16,
    paddingVertical: 12,
  },
  iconContainer: {
    paddingHorizontal: 16,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    marginTop: 4,
  },
});