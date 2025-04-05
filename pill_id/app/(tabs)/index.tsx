import { View, StyleSheet, Button } from 'react-native';
import { router } from 'expo-router';

import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function HomeScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={<View />}>
      <ThemedView style={styles.container}>
        <ThemedText type="title">Welcome to PillSnap</ThemedText>
        <ThemedText type="subtitle">
          Identify and track your medications with just a photo.
        </ThemedText>

        <Button
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
});
