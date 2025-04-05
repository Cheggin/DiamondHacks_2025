import { useEffect, useState } from 'react';
import { View, Image, Text, ScrollView, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import * as FileSystem from 'expo-file-system';

export default function PillResultScreen() {
  const { photo1, photo2 } = useLocalSearchParams();
  const [result1, setResult1] = useState('');
  const [result2, setResult2] = useState('');

  useEffect(() => {
    if (photo1 && photo2) {
      sendBothPhotos(photo1 as string, photo2 as string);
    }
  }, [photo1, photo2]);

  const sendBothPhotos = async (photo1Uri: string, photo2Uri: string) => {
    try {
      const base64_1 = await FileSystem.readAsStringAsync(photo1Uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const base64_2 = await FileSystem.readAsStringAsync(photo2Uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const response = await fetch('http://<YOUR-IP>:5000/analyze-both', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image1: base64_1, image2: base64_2 }),
      });

      const data = await response.json();
      setResult1(data.response1);
      setResult2(data.response2);
    } catch (err) {
      console.error('Error sending to Gemini:', err);
      setResult1('Error analyzing image 1.');
      setResult2('Error analyzing image 2.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Gemini Pill Results</Text>

      {photo1 && (
        <>
          <Image source={{ uri: photo1 as string }} style={styles.image} />
          <Text>{result1 || 'Analyzing photo 1...'}</Text>
        </>
      )}

      {photo2 && (
        <>
          <Image source={{ uri: photo2 as string }} style={styles.image} />
          <Text>{result2 || 'Analyzing photo 2...'}</Text>
        </>
      )}
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
  },
});