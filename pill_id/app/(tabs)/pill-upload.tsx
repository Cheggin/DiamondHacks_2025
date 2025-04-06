import { useState, useEffect } from 'react';
import { Button, Image, StyleSheet, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';  // Import useFocusEffect

import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { ThemedButton } from '@/components/ThemedButton';
import React from 'react';

export const unstable_settings = {
  unmountOnBlur: true,
};

export default function PhotoUploadScreen() {
  const [photo1, setPhoto1] = useState<string | null>(null);
  const [photo2, setPhoto2] = useState<string | null>(null);

  useFocusEffect(
    React.useCallback(() => {
      setPhoto1(null);
      setPhoto2(null);
    }, [])
  );

  const pickImage = async (setImage: (uri: string) => void, imageType: 'photo1' | 'photo2') => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (!permissionResult.granted) {
      alert('Permission to access camera is required!');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 1,
      aspect: [1, 1],
      base64: false,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setImage(uri);

      if (imageType === 'photo1' && photo2) {
        router.push({ pathname: '/pill-results', params: { photo1: uri, photo2 } });
      } else if (imageType === 'photo2' && photo1) {
        router.push({ pathname: '/pill-results', params: { photo1, photo2: uri } });
      }
    }
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#caf0f8', dark: '#1D3D47' }}
      headerImage={<View />}
    >
      <ThemedView style={styles.container}>
        <ThemedText style={styles.centered} type="title">Upload Pill Photos</ThemedText>

        <View style={styles.uploadBox}>
          <ThemedButton title="Take front of pill photo" onPress={() => pickImage(setPhoto1, 'photo1')} />
          {photo1 && <Image source={{ uri: photo1 }} style={styles.imagePreview} />}
        </View>

        <View style={styles.uploadBox}>
          <ThemedButton title="Take back of pill photo" onPress={() => pickImage(setPhoto2, 'photo2')} />
          {photo2 && <Image source={{ uri: photo2 }} style={styles.imagePreview} />}
        </View>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 16,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
  },
  imagePreview: {
    width: '100%',
    height: 200,
    resizeMode: 'contain',
    borderRadius: 8,
    marginTop: 8,
  },
  uploadBox: {
    padding: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 12,
    backgroundColor: '#f9f9f9',
    alignItems: 'center', 
    justifyContent: 'center',
  },
});
