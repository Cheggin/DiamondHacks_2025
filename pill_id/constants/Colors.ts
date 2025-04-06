/**
 * Professional medical color palette for PillSnap
 * Using a blue-based professional scheme with proper contrast for both modes
 */

// Primary color palette
const primaryLight = '#0077b6'; // Main blue
const secondaryLight = '#00b4d8'; // Lighter blue accent
const tertiaryLight = '#90e0ef'; // Lightest blue for subtle elements
const backgroundLight = '#ffffff'; // Clean white background
const textLight = '#1a1a1a'; // Near-black for text
const grayLight = '#687076'; // Medium gray for secondary text

// Dark mode palette
const primaryDark = '#48cae4'; // Brighter blue for dark mode
const secondaryDark = '#0096c7'; // Medium blue for dark mode
const tertiaryDark = '#023e8a'; // Deep blue for accents in dark mode
const backgroundDark = '#121212'; // Standard dark background
const textDark = '#f8f9fa'; // Off-white text for dark mode
const grayDark = '#9BA1A6'; // Light gray for dark mode secondary text

export const Colors = {
  light: {
    text: textLight,
    background: backgroundLight,
    tint: primaryLight,
    icon: grayLight,
    tabIconDefault: grayLight,
    tabIconSelected: primaryLight,
    card: '#f8f9fa',
    border: '#e9ecef',
    notification: secondaryLight,
    error: '#dc3545',
    success: '#198754',
    warning: '#ffc107',
    info: tertiaryLight,
  },
  dark: {
    text: textDark,
    background: backgroundDark,
    tint: primaryDark,
    icon: grayDark,
    tabIconDefault: grayDark,
    tabIconSelected: primaryDark,
    card: '#1e1e1e',
    border: '#333333',
    notification: secondaryDark,
    error: '#f07178',
    success: '#4cb782',
    warning: '#ffd866',
    info: tertiaryDark,
  },
};