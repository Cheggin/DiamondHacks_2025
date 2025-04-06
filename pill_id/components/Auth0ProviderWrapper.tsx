// components/Auth0ProviderWrapper.tsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import Auth0, { Credentials, User } from 'react-native-auth0';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Initialize Auth0 with your credentials
const auth0 = new Auth0({
  domain: 'dev-yy45rm73v447bxs5.us.auth0.com',
  clientId: 'UgJXQI6Nmcoh6wcZXO9v5y6vDVsn92gV', // Replace with your actual client ID
});

// Create a more comprehensive Auth0 context with authentication state
type Auth0ContextType = {
  auth0: Auth0;
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  login: () => Promise<Credentials>;
  logout: () => Promise<void>;
  refreshAuthState: () => Promise<void>;
};

const Auth0Context = createContext<Auth0ContextType | null>(null);

export const useAuth0 = () => {
  const context = useContext(Auth0Context);
  if (!context) {
    throw new Error('useAuth0 must be used within an Auth0ProviderWrapper');
  }
  return context;
};

export const Auth0ProviderWrapper = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  // Function to check if user has valid credentials
  const refreshAuthState = async () => {
    try {
      setIsLoading(true);
      // Try to get credentials from storage
      const credentialsString = await AsyncStorage.getItem('auth0Credentials');
      
      if (credentialsString) {
        const credentials = JSON.parse(credentialsString);
        const userInfo = await auth0.auth.userInfo({ token: credentials.accessToken });
        setUser(userInfo);
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (error) {
      console.log('Failed to get user info', error);
      // If error, assume user is not authenticated
      setIsAuthenticated(false);
      setUser(null);
      await AsyncStorage.removeItem('auth0Credentials');
    } finally {
      setIsLoading(false);
    }
  };

  // Login function
  const login = async (): Promise<Credentials> => {
    try {
      const credentials = await auth0.webAuth.authorize({
        scope: 'openid profile email',
        audience: 'https://dev-yy45rm73v447bxs5.us.auth0.com/userinfo',
      });
      
      // Save credentials to storage
      await AsyncStorage.setItem('auth0Credentials', JSON.stringify(credentials));
      
      // Get user info
      const userInfo = await auth0.auth.userInfo({ token: credentials.accessToken });
      setUser(userInfo);
      setIsAuthenticated(true);
      
      return credentials;
    } catch (error) {
      console.log('Login error', error);
      throw error;
    }
  };
  
  // Logout function
  const logout = async () => {
    try {
      await auth0.webAuth.clearSession();
      await AsyncStorage.removeItem('auth0Credentials');
      setIsAuthenticated(false);
      setUser(null);
    } catch (error) {
      console.log('Log out error', error);
      throw error;
    }
  };
  
  // Check authentication state on mount
  useEffect(() => {
    refreshAuthState();
  }, []);
  
  return (
    <Auth0Context.Provider 
      value={{ 
        auth0, 
        isAuthenticated, 
        isLoading, 
        user, 
        login, 
        logout,
        refreshAuthState
      }}
    >
      {children}
    </Auth0Context.Provider>
  );
};