import { View, StyleSheet, Image, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useAppState } from '../../components/app-state';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { ThemedButton } from '@/components/ThemedButton';

export default function HomeScreen() {
    const { setHasStarted } = useAppState();

    const handleStart = () => {
        setHasStarted(true);
        router.push('/pill-upload');
    };

    return (
        <ThemedView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <Image
                    source={require('@/assets/images/PillSnapLogo.png')}
                    style={styles.logo}
                />

                <ThemedText type="title" style={styles.welcome}>
                    Welcome to PillSnap!
                </ThemedText>
                <ThemedText type="default" greyText style={styles.subtitle}>
                    Effortless pill identification powered by AI and your camera.
                </ThemedText>

                {/* About PillSnap */}
                <View style={styles.infoBox}>
                    <ThemedText style={styles.infoTitle}>📘 About PillSnap</ThemedText>
                    <ThemedText style={styles.infoText}>
                        PillSnap uses advanced AI to help you identify unknown pills and keep track of your medication history—all in one place.
                    </ThemedText>
                </View>

                {/* How It Works */}
                <View style={styles.infoBox}>
                    <ThemedText style={styles.infoTitle}>⚙️ How It Works</ThemedText>
                    <ThemedText style={styles.infoText}>
                        1. Take front & back photos of a pill{"\n"}
                        2. Let Gemini identify your pill and suggest matches{"\n"}
                        3. Save results
                    </ThemedText>
                </View>

                {/* Button */}
                <View style={styles.buttonWrapper}>
                    <View style={styles.getStartedButton}>
                        <ThemedButton title="🚀 Get Started" onPress={handleStart} />
                    </View>
                </View>
            </ScrollView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    scrollContent: {
        padding: 16,
        gap: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    logo: {
        width: 392,
        height: 252,
        marginBottom: 4,
        resizeMode: 'contain',
        marginTop: 20,
    },
    welcome: {
        fontSize: 22,
        fontWeight: '700',
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 4,
    },
    infoBox: {
        width: '95%',
        backgroundColor: '#e0f7fa',
        borderColor: '#90e0ef',
        borderWidth: 1,
        borderRadius: 10,
        padding: 10,
    },
    infoTitle: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 4,
    },
    infoText: {
        fontSize: 13,
        lineHeight: 20,
    },
    buttonWrapper: {
        marginTop: 10,
        width: '100%',
        alignItems: 'center',
        marginBottom: 40,
    },
    getStartedButton: {
        backgroundColor: '#0077b6',
        padding: 10,
        borderRadius: 12,
        width: '80%',
        alignItems: 'center',
    },
});
