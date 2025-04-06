// app/login.tsx (or wherever)
import { View, Button, Alert } from 'react-native';
import { useAuth0 } from '@/components/Auth0ProviderWrapper'; // assuming this exists

export default function LoginScreen() {
  const auth0 = useAuth0();

  const login = async () => {
    try {
      const credentials = await auth0.webAuth.authorize({
        scope: 'openid profile email',
        audience: 'https://dev-yy45rm73v447bxs5.us.auth0.com/userinfo',
      });
      Alert.alert('Logged in!', JSON.stringify(credentials));
    } catch (e) {
      console.log('Login error', e);
      Alert.alert('Login failed', e instanceof Error ? e.message : String(e));
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Button title="Login with Auth0" onPress={login} />
    </View>
  );
}