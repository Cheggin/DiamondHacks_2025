// app/(tabs)/index.tsx
import React from 'react';
import { View, StyleSheet, Image, ScrollView, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../theme/ThemeProvider';
import { Typography } from '../../components/Typography';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function HomeScreen() {
  const { theme, isDark } = useTheme();
  const { width } = useWindowDimensions();
  
  const features = [
    { 
      title: 'Instant Pill Recognition', 
      description: 'Take a photo and get accurate identification of your medication',
      icon: 'square.and.arrow.up.fill'
    },
    { 
      title: 'Medication Tracking', 
      description: 'Keep track of all your medications in one place',
      icon: 'doc.text'
    },
    { 
      title: 'Safe & Secure', 
      description: 'Your medical information stays private and secure',
      icon: 'house.fill'
    },
  ];

  return (
    <ScrollView 
      style={{ backgroundColor: theme.background }}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <LinearGradient
        colors={isDark ? ['#1D3D47', '#121212'] : ['#CAF0F8', '#FFFFFF']}
        style={styles.header}
      >
        <SafeAreaView edges={['top']}>
          <View style={styles.headerContent}>
            <Image 
              source={require('@/assets/images/PillSnapLogo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Typography 
              variant="body" 
              align="center"
              color={theme.textSecondary}
              style={styles.subtitle}
            >
              Identify and track your medications with just a photo
            </Typography>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <View style={styles.content}>
        <Button
          title="Get Started"
          size="large"
          fullWidth
          onPress={() => router.push('/pill-upload')}
          icon={<IconSymbol name="square.and.arrow.up.fill" size={20} color={theme.buttonText} />}
        />

        <Typography variant="h3" style={styles.sectionTitle}>
          How It Works
        </Typography>

        <View style={styles.steps}>
          <Card variant="elevated" style={styles.step}>
            <View style={[styles.stepNumber, { backgroundColor: theme.primary }]}>
              <Typography variant="h4" color={theme.white} style={styles.stepNumberText}>1</Typography>
            </View>
            <Typography variant="h4">Take Photo</Typography>
            <Typography variant="body" color={theme.textSecondary}>
              Capture front and back of your pill
            </Typography>
          </Card>

          <Card variant="elevated" style={styles.step}>
            <View style={[styles.stepNumber, { backgroundColor: theme.primary }]}>
              <Typography variant="h4" color={theme.white} style={styles.stepNumberText}>2</Typography>
            </View>
            <Typography variant="h4">Analyze</Typography>
            <Typography variant="body" color={theme.textSecondary}>
              Our AI identifies your medication
            </Typography>
          </Card>

          <Card variant="elevated" style={styles.step}>
            <View style={[styles.stepNumber, { backgroundColor: theme.primary }]}>
              <Typography variant="h4" color={theme.white} style={styles.stepNumberText}>3</Typography>
            </View>
            <Typography variant="h4">Results</Typography>
            <Typography variant="body" color={theme.textSecondary}>
              View detailed medication information
            </Typography>
          </Card>
        </View>

        <Typography variant="h3" style={styles.sectionTitle}>
          Features
        </Typography>

        {features.map((feature, index) => (
          <Card key={index} variant="outlined" style={styles.featureCard}>
            <View style={styles.featureHeader}>
              <View style={[styles.iconCircle, { backgroundColor: theme.primaryLight }]}>
                <IconSymbol 
                  name={feature.icon as any} 
                  size={24} 
                  color={theme.primary} 
                />
              </View>
              <Typography variant="h4">{feature.title}</Typography>
            </View>
            <Typography variant="body" color={theme.textSecondary}>
              {feature.description}
            </Typography>
          </Card>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 20,
    alignItems: 'center',
  },
  logo: {
    width: 240,
    height: 180,
  },
  subtitle: {
    marginTop: 8,
    paddingHorizontal: 20,
  },
  content: {
    padding: 24,
  },
  sectionTitle: {
    marginTop: 32,
    marginBottom: 16,
  },
  steps: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  step: {
    flex: 1,
    marginHorizontal: 4,
    padding: 12,
    alignItems: 'center',
  },
  stepNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepNumberText: {
    marginBottom: 0,  // Override default margin
    lineHeight: 20,   // Adjust lineHeight to better center the text
  },
  featureCard: {
    marginBottom: 16,
    padding: 20,
  },
  featureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
});