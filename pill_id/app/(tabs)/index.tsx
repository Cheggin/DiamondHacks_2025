import { View, StyleSheet, Button } from 'react-native';
import { router } from 'expo-router';

import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { ThemedButton } from '@/components/ThemedButton';

export default function HomeScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#caf0f8', dark: '#1D3D47' }}
      headerImage={<CustomHeader />} 
    >
      <ThemedView style={styles.container}>
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

function CustomHeader() {
  return (
    <View style={styles.customHeaderContainer}>
      <View style={styles.headerContent}>
        {/* <ThemedText type="title">blob</ThemedText> */}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customHeaderContainer: {
    height: 50,
    backgroundColor: '#caf0f8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    padding: 10,
  },
});
