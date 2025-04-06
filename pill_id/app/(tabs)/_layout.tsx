import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, View, Text, StyleSheet } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useAppState } from './app-state';

export default function TabLayout() {
  const colorScheme = useColorScheme() ?? 'light';
  const { hasStarted } = useAppState();
  const colors = Colors[colorScheme];

  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: colors.tint,
        headerShown: false,
        tabBarBackground: TabBarBackground,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarButton: (props) => {
          const isHome = route.name === 'index';
          const isDisabled = !hasStarted && !isHome;

          // Only show Home tab when not started
          if (!hasStarted && !isHome) {
            return null;
          }

          return <HapticTab {...props} />;
        },
        tabBarStyle: [
          Platform.select({
            ios: { position: 'absolute' },
            default: {},
          }),
          // If not started, center the home tab
          !hasStarted && styles.centeredTabBar,
        ],
      })}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={24} name="house.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="pill-upload"
        options={{
          title: 'Scan Pill',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={24} name="square.and.arrow.up.fill" color={color} />
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
          title: 'Identify',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={24} name="flask.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="pill-history-page"
        options={{
          title: 'History',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={24} name="clock.fill" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarLabel: {
    fontWeight: '600',
    fontSize: 11,
    fontFamily: Platform.OS === 'ios' ? 'Helvetica' : 'Roboto',
  },
  centeredTabBar: {
    justifyContent: 'center', 
    alignItems: 'center',
  },
});