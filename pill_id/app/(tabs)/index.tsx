import { useState } from 'react';
import { Button, Image, StyleSheet, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function PhotoUploadScreen() {
    const [photo1, setPhoto1] = useState<string | null>(null);
    const [photo2, setPhoto2] = useState<string | null>(null);
    
    const pickImage = async (setImage: (uri: string) => void) => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permissionResult.granted) {
            alert('Permission to access media library is required!');
            return;
        }
        
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 1,
        });
        
        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };
    
    return (
        <ParallaxScrollView
        headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
        headerImage={<View />}
        >
        <ThemedView style={styles.container}>
        <ThemedText type="title">Upload Pill Photos</ThemedText>
        
        <Button title="Upload Pill Photo 1" onPress={() => pickImage(uri => setPhoto1(uri))} />
        {photo1 && <Image source={{ uri: photo1 }} style={styles.imagePreview} />}
        
        <Button title="Upload Pill Photo 2" onPress={() => pickImage(uri => setPhoto2(uri))} />
        {photo2 && <Image source={{ uri: photo2 }} style={styles.imagePreview} />}
        </ThemedView>
        </ParallaxScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
        gap: 16,
    },
    imagePreview: {
        width: '100%',
        height: 200,
        resizeMode: 'contain',
        borderRadius: 8,
    },
});