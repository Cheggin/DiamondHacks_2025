import React from 'react';
import { View, StyleSheet, Image, Dimensions, Platform } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Assuming these imports are correct based on your project structure
import { useAppState } from './app-state';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { ThemedButton } from '@/components/ThemedButton';
import { Colors } from '@/constants/Colors'; // Assuming Colors are in constants
import { useColorScheme } from '@/hooks/useColorScheme'; // Import useColorScheme

// Get screen dimensions
const { width, height } = Dimensions.get('window');

// Define gradient colors based on theme using 'as const' for strict typing
// FIX: Add 'as const' to satisfy the LinearGradient 'colors' prop type
const gradientLight = ['#e0f7fa', '#caf0f8', '#b2ebf2'] as const;
const gradientDark = ['#1D3D47', '#162f38', '#0f222a'] as const;

export default function HomeScreen() {
  const { setHasStarted } = useAppState();
  const insets = useSafeAreaInsets(); // Get safe area insets
  const colorScheme = useColorScheme() ?? 'light'; // Get current color scheme

  const handleStart = () => {
    setHasStarted(true);
    router.push('/pill-upload');
  };

  // Dynamic header height based on screen size
  const headerHeight = height * 0.4; // Adjust percentage as needed

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: Colors.light.background, dark: Colors.dark.background }}
      headerImage={
        <LinearGradient
          // Use theme-appropriate gradient colors
          colors={colorScheme === 'dark' ? gradientDark : gradientLight} // Type error resolved by 'as const' above
          style={[styles.headerGradient, { height: headerHeight }]}
        >
          {/* Place Logo within the gradient header */}
          <View style={[styles.logoContainer, { paddingTop: insets.top + 20 }]}>
            <Image
              source={require('@/assets/images/PillSnapLogo.png')} // Ensure path is correct
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
        </LinearGradient>
      }
    >
      {/* Content Section */}
      <ThemedView style={styles.contentContainer}>
        <ThemedText type="title" style={styles.title}>Welcome to PillSnap!</ThemedText>
        {/* Dynamically set subtitle color based on theme */}
        <ThemedText type="subtitle" style={[styles.subtitle, { color: Colors[colorScheme].icon }]} greyText={false}>
          Your smart medication assistant.
        </ThemedText>
        <ThemedText type="default" style={styles.description}>
          Easily identify pills, track your medication schedule, and stay informed about your health journey. Snap a photo to begin!
        </ThemedText>

        {/* Enhanced Button Styling */}
        <ThemedButton
          title="Get Started"
          onPress={handleStart}
          // Dynamically set button background color based on theme
          buttonStyle={[styles.startButton, { backgroundColor: Colors[colorScheme].tint }]}
          // Set button text color explicitly for contrast, especially for dark mode tint
          textStyle={[styles.startButtonText, { color: colorScheme === 'dark' ? Colors.dark.background : Colors.light.background }]}
        />
      </ThemedView>
    </ParallaxScrollView>
  );
}

// Define styles outside the component for performance
const styles = StyleSheet.create({
  headerGradient: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    width: '100%',
  },
  logo: {
    width: width * 0.6,
    maxWidth: 280,
    height: height * 0.2,
    maxHeight: 180,
    marginBottom: 10,
  },
  contentContainer: {
    padding: 24,
    paddingTop: 32,
    gap: 20,
    alignItems: 'center',
    minHeight: height * 0.5,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 16,
    fontSize: 18,
    // color is now set dynamically inline
  },
  description: {
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 16,
    marginBottom: 32,
    fontSize: 16,
  },
  startButton: {
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 30,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    marginTop: 20,
    // backgroundColor is now set dynamically inline
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: '600',
    // color is now set dynamically inline
  },
});
