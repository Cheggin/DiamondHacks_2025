import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute', // Optional: If you want the tab bar at the bottom to be fixed
          },
          default: {},
        }),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="pill-upload"
        options={{
          title: 'Pill Upload',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="square.and.arrow.up.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="pill-results"
        options={{
          title: 'Pill Results',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="doc.text" color={color} />,
          // tabBarLabelStyle: {
          //   fontSize: 14, // Custom font size for the tab label
          //   fontWeight: 'bold', // Custom font weight
          //   color: Colors[colorScheme ?? 'light'].text, // Custom text color
          // },
          // tabBarStyle: {
          //   backgroundColor: Colors[colorScheme ?? 'light'].background, // Tab bar background color
          //   height: 60, // Set a custom height for the tab bar
          //   paddingBottom: 8, // Padding for the tab bar for better spacing
          // },
        }}
      />
    </Tabs>
  );
}