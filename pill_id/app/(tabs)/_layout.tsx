// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { useTheme } from '../../theme/ThemeProvider';

export default function TabLayout() {
  const { theme } = useTheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textSecondary,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',
            backgroundColor: theme.card,
            borderTopWidth: 0,
            elevation: 0,
            height: 88,
            paddingBottom: 20,
          },
          default: {
            backgroundColor: theme.card,
            borderTopWidth: 0,
            elevation: 8,
            height: 60,
          },
        }),
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        }
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="pill-upload"
        options={{
          title: 'Scan',
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="square.and.arrow.up.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="pill-results"
        options={{
          title: 'Results',
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="doc.text" color={color} />,
        }}
      />
    </Tabs>
  );
}