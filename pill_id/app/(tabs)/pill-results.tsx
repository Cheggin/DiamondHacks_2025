  import React, { useEffect, useState } from 'react';
  import { View, Image, Text, ScrollView, StyleSheet, Platform } from 'react-native';
  import { useLocalSearchParams, useRouter } from 'expo-router';
  import * as FileSystem from 'expo-file-system';
  import * as Progress from 'react-native-progress';
  import { PillResultStore } from '../(tabs)/pill-result-store';
  import TestScreen from './test'; // Ensure this path is correct


  export default function PillResultScreen() {
    const { photo1, photo2 } = useLocalSearchParams();
    const router = useRouter();
    const [result, setResult] = useState('');
    const [progress, setProgress] = useState(0);

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

    // const extractPill = (text: string | null): any | null => {
    //   if (!text || text === 'N/A') return null;
    //   const name = text.split('Strength')[0].trim();
    //   const strength = text.match(/Strength (.*?) Imprint/)?.[1]?.trim() || 'N/A';
    //   const imprint = text.match(/Imprint (.*?) Color/)?.[1]?.trim() || 'N/A';
    //   const color = text.match(/Color (.*?) Shape/)?.[1]?.trim() || 'N/A';
    //   const shape = text.match(/Shape (.*?) View details/)?.[1]?.trim() || 'N/A';
    //   const side_effects = text && result?.[`${text} side effects`] || [];
    //   return { title: name, strength, imprint, color, shape };
    // };
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
    

    // const extractAllChoices = (data: any) => {
    //   return ['1st choice', '2nd choice', '3rd choice']
    //     .map((key) => extractPill(data[key]))
    //     .filter((pill) => pill !== null);
    // };
    const extractAllChoices = (data: any) => {
      return ['1st choice', '2nd choice', '3rd choice']
        .map((key) => extractPill(data, key))
        .filter((pill) => pill !== null);
    };
    

    const sendBothPhotos = async (photo1Uri: string, photo2Uri: string) => {
      try {
        const base64_1 = await getBase64(photo1Uri);
        const base64_2 = await getBase64(photo2Uri);

        let progressInterval = setInterval(() => {
          setProgress((prev) => {
            if (prev >= 1) {
              clearInterval(progressInterval);
              return 1;
            }
            return prev + 0.1;
          });
        }, 500);

        const response = await fetch('http://100.81.22.146:5001/analyze-both', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image1: base64_1, image2: base64_2 }),
        });

        const data = await response.json();

        const choices = ['1st choice', '2nd choice', '3rd choice'];

        for (const choiceKey of choices) {
          const choiceName = data[choiceKey];
          const firstWord = choiceName?.split(' ')[0]?.trim();

          if (firstWord) {
            try {
              const fdaResponse = await fetch(
                `https://api.fda.gov/drug/event.json?search=patient.drug.medicinalproduct:"${firstWord}"&limit=10`
              );

              if (fdaResponse.ok) {
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

                data[`${choiceKey} side effects`] = Array.from(allReactions);
              } else {
                console.warn(`FDA API error for ${choiceKey}: ${fdaResponse.status}`);
                data[`${choiceKey} side effects`] = ['Could not fetch side effects'];
              }
            } catch (apiErr) {
              console.warn(`Error fetching FDA data for ${firstWord}`, apiErr);
              data[`${choiceKey} side effects`] = ['Error during fetch'];
            }
          }
        }

        clearInterval(progressInterval);
        setProgress(1);
        setResult(JSON.stringify(data, null, 2));

        const structured = extractAllChoices(data);
        PillResultStore.set(structured);
        router.push('/test');

      } catch (err) {
        console.error('Error analyzing combined image:', err);
        setResult('Error analyzing combined image.');
        setProgress(0);
      }
    };

    return (
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Gemini Pill Results</Text>

        {photo1 && <Image source={{ uri: photo1 as string }} style={styles.image} />}
        {photo2 && <Image source={{ uri: photo2 as string }} style={styles.image} />}

        {!result && (
          <>
            <Text style={{ marginTop: 16 }}>Analyzing photos...</Text>
            <Progress.Bar 
              progress={progress} 
              width={300} 
              height={10} 
              color="#3498db" 
              borderWidth={0} 
              unfilledColor="#ecf0f1"
              borderRadius={5} 
              style={{ marginTop: 10 }}
            />
          </>
        )}

        {result && (
          <Text style={styles.resultText}>{result}</Text>
        )}

        <TestScreen result={result} />
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
      paddingTop: 30,
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
