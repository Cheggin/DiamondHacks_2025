import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Platform, Animated, Easing } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as FileSystem from 'expo-file-system';
import * as Progress from 'react-native-progress';
import { PillResultStore } from '../../components/pill-result-store';
import { Ionicons } from '@expo/vector-icons';

export default function PillResultScreen() {
  const { photo1, photo2 } = useLocalSearchParams();
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const pulseAnim = new Animated.Value(1);

  useEffect(() => {
    if (photo1 && photo2) {
      sendBothPhotos(photo1 as string, photo2 as string);
      pulse();
    }
  }, [photo1, photo2]);

  const pulse = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

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

  const extractPill = (data: any, key: string): any | null => {
    const text = data[key];
    if (!text || text === 'N/A') return null;
    const name = text.split('Strength')[0].trim();
    const strength = text.match(/Strength (.*?) Imprint/)?.[1]?.trim() || 'N/A';
    const imprint = text.match(/Imprint (.*?) Color/)?.[1]?.trim() || 'N/A';
    const color = text.match(/Color (.*?) Shape/)?.[1]?.trim() || 'N/A';
    const shape = text.match(/Shape (.*?) View details/)?.[1]?.trim() || 'N/A';
    const side_effects = data[`${key} side effects`] || [];
    return { title: name, strength, imprint, color, shape, side_effects };
  };

  const extractAllChoices = (data: any) => {
    return ['1st choice', '2nd choice', '3rd choice']
      .map((key) => extractPill(data, key))
      .filter((pill) => pill !== null);
  };

  const sendBothPhotos = async (photo1Uri: string, photo2Uri: string) => {
    let progressInterval: NodeJS.Timeout | undefined;
    try {
      setLoading(true);
      setProgress(0);

      const base64_1 = await getBase64(photo1Uri);
      const base64_2 = await getBase64(photo2Uri);

      progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 1) {
            clearInterval(progressInterval!);
            return 1;
          }
          return prev + 0.05;
        });
      }, 400);

      console.log("Sending both photos for analysis...");
      const response = await fetch('http://100.80.14.54:5001/analyze-both', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image1: base64_1, image2: base64_2 }),
      });

      const data = await response.json();
      console.log("Received response from server:", data);

      for (const key of ['1st choice', '2nd choice', '3rd choice']) {
        const choiceName = data[key];
        const firstWord = choiceName?.split(' ')[0]?.trim();

        if (firstWord) {
          try {
            const fdaResponse = await fetch(
              `https://api.fda.gov/drug/event.json?search=patient.drug.medicinalproduct:"${firstWord}"&limit=10`
            );
            const fdaData = await fdaResponse.json();
            const allReactions = new Set<string>();

            for (const event of fdaData.results || []) {
              const reactions = event?.patient?.reaction || [];
              for (const reaction of reactions) {
                if (reaction?.reactionmeddrapt) {
                  allReactions.add(reaction.reactionmeddrapt);
                }
              }
            }

            data[`${key} side effects`] = Array.from(allReactions);
          } catch {
            data[`${key} side effects`] = ['Could not fetch side effects'];
          }
        }
      }

      const structured = extractAllChoices(data);
      PillResultStore.set(structured);

      clearInterval(progressInterval);
      setProgress(1);
      setLoading(false);
      router.push('/test');
    } catch (err) {
      console.error('Error analyzing combined image:', err);
      setProgress(0);
      setLoading(false);
      if (progressInterval) clearInterval(progressInterval);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Analyzing Your Pill Photos...</Text>

      <Animated.View style={[styles.iconContainer, { transform: [{ scale: pulseAnim }] }]}>
        <Ionicons name="medkit" size={72} color="#0077b6" />
      </Animated.View>

      <Text style={styles.subtext}>Hang tight! We’re using Gemini and FDA data to identify your medication.</Text>

      {loading && (
        <>
          <Progress.Bar
            progress={progress}
            width={250}
            height={10}
            color="#0077b6"
            unfilledColor="#e0f5ff"
            borderWidth={0}
            borderRadius={5}
            style={{ marginTop: 20 }}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    color: '#023e8a',
    marginBottom: 16,
  },
  subtext: {
    fontSize: 15,
    color: '#444',
    marginTop: 12,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  iconContainer: {
    marginTop: 8,
    marginBottom: 16,
    padding: 16,
    borderRadius: 50,
    backgroundColor: '#d0efff',
  },
});