// app/(tabs)/pill-upload.tsx
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Image, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeProvider';
import { Typography } from '../../components/Typography';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { IconSymbol } from '@/components/ui/IconSymbol';

export const unstable_settings = {
  unmountOnBlur: true,
};

export default function PillUploadScreen() {
  const { theme } = useTheme();
  const [photo1, setPhoto1] = useState<string | null>(null);
  const [photo2, setPhoto2] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      setPhoto1(null);
      setPhoto2(null);
    }, [])
  );

  const requestCameraPermission = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    
    if (!permissionResult.granted) {
      Alert.alert(
        "Permission Required", 
        "Camera access is needed to take photos of your pills.",
        [{ text: "OK" }]
      );
      return false;
    }
    
    return true;
  };

  const pickImage = async (setImage: (uri: string) => void, imageType: 'photo1' | 'photo2') => {
    setLoading(true);
    
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      setLoading(false);
      return;
    }

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

  const handleContinue = () => {
    if (photo1 && photo2) {
      router.push({ pathname: '/pill-results', params: { photo1, photo2 } });
    } else {
      Alert.alert(
        "Missing Photos", 
        "Please take photos of both sides of the pill.",
        [{ text: "OK" }]
      );
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Typography variant="h2" align="center">
            Upload Pill Photos
          </Typography>
          <Typography variant="body" align="center" color={theme.textSecondary} style={styles.subtitle}>
            Take clear photos of both sides of your pill for accurate identification
          </Typography>
        </View>

        <View style={styles.photoGrid}>
          <Card 
            variant={photo1 ? "elevated" : "outlined"} 
            style={styles.photoCard}
            padding={0}
          >
            <TouchableOpacity 
              style={[
                styles.photoContainer,
                { borderColor: photo1 ? theme.primary : theme.border }
              ]}
              onPress={() => pickImage(setPhoto1, 'photo1')}
              disabled={loading}
            >
              {photo1 ? (
                <Image source={{ uri: photo1 }} style={styles.photoPreview} />
              ) : (
                <View style={styles.placeholderContent}>
                  <View style={[styles.iconCircle, { backgroundColor: theme.primaryLight }]}>
                    <IconSymbol name="doc.text" size={30} color={theme.primary} />
                  </View>
                  <Typography variant="h4" align="center" style={styles.placeholderTitle}>
                    Front Side
                  </Typography>
                  <Typography variant="body" align="center" color={theme.textSecondary}>
                    Tap to capture
                  </Typography>
                </View>
              )}
            </TouchableOpacity>
            {photo1 && (
              <Button
                title="Retake"
                variant="text"
                size="small"
                onPress={() => setPhoto1(null)}
                icon={<IconSymbol name="square.and.arrow.up.fill" size={16} color={theme.primary} />}
                style={styles.retakeButton}
              />
            )}
          </Card>

          <Card 
            variant={photo2 ? "elevated" : "outlined"} 
            style={styles.photoCard}
            padding={0}
          >
            <TouchableOpacity 
              style={[
                styles.photoContainer,
                { borderColor: photo2 ? theme.primary : theme.border }
              ]}
              onPress={() => pickImage(setPhoto2, 'photo2')}
              disabled={loading}
            >
              {photo2 ? (
                <Image source={{ uri: photo2 }} style={styles.photoPreview} />
              ) : (
                <View style={styles.placeholderContent}>
                  <View style={[styles.iconCircle, { backgroundColor: theme.primaryLight }]}>
                    <IconSymbol name="doc.text" size={30} color={theme.primary} />
                  </View>
                  <Typography variant="h4" align="center" style={styles.placeholderTitle}>
                    Back Side
                  </Typography>
                  <Typography variant="body" align="center" color={theme.textSecondary}>
                    Tap to capture
                  </Typography>
                </View>
              )}
            </TouchableOpacity>
            {photo2 && (
              <Button
                title="Retake"
                variant="text"
                size="small"
                onPress={() => setPhoto2(null)}
                icon={<IconSymbol name="square.and.arrow.up.fill" size={16} color={theme.primary} />}
                style={styles.retakeButton}
              />
            )}
          </Card>
        </View>

        <View style={styles.tipsContainer}>
          <Typography variant="h4" style={styles.tipsTitle}>
            Tips for Best Results
          </Typography>
          
          <View style={styles.tipRow}>
            <View style={[styles.tipIcon, { backgroundColor: theme.primaryLight }]}>
              <IconSymbol name="doc.text" size={20} color={theme.primary} />
            </View>
            <Typography variant="body" style={styles.tipText}>
              Use good lighting to show pill details clearly
            </Typography>
          </View>
          
          <View style={styles.tipRow}>
            <View style={[styles.tipIcon, { backgroundColor: theme.primaryLight }]}>
              <IconSymbol name="doc.text" size={20} color={theme.primary} />
            </View>
            <Typography variant="body" style={styles.tipText}>
              Place pill on a dark background for contrast
            </Typography>
          </View>
          
          <View style={styles.tipRow}>
            <View style={[styles.tipIcon, { backgroundColor: theme.primaryLight }]}>
              <IconSymbol name="doc.text" size={20} color={theme.primary} />
            </View>
            <Typography variant="body" style={styles.tipText}>
              Hold camera steady and close to the pill
            </Typography>
          </View>
        </View>

        <Button
          title="Continue to Results"
          fullWidth
          loading={loading}
          disabled={!photo1 || !photo2 || loading}
          onPress={handleContinue}
          style={styles.continueButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    flexGrow: 1,
  },
  header: {
    marginBottom: 24,
  },
  subtitle: {
    marginTop: 8,
  },
  photoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  photoCard: {
    width: '48%',
    overflow: 'visible',
  },
  photoContainer: {
    aspectRatio: 1,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
  },
  photoPreview: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  placeholderTitle: {
    marginVertical: 12,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  retakeButton: {
    alignSelf: 'center',
    marginTop: 8,
  },
  tipsContainer: {
    marginVertical: 24,
  },
  tipsTitle: {
    marginBottom: 16,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tipIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  tipText: {
    flex: 1,
  },
  continueButton: {
    marginTop: 'auto',
  },
});