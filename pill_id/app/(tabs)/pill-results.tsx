import { useEffect, useState } from 'react';
import { View, Image, Text, ScrollView, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import * as FileSystem from 'expo-file-system';
import * as Progress from 'react-native-progress';  // Import Progress bar

export default function PillResultScreen() {
  const { photo1, photo2 } = useLocalSearchParams();
  // const [result1, setResult1] = useState('');
  // const [result2, setResult2] = useState('');
  const [result, setResult] = useState('');
  const [progress, setProgress] = useState(0); // For progress tracking

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

      // Simulate progress by updating the progress every second
      let progressInterval = setInterval(() => {
        setProgress((prevProgress) => {
          if (prevProgress >= 1) {
            clearInterval(progressInterval);
            return 1;
          }
          return prevProgress + 0.1; // Increase progress by 10%
        });
      }, 500);

      const response = await fetch('http://100.80.6.211:5001/analyze-both', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image1: base64_1, image2: base64_2 }),
      });

      const data = await response.json();
      setResult(JSON.stringify(data));

      // Clear progress interval once response is received
      clearInterval(progressInterval);
      setProgress(1);  // Set progress to 100% when done
    } catch (err) {
      console.error('Error sending to Gemini:', err);
      setResult('Error analyzing combined image.');
      setProgress(0); // Reset progress on error
    }
  };

  // {photo1 && (
  //   <>
  //     <Image source={{ uri: photo1 as string }} style={styles.image} />
  //     <Text>{result1 || 'Analyzing photo 1...'}</Text>
  //   </>
  // )}

  // {photo2 && (
  //   <>
  //     <Image source={{ uri: photo2 as string }} style={styles.image} />
  //     <Text>{result2 || 'Analyzing photo 2...'}</Text>
  //   </>
  // )}

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Gemini Pill Results</Text>

      {/* Show progress bar */}
      <Progress.Bar 
        progress={progress} 
        width={300} 
        height={10} 
        color="#3498db" 
        borderWidth={0} 
        unfilledColor="#ecf0f1"
        borderRadius={5} 
      />

      {result && (
        <Text style={{ marginTop: 16 }}>{result}</Text>
      )}
      {(!result) && (
        <Text style={{ marginTop: 16 }}>Analyzing photos...</Text>
      )}

      {photo1 && (
        <>
          <Image source={{ uri: photo1 as string }} style={styles.image} />
          <Text>{/* {result1 || 'Analyzing photo 1...'} */}</Text>
        </>
      )}

      {photo2 && (
        <>
          <Image source={{ uri: photo2 as string }} style={styles.image} />
          <Text>{/* {result2 || 'Analyzing photo 2...'} */}</Text>
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
