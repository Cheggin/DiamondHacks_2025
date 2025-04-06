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
            position: 'absolute',
          },
          default: {},
        }),
      }}
    >
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
        //   title: 'Pill Results',
        //   tabBarIcon: ({ color }) => <IconSymbol size={28} name="doc.text" color={color} />,
        href: null
        }}
      />
      <Tabs.Screen
        name="test"
        options={{
          title: 'Test',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="flask.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="pill-history"
        options={{
          title: 'Pill History',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="clock.fill" color={color} />,
        }}/>
    </Tabs>
  );
}
