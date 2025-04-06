import { Tabs, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { Platform, TouchableOpacity } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useAppState } from './app-state';
import { useAuth0 } from '@/components/Auth0ProviderWrapper';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { hasStarted, setHasStarted } = useAppState();
  const { isAuthenticated, isLoading } = useAuth0();
  const router = useRouter();

  // Check authentication status when the component mounts
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Redirect to login if not authenticated
      router.replace('/login');
    } else if (isAuthenticated) {
      // If authenticated, mark as started
      setHasStarted(true);
    }
  }, [isAuthenticated, isLoading, router, setHasStarted]);

  // If still loading auth status or not authenticated, don't render tabs
  if (isLoading || !isAuthenticated) {
    return null;
  }

  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarBackground: TabBarBackground,
        tabBarButton: (props) => {
          const isHome = route.name === 'index';
          const isDisabled = !hasStarted && !isHome;

          // Disable tab if not started and it's not Home
          if (isDisabled) {
            return (
              <TouchableOpacity disabled style={[props.style, { opacity: 0.3 }]} />
            );
          }

          return <HapticTab {...props} />;
        },
        tabBarStyle: Platform.select({
          ios: { position: 'absolute' },
          default: {},
        }),
      })}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="house.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="pill-upload"
        options={{
          title: 'Pill Upload',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="square.and.arrow.up.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="pill-results"
        options={{
          href: null, // always hidden from tabs
        }}
      />
      <Tabs.Screen
        name="test"
        options={{
          title: 'Pill Identification',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="flask.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="pill-history-page"
        options={{
          title: 'Pill History',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="clock.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="login"
        options={{
          href: null, // Hide from tabs (though we're not using this one anymore)
        }}
      />
    </Tabs>
  );
}