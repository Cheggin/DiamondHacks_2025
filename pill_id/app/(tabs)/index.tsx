import { View, StyleSheet, Image } from 'react-native';
import { router } from 'expo-router';
import { useAppState } from './app-state';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { ThemedButton } from '@/components/ThemedButton';
import { useAuth0 } from '@/components/Auth0ProviderWrapper';

export default function HomeScreen() {
  const { setHasStarted } = useAppState();
  const { user, logout } = useAuth0();

  const handleStart = () => {
    setHasStarted(true);
    router.push('/pill-upload');
  };

  const handleLogout = async () => {
    try {
      await logout();
      // Router redirect happens in the tabs layout when auth state changes
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <Image
        source={require('@/assets/images/PillSnapLogo.png')}
        style={styles.logo}
      />
      <ThemedText type="title" style={styles.welcome}>
        Welcome to PillSnap!
      </ThemedText>
      
      {user && (
        <ThemedText style={styles.userGreeting}>
          Hello, {user.name || user.email || 'User'}
        </ThemedText>
      )}
      
      <ThemedText type="default" greyText style={styles.subtitle}>
        Effortless pill identification powered by AI and your camera.
      </ThemedText>

      {/* Info Boxes... */}
      <View style={styles.infoBox}>
        <ThemedText style={styles.infoTitle}>📘 About PillSnap</ThemedText>
        <ThemedText style={styles.infoText}>
          PillSnap uses advanced AI to help you identify unknown pills and keep track of your medication history—all in one place.
        </ThemedText>
      </View>

      <View style={styles.infoBox}>
        <ThemedText style={styles.infoTitle}>⚙️ How It Works</ThemedText>
        <ThemedText style={styles.infoText}>
          1. Take front & back photos of a pill{"\n"}
          2. Let Gemini identify your pill and suggest matches {"\n"}
          3. Save results
        </ThemedText>
      </View>

      <View style={styles.buttonWrapper}>
        <View style={styles.getStartedButton}>
          <ThemedButton title="🔍 Start Identifying Pills" onPress={handleStart} />
        </View>
        
        <View style={styles.logoutButtonContainer}>
          <ThemedButton 
            title="Sign Out" 
            onPress={handleLogout}
            buttonStyle={styles.logoutButton}
            textStyle={styles.logoutButtonText}
          />
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
      flex: 1,
      padding: 16,
      gap: 12,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#ffffff',
  },
  logo: {
      width: 300,
      height: 192,
      marginBottom: 4,
      resizeMode: 'contain',
  },
  welcome: {
      fontSize: 22,
      fontWeight: '700',
      textAlign: 'center',
  },
  userGreeting: {
      fontSize: 16,
      color: '#0077b6',
      fontWeight: '500',
      marginTop: 4,
      marginBottom: 8,
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
      marginBottom: 8,
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
  },
  getStartedButton: {
      backgroundColor: '#0077b6',
      padding: 10,
      borderRadius: 12,
      width: '80%',
      alignItems: 'center',
      marginBottom: 12,
  },
  logoutButtonContainer: {
      marginTop: 8,
      width: '80%',
  },
  logoutButton: {
      backgroundColor: '#f0f0f0',
      borderColor: '#ddd',
      borderWidth: 1,
  },
  logoutButtonText: {
      color: '#666',
  }
});