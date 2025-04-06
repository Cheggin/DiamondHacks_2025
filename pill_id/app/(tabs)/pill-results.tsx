import { useEffect, useState } from 'react';
import { View, Image, Text, ScrollView, StyleSheet, Platform } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import * as FileSystem from 'expo-file-system';
import * as Progress from 'react-native-progress';  // Import Progress bar

export default function PillResultScreen() {
  const { photo1, photo2 } = useLocalSearchParams();
  const [result, setResult] = useState('');
  const [progress, setProgress] = useState(0); // For progress tracking

  useEffect(() => {
    if (photo1 && photo2) {
      sendBothPhotos(photo1 as string, photo2 as string);
    }
  }, [photo1, photo2]);

  // Convert image URI to base64 on web
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

  // Get base64 for both platforms
  const getBase64 = async (uri: string): Promise<string> => {
    if (Platform.OS === 'web') {
      return await uriToBase64Web(uri);
    } else {
      return await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
    }
  };

  const sendBothPhotos = async (photo1Uri: string, photo2Uri: string) => {
    try {
      const base64_1 = await getBase64(photo1Uri);
      const base64_2 = await getBase64(photo2Uri);

      const response = await fetch('http://100.81.22.146:5001/analyze-both', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image1: base64_1, image2: base64_2 }),
      });

      const data = await response.json();
      setResult(JSON.stringify(data, null, 2)); // pretty print
    } catch (err) {
      console.error('Error sending to Gemini:', err);
      setResult('Error analyzing combined image.');
      setProgress(0); // Reset progress on error
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Gemini Pill Results</Text>

      {photo1 && (
        <Image source={{ uri: photo1 as string }} style={styles.image} />
      )}
      {photo2 && (
        <Image source={{ uri: photo2 as string }} style={styles.image} />
      )}

      <Text style={styles.resultText}>
        {result || 'Analyzing photos...'}
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  image: {
    width: 300,
    height: 300,
    resizeMode: 'contain',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  resultText: {
    marginTop: 16,
    fontFamily: Platform.OS === 'web' ? 'monospace' : 'Courier',
    fontSize: 14,
    paddingHorizontal: 8,
  },
});

