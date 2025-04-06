import { View, StyleSheet, Button, Image } from 'react-native';
import { router } from 'expo-router';

import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { ThemedButton } from '@/components/ThemedButton';

export default function HomeScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#caf0f8', dark: '#1D3D47' }}
      headerImage={<View />} 
    >
      <ThemedView style={styles.container}>
        {/* Add logo image here */}
        <Image 
          source={require('@/assets/images/PillSnapLogo.png')}  // Adjust the path if needed
          style={styles.logo}
        />
        
        <ThemedText type="title">Welcome to PillSnap</ThemedText>
        <ThemedText type="subtitle">
          Identify and track your medications with just a photo.
        </ThemedText>

        <ThemedButton
          title="Get Started"
          onPress={() => router.push('/pill-upload')}
        />
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 340,
    height: 240,
    marginBottom: 20,  // Adds space between logo and text
  },
});