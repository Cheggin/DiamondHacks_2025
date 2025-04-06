import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function GlobalHeader() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.wrapper, { paddingTop: insets.top }]}>
      <View style={styles.container}>
        {/* Left: PillSnap Logo and Title */}
        <View style={styles.leftContainer}>
          <Image
            source={require('@/assets/images/PillSnapIcon.png')}
            style={styles.pillIcon}
          />
          <Text style={styles.title}>PillSnap</Text>
        </View>

        {/* Right: Profile Icon */}
        <TouchableOpacity onPress={() => {}} style={styles.profileIconContainer}>
          <Ionicons name="person-circle-outline" size={30} color="#0077b6" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0f2ff',
    zIndex: 999,
  },
  container: {
    height: 56,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pillIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
    marginRight: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0077b6',
  },
  profileIconContainer: {
    padding: 4,
  },
});
