import { View, StyleSheet, Image, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useAppState } from './app-state'; 
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { ThemedButton } from '@/components/ThemedButton';
import { Card } from '@/components/Card';
import { useState } from 'react';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function HomeScreen() {
  const { setHasStarted } = useAppState();
  const colorScheme = useColorScheme() ?? 'light';
  const [loading, setLoading] = useState(false);

  const handleStart = () => {
    setLoading(true);
    // Simulate a brief loading state for button
    setTimeout(() => {
      setHasStarted(true);
      router.push('/pill-upload');
      setLoading(false);
    }, 300);
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerContainer}>
          <Image 
            source={require('@/assets/images/PillSnapLogo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <Card 
          title="About PillSnap"
          elevation="medium"
          style={styles.card}
        >
          <ThemedText style={styles.description}>
            PillSnap is a professional medical tool that helps you identify and track your medications 
            with ease and accuracy. Simply take photos of your pills to receive detailed identification 
            information.
          </ThemedText>
        </Card>

        <Card 
          title="How It Works"
          elevation="medium"
          style={styles.card}
        >
          <View style={styles.stepContainer}>
            <View style={styles.stepBadge}>
              <ThemedText style={styles.stepBadgeText}>1</ThemedText>
            </View>
            <ThemedText style={styles.stepText}>
              Take photos of the front and back of your pill
            </ThemedText>
          </View>
          
          <View style={styles.stepContainer}>
            <View style={styles.stepBadge}>
              <ThemedText style={styles.stepBadgeText}>2</ThemedText>
            </View>
            <ThemedText style={styles.stepText}>
              Our AI system analyzes the images to identify the medication
            </ThemedText>
          </View>
          
          <View style={styles.stepContainer}>
            <View style={styles.stepBadge}>
              <ThemedText style={styles.stepBadgeText}>3</ThemedText>
            </View>
            <ThemedText style={styles.stepText}>
              Review matches and save to your medication history
            </ThemedText>
          </View>
        </Card>

        <View style={styles.buttonContainer}>
          <ThemedButton
            title="Get Started"
            onPress={handleStart}
            size="large"
            loading={loading}
            buttonStyle={styles.startButton}
          />
        </View>

        <ThemedText type="caption" style={styles.disclaimer} greyText>
          PillSnap is designed as an informational tool only. 
          Always consult with a healthcare professional before taking any medication.
        </ThemedText>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingTop: 60,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    width: 180,
    height: 120,
    marginBottom: 16,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    opacity: 0.8,
  },
  card: {
    marginBottom: 16,
  },
  description: {
    lineHeight: 24,
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  stepBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#0077b6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  stepBadgeText: {
    color: 'white',
    fontWeight: 'bold',
  },
  stepText: {
    flex: 1,
  },
  buttonContainer: {
    marginVertical: 24,
    alignItems: 'center',
  },
  startButton: {
    width: '100%',
    height: 56,
  },
  disclaimer: {
    textAlign: 'center',
    marginBottom: 40,
  },
});