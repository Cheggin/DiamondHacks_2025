import { useState, useEffect } from 'react';
import {
  Image,
  StyleSheet,
  View,
  ActivityIndicator,
  Text,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { ThemedButton } from '@/components/ThemedButton';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import * as Progress from 'react-native-progress';
import { InteractionManager } from 'react-native';
import GlobalHeader from '../../components/global-header';

export const unstable_settings = {
  unmountOnBlur: true,
};

export default function PhotoUploadScreen() {
  const [photo1, setPhoto1] = useState<string | null>(null);
  const [photo2, setPhoto2] = useState<string | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const insets = useSafeAreaInsets();

  useFocusEffect(
    React.useCallback(() => {
      setPhoto1(null);
      setPhoto2(null);
      setIsNavigating(false);
    }, [])
  );

  useEffect(() => {
    if (isNavigating) {
      const timer = setTimeout(() => {
        setIsNavigating(false); // fallback to recover from stuck state
      }, 10000); // 10 seconds
      return () => clearTimeout(timer);
    }
  }, [isNavigating]);

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

      const nextPhoto1 = imageType === 'photo1' ? uri : photo1;
      const nextPhoto2 = imageType === 'photo2' ? uri : photo2;

      if (nextPhoto1 && nextPhoto2) {
        setIsNavigating(true);
        router.push({
          pathname: '/pill-results',
          params: { photo1: nextPhoto1, photo2: nextPhoto2 },
        });
      }
    }
  };

  const uploadedCount = Number(!!photo1) + Number(!!photo2);
  const photoProgress = uploadedCount / 2;

  if (isNavigating) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0077b6" />
        <Text style={{ marginTop: 12, fontSize: 16, color: '#333' }}>
          Preparing analysis...
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <GlobalHeader />
      <ScrollView
        contentContainerStyle={[
          styles.scrollContainer,
          { paddingTop: insets.top + 72 }, // 24
        ]}
      >
        <ThemedView style={styles.container}>
          <Text style={styles.screenTitle}>Upload Pill Photos</Text>

          {uploadedCount > 0 && (
            <Text style={styles.progressText}>
              {photoProgress === 1 ? '100%' : '50%'} Complete
            </Text>
          )}

          <Progress.Bar
            progress={photoProgress}
            width={250}
            height={8}
            color="#0077b6"
            unfilledColor="#e0f2ff"
            borderWidth={0}
            borderRadius={5}
            style={{ marginBottom: 16 }}
          />

          <View style={styles.tipsBox}>
            <Text style={styles.tipsTitle}>📸 Tips for Best Results</Text>
            <View style={styles.tipRow}>
              <MaterialIcons name="brightness-6" size={20} color="#0077b6" />
              <Text style={styles.tipText}>Take photos in good lighting</Text>
            </View>
            <View style={styles.tipRow}>
              <Ionicons name="grid" size={20} color="#0077b6" />
              <Text style={styles.tipText}>Center the pill in the frame</Text>
            </View>
            <View style={styles.tipRow}>
              <MaterialIcons name="flip-camera-ios" size={20} color="#0077b6" />
              <Text style={styles.tipText}>Capture both sides of the pill</Text>
            </View>
          </View>

          <View style={styles.uploadBox}>
            <Ionicons name="camera" size={36} color="#0077b6" style={styles.icon} />
            <ThemedButton
              title="Take Picture of Pill Front"
              onPress={() => pickImage(setPhoto1, 'photo1')}
            />
            {photo1 && <Image source={{ uri: photo1 }} style={styles.imagePreview} />}
          </View>

          <View style={styles.uploadBox}>
            <Ionicons name="camera-reverse" size={36} color="#0096c7" style={styles.icon} />
            <ThemedButton
              title="Take Picture of Pill Back"
              onPress={() => pickImage(setPhoto2, 'photo2')}
            />
            {photo2 && <Image source={{ uri: photo2 }} style={styles.imagePreview} />}
          </View>
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    paddingBottom: 32,
  },
  container: {
    paddingHorizontal: 16,
    gap: 24,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: '600',
    textAlign: 'center',
    color: '#1a1a1a',
    marginTop: 10,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0077b6',
    marginTop: 4,
  },
  uploadBox: {
    width: '100%',
    padding: 20,
    marginVertical: 10,
    borderRadius: 16,
    backgroundColor: '#f0faff',
    borderWidth: 1,
    borderColor: '#d0eaff',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 3,
    alignItems: 'center',
  },
  imagePreview: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
    borderRadius: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  icon: {
    marginBottom: 12,
  },
  tipsBox: {
    backgroundColor: '#e9f8ff',
    borderColor: '#cbeaff',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    width: '100%',
  },
  tipsTitle: {
    fontWeight: '600',
    fontSize: 16,
    marginBottom: 8,
    color: '#0077b6',
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  tipText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#333',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});