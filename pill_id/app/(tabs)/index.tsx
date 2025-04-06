import { View, StyleSheet, Button, Image } from 'react-native';
import { router } from 'expo-router';
import { useAppState } from './app-state'; 

import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { ThemedButton } from '@/components/ThemedButton';

export default function HomeScreen() {
  const { setHasStarted } = useAppState(); 

  const handleStart = () => {
    setHasStarted(true); 
    router.push('/pill-upload'); 
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#caf0f8', dark: '#1D3D47' }}
      headerImage={<View />} 
    >
      <ThemedView style={styles.container}>
        <Image 
          source={require('@/assets/images/PillSnapLogo.png')}
          style={styles.logo}
        />
        
        <ThemedText type="subtitle">Welcome to PillSnap!</ThemedText>
        <ThemedText type="default" greyText={true}>
          Identify and track your medications with just a photo.
        </ThemedText>

        <ThemedButton
          title="Get Started"
          onPress={handleStart}
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
    marginBottom: 20,
  },
});
