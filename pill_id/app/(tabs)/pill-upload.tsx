import { useState, useEffect } from 'react';
import { 
  Image, 
  StyleSheet, 
  View, 
  ScrollView, 
  Alert, 
  Platform,
  TouchableOpacity 
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { ThemedButton } from '@/components/ThemedButton';
import { Card } from '@/components/Card';
import { IconSymbol } from '@/components/ui/IconSymbol';
import React from 'react';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export const unstable_settings = {
  unmountOnBlur: true,
};

export default function PhotoUploadScreen() {
  const [photo1, setPhoto1] = useState<string | null>(null);
  const [photo2, setPhoto2] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  useFocusEffect(
    React.useCallback(() => {
      setPhoto1(null);
      setPhoto2(null);
    }, [])
  );

  const checkCameraPermission = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert(
        "Camera Access Required", 
        "PillSnap needs camera access to take photos of your pills. Please enable camera access in your device settings.",
        [{ text: "OK" }]
      );
      return false;
    }
    return true;
  };

  const pickImage = async (setImage: (uri: string) => void, imageType: 'photo1' | 'photo2') => {
    if (loading) return;
    
    const hasPermission = await checkCameraPermission();
    if (!hasPermission) return;

    setLoading(true);

    try {
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
    } catch (error) {
      Alert.alert("Error", "Failed to take photo. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const proceedToResults = () => {
    if (photo1 && photo2) {
      setLoading(true);
      setTimeout(() => {
        router.push({ pathname: '/pill-results', params: { photo1, photo2 } });
        setLoading(false);
      }, 300);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ThemedText type="header" style={styles.header}>
          Pill Photo Upload
        </ThemedText>
        
        <Card 
          title="Instructions"
          elevation="low"
          style={styles.infoCard}
        >
          <ThemedText>
            For accurate identification, please take clear photos of both sides of the pill.
            Place the pill on a plain, contrasting background in good lighting.
          </ThemedText>
        </Card>
        
        <View style={styles.uploadContainer}>
          <Card 
            title="Front of Pill"
            elevation="medium"
            style={styles.uploadCard}
          >
            <View style={styles.imageContainer}>
              {photo1 ? (
                <Image source={{ uri: photo1 }} style={styles.imagePreview} />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <IconSymbol name="doc.text" color={colors.icon} size={40} />
                </View>
              )}
            </View>
            
            <ThemedButton 
              title={photo1 ? "Retake Photo" : "Take Photo"}
              onPress={() => pickImage(setPhoto1, 'photo1')}
              variant={photo1 ? "secondary" : "primary"}
              loading={loading && !photo1}
              icon={
                <IconSymbol 
                  name="square.and.arrow.up.fill" 
                  color={photo1 ? colors.tint : "white"} 
                  size={18} 
                />
              }
            />
          </Card>
          
          <Card 
            title="Back of Pill"
            elevation="medium"
            style={styles.uploadCard}
          >
            <View style={styles.imageContainer}>
              {photo2 ? (
                <Image source={{ uri: photo2 }} style={styles.imagePreview} />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <IconSymbol name="doc.text" color={colors.icon} size={40} />
                </View>
              )}
            </View>
            
            <ThemedButton 
              title={photo2 ? "Retake Photo" : "Take Photo"}
              onPress={() => pickImage(setPhoto2, 'photo2')}
              variant={photo2 ? "secondary" : "primary"}
              loading={loading && !photo2}
              icon={
                <IconSymbol 
                  name="square.and.arrow.up.fill" 
                  color={photo2 ? colors.tint : "white"} 
                  size={18} 
                />
              }
            />
          </Card>
        </View>
        
        {photo1 && photo2 && (
          <ThemedButton
            title="Proceed to Analysis"
            onPress={proceedToResults}
            loading={loading}
            size="large"
            buttonStyle={styles.proceedButton}
          />
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
  header: {
    marginBottom: 20,
    textAlign: 'center',
  },
  infoCard: {
    marginBottom: 20,
  },
  uploadContainer: {
    marginBottom: 24,
  },
  uploadCard: {
    marginBottom: 16,
  },
  imageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    height: 200,
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    resizeMode: 'contain',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9f9f9',
  },
  proceedButton: {
    alignSelf: 'center',
    width: '100%',
    marginTop: 16,
  },
});