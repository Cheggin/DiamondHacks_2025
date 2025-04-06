import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, TouchableOpacity } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useAppState } from '../../components/app-state';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { hasStarted } = useAppState(); 

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
    </Tabs>
  );
}
