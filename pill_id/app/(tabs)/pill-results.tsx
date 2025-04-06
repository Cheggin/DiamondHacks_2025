import { useEffect, useState } from 'react';
import { 
  View, 
  Image, 
  ScrollView, 
  StyleSheet, 
  Platform,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as FileSystem from 'expo-file-system';
import * as Progress from 'react-native-progress';
import { PillResultStore } from './pill-result-store';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Card } from '@/components/Card';
import { ThemedButton } from '@/components/ThemedButton';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function PillResultScreen() {
  const { photo1, photo2 } = useLocalSearchParams();
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState<'uploading' | 'analyzing' | 'processing' | 'complete' | 'error'>('uploading');
  const [error, setError] = useState<string | null>(null);
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  useEffect(() => {
    if (photo1 && photo2) {
      sendBothPhotos(photo1 as string, photo2 as string);
    }
  }, [photo1, photo2]);

  const uriToBase64Web = async (uri: string): Promise<string> => {
    const response = await fetch(uri);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = (reader.result as string).split(',')[1];
        resolve(base64data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const getBase64 = async (uri: string): Promise<string> => {
    if (Platform.OS === 'web') {
      return await uriToBase64Web(uri);
    } else {
      return await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
    }
  };

  const extractPill = (text: string | null): any | null => {
    if (!text || text === 'N/A') return null;
    const name = text.split('Strength')[0].trim();
    const strength = text.match(/Strength (.*?) Imprint/)?.[1]?.trim() || 'N/A';
    const imprint = text.match(/Imprint (.*?) Color/)?.[1]?.trim() || 'N/A';
    const color = text.match(/Color (.*?) Shape/)?.[1]?.trim() || 'N/A';
    const shape = text.match(/Shape (.*?) View details/)?.[1]?.trim() || 'N/A';
    return { title: name, strength, imprint, color, shape };
  };

  const extractAllChoices = (data: any) => {
    return ['1st choice', '2nd choice', '3rd choice']
      .map((key) => extractPill(data[key]))
      .filter((pill) => pill !== null);
  };

  const sendBothPhotos = async (photo1Uri: string, photo2Uri: string) => {
    try {
      // Start with upload phase
      setStep('uploading');
      setProgress(0.1);
      
      const base64_1 = await getBase64(photo1Uri);
      setProgress(0.3);
      
      const base64_2 = await getBase64(photo2Uri);
      setProgress(0.5);
      
      // Move to analyzing phase
      setStep('analyzing');
      setProgress(0.6);

      const response = await fetch('http://100.80.6.211:5001/analyze-both', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image1: base64_1, image2: base64_2 }),
      });

      // Check if response is ok
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }

      // Move to processing phase
      setStep('processing');
      setProgress(0.8);

      const data = await response.json();
      
      // Complete the process
      setStep('complete');
      setProgress(1);

      const structured = extractAllChoices(data);
      
      if (structured.length === 0) {
        setStep('error');
        setError('No pill matches were found. Please try again with clearer photos.');
        return;
      }

      PillResultStore.set(structured);
      
      // Navigate to results page after brief delay to show completion
      setTimeout(() => {
        router.push('/test');
      }, 1000);

    } catch (err) {
      console.error('Error analyzing pill:', err);
      setStep('error');
      setError('There was an error analyzing your pill. Please try again.');
      setProgress(0);
    }
  };

  const getStepLabel = () => {
    switch(step) {
      case 'uploading': return 'Uploading photos...';
      case 'analyzing': return 'Analyzing pill features...';
      case 'processing': return 'Processing matches...';
      case 'complete': return 'Analysis complete!';
      case 'error': return 'Error';
      default: return 'Processing...';
    }
  };

  const handleRetry = () => {
    router.replace('/pill-upload');
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ThemedText type="header" style={styles.title}>
          Pill Analysis
        </ThemedText>

        <Card 
          title="Your photos"
          elevation="low"
          style={styles.photoCard}
        >
          <View style={styles.photosContainer}>
            {photo1 && (
              <View style={styles.photoWrapper}>
                <ThemedText type="caption" style={styles.photoLabel}>Front</ThemedText>
                <Image source={{ uri: photo1 as string }} style={styles.image} />
              </View>
            )}
            
            {photo2 && (
              <View style={styles.photoWrapper}>
                <ThemedText type="caption" style={styles.photoLabel}>Back</ThemedText>
                <Image source={{ uri: photo2 as string }} style={styles.image} />
              </View>
            )}
          </View>
        </Card>

        <Card 
          title="Analysis Status"
          elevation="medium" 
          style={styles.statusCard}
        >
          <ThemedText type="defaultSemiBold" style={styles.stepLabel}>
            {getStepLabel()}
          </ThemedText>
          
          {step !== 'error' ? (
            <View style={styles.progressContainer}>
              <Progress.Bar
                progress={progress}
                width={null}
                height={8}
                color={colors.tint}
                unfilledColor={colorScheme === 'light' ? '#e0e0e0' : '#333333'}
                borderWidth={0}
                borderRadius={4}
                style={styles.progressBar}
              />
              <ThemedText type="caption" style={styles.progressText}>
                {Math.round(progress * 100)}%
              </ThemedText>
            </View>
          ) : (
            <View style={styles.errorContainer}>
              <ThemedText style={styles.errorText}>{error}</ThemedText>
              <View style={styles.retryButton}>
                <ThemedButton
                  title="Try Again"
                  onPress={handleRetry}
                  variant="primary"
                  size="medium"
                />
              </View>
            </View>
          )}
        </Card>

        {step === 'complete' && (
          <ThemedText type="subtitle" style={styles.processingText}>
            Redirecting to results...
          </ThemedText>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  title: {
    marginBottom: 24,
    textAlign: 'center',
  },
  photoCard: {
    marginBottom: 20,
  },
  photosContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  photoWrapper: {
    width: '48%',
  },
  photoLabel: {
    marginBottom: 8,
    textAlign: 'center',
  },
  image: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  statusCard: {
    marginBottom: 20,
  },
  stepLabel: {
    marginBottom: 12,
    textAlign: 'center',
  },
  progressContainer: {
    marginVertical: 8,
  },
  progressBar: {
    width: '100%',
    marginBottom: 8,
  },
  progressText: {
    textAlign: 'right',
  },
  errorContainer: {
    alignItems: 'center',
    padding: 10,
  },
  errorText: {
    color: '#dc3545',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    marginTop: 10,
  },
  processingText: {
    textAlign: 'center',
    marginTop: 20,
  },
});