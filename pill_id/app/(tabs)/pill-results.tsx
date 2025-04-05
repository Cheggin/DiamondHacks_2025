import { useEffect } from 'react';
import { StyleSheet, Image, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
export default function PillResultScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { photo1, photo2 } = route.params || {};

  useEffect(() => {
    if (!photo1 || !photo2) {
      navigation.goBack();
    }
  }, [photo1, photo2]);

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
      headerImage={<View />}>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Pill Identification</ThemedText>
      </ThemedView>

      {photo1 && (
        <ThemedView style={styles.imageContainer}>
          <ThemedText type="subtitle">Pill Photo 1</ThemedText>
          <Image source={{ uri: photo1 }} style={styles.image} />
        </ThemedView>
      )}

      {photo2 && (
        <ThemedView style={styles.imageContainer}>
          <ThemedText type="subtitle">Pill Photo 2</ThemedText>
          <Image source={{ uri: photo2 }} style={styles.image} />
        </ThemedView>
      )}

      <ThemedText>
        These pill photos will be analyzed using Gemini. Identification results will appear here soon.
      </ThemedText>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  imageContainer: {
    marginVertical: 12,
    gap: 4,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    resizeMode: 'contain',
  },
});