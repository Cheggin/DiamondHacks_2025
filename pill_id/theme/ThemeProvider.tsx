// ===== Custom Theme Provider =====
// theme/ThemeProvider.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';

// Define our theme colors
export const lightTheme = {
  primary: '#0077B6',
  primaryDark: '#005f92',
  primaryLight: '#90E0EF',
  background: '#FFFFFF',
  card: '#F8F9FA',
  text: '#212529',
  textSecondary: '#6C757D',
  border: '#DEE2E6',
  notification: '#FF4136',
  success: '#28A745',
  warning: '#FFC107',
  error: '#DC3545',
  white: '#FFFFFF',
  black: '#000000',
  // UI Element colors
  buttonText: '#FFFFFF',
  placeholder: '#ADB5BD',
  disabled: '#E9ECEF',
  highlight: '#CAF0F8',
  shadow: 'rgba(0, 0, 0, 0.1)',
};

export const darkTheme = {
  primary: '#00B4D8',
  primaryDark: '#0096C7',
  primaryLight: '#48CAE4',
  background: '#121212',
  card: '#1E1E1E',
  text: '#F8F9FA',
  textSecondary: '#ADB5BD',
  border: '#495057',
  notification: '#FF6B6B',
  success: '#40C057',
  warning: '#FFD43B',
  error: '#FA5252',
  white: '#FFFFFF',
  black: '#000000',
  // UI Element colors
  buttonText: '#FFFFFF',
  placeholder: '#6C757D',
  disabled: '#343A40',
  highlight: '#1D3D47',
  shadow: 'rgba(0, 0, 0, 0.3)',
};

// Create theme context
const ThemeContext = createContext({
  theme: lightTheme,
  isDark: false,
  toggleTheme: () => {},
});

// Custom hook to use the theme
export const useTheme = () => useContext(ThemeContext);

// Theme provider component
export const ThemeProvider = ({ children }) => {
  const deviceColorScheme = useColorScheme();
  const [isDark, setIsDark] = useState(deviceColorScheme === 'dark');

  // Update theme when device theme changes
  useEffect(() => {
    setIsDark(deviceColorScheme === 'dark');
  }, [deviceColorScheme]);

  // Toggle theme function
  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  const theme = isDark ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};