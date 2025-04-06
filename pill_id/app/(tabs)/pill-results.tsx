// app/(tabs)/pill-results.tsx
import React, { useEffect, useState } from 'react';
import { View, Image, StyleSheet, ScrollView, Platform, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import * as FileSystem from 'expo-file-system';
import * as Progress from 'react-native-progress';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeProvider';
import { Typography } from '../../components/Typography';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { IconSymbol } from '@/components/ui/IconSymbol';

type PillResult = {
  imprint: string;
  color: string;
  shape: string;
  '1st choice': string;
  '2nd choice': string;
  '3rd choice': string;
};

export default function PillResultScreen() {
  const { photo1, photo2 } = useLocalSearchParams();
  const { theme } = useTheme();
  const [result, setResult] = useState<PillResult | null>(null);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);

  useEffect(() => {
    if (photo1 && photo2) {
      sendBothPhotos(photo1 as string, photo2 as string);
    }
  }, [photo1, photo2]);

  const uriToBase64Web = async (uri: string): Promise<string> => {
    const response = await fetch(uri);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = (reader.result as string).split(',')[1];
        resolve(base64data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const getBase64 = async (uri: string): Promise<string> => {
    if (Platform.OS === 'web') {
      return await uriToBase64Web(uri);
    } else {
      return await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
    }
  };

  const sendBothPhotos = async (photo1Uri: string, photo2Uri: string) => {
    setLoading(true);
    setError(null);
    try {
      const base64_1 = await getBase64(photo1Uri);
      const base64_2 = await getBase64(photo2Uri);

      let progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 0.9) {
            clearInterval(progressInterval);
            return 0.9;
          }
          return prev + 0.1;
        });
      }, 500);

      const response = await fetch('http://100.80.6.211:5001/analyze-both', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image1: base64_1, image2: base64_2 }),
      });

      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }

      const data = await response.json();
      clearInterval(progressInterval);
      setProgress(1);
      setResult(data);
      setSelectedChoice(data['1st choice']);
    } catch (err) {
      console.error('Error analyzing pill:', err);
      setError('Error analyzing pill. Please try again.');
      setProgress(0);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectChoice = (choice: string) => {
    setSelectedChoice(choice);
  };

  const handleSaveMedication = () => {
    if (selectedChoice) {
      Alert.alert(
        "Medication Saved", 
        "This medication has been added to your records.",
        [{ text: "OK" }]
      );
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <Typography variant="h2" align="center">
          Pill Analysis Results
        </Typography>
        
        <View style={styles.photoRow}>
          {photo1 && (
            <Image 
              source={{ uri: photo1 as string }} 
              style={[styles.image, { borderColor: theme.border }]} 
            />
          )}
          {photo2 && (
            <Image 
              source={{ uri: photo2 as string }} 
              style={[styles.image, { borderColor: theme.border }]} 
            />
          )}
        </View>

        {loading && (
          <Card variant="outlined" style={styles.loadingCard}>
            <Typography variant="h4" align="center">
              Analyzing Pill Images
            </Typography>
            <Typography 
              variant="body" 
              color={theme.textSecondary} 
              align="center"
              style={styles.loadingText}
            >
              Our AI is identifying your medication
            </Typography>
            <Progress.Bar 
              progress={progress} 
              width={null} 
              height={10} 
              color={theme.primary} 
              unfilledColor={theme.primaryLight}
              borderWidth={0}
              borderRadius={5} 
              style={styles.progressBar}
            />
          </Card>
        )}

        {error && (
          <Card variant="outlined" style={styles.errorCard}>
            <Typography variant="h4" align="center" color={theme.error}>
              Analysis Failed
            </Typography>
            <Typography variant="body" align="center" style={styles.errorText}>
              {error}
            </Typography>
            <Button 
              title="Try Again" 
              onPress={() => {
                if (photo1 && photo2) {
                  sendBothPhotos(photo1 as string, photo2 as string);
                }
              }}
              style={styles.tryAgainButton}
            />
          </Card>
        )}

        {result && !loading && !error && (
          <View style={styles.resultsContainer}>
            <Card variant="elevated" style={styles.pillDetailsCard}>
              <Typography variant="h3">Pill Details</Typography>
              
              <View style={styles.detailRow}>
                <Typography variant="body" color={theme.textSecondary}>Imprint:</Typography>
                <Typography variant="body" weight="bold">{result.imprint}</Typography>
              </View>
              
              <View style={styles.detailRow}>
                <Typography variant="body" color={theme.textSecondary}>Color:</Typography>
                <Typography variant="body" weight="bold">{result.color}</Typography>
              </View>
              
              <View style={styles.detailRow}>
                <Typography variant="body" color={theme.textSecondary}>Shape:</Typography>
                <Typography variant="body" weight="bold">{result.shape}</Typography>
              </View>
            </Card>

            <Typography variant="h3" style={styles.sectionTitle}>
              Possible Matches
            </Typography>
            
            {result['1st choice'] !== 'N/A' && (
              <TouchableOpacity
                onPress={() => handleSelectChoice(result['1st choice'])}
                activeOpacity={0.8}
              >
                <Card 
                  variant={selectedChoice === result['1st choice'] ? "filled" : "outlined"} 
                  style={styles.matchCard}
                >
                  <View style={styles.matchCardHeader}>
                    <Typography variant="h4">
                      Best Match
                    </Typography>
                    {selectedChoice === result['1st choice'] && (
                      <View style={[styles.selectedBadge, { backgroundColor: theme.primary }]}>
                        <Typography variant="caption" color={theme.white}>
                          Selected
                        </Typography>
                      </View>
                    )}
                  </View>
                  <Typography variant="body">
                    {result['1st choice']}
                  </Typography>
                </Card>
              </TouchableOpacity>
            )}
            
            {result['2nd choice'] !== 'N/A' && (
              <TouchableOpacity
                onPress={() => handleSelectChoice(result['2nd choice'])}
                activeOpacity={0.8}
              >
                <Card 
                  variant={selectedChoice === result['2nd choice'] ? "filled" : "outlined"} 
                  style={styles.matchCard}
                >
                  <View style={styles.matchCardHeader}>
                    <Typography variant="h4">
                      Alternative Match
                    </Typography>
                    {selectedChoice === result['2nd choice'] && (
                      <View style={[styles.selectedBadge, { backgroundColor: theme.primary }]}>
                        <Typography variant="caption" color={theme.white}>
                          Selected
                        </Typography>
                      </View>
                    )}
                  </View>
                  <Typography variant="body">
                    {result['2nd choice']}
                  </Typography>
                </Card>
              </TouchableOpacity>
            )}
            
            {result['3rd choice'] !== 'N/A' && (
              <TouchableOpacity
                onPress={() => handleSelectChoice(result['3rd choice'])}
                activeOpacity={0.8}
              >
                <Card 
                  variant={selectedChoice === result['3rd choice'] ? "filled" : "outlined"} 
                  style={styles.matchCard}
                >
                  <View style={styles.matchCardHeader}>
                    <Typography variant="h4">
                      Possible Match
                    </Typography>
                    {selectedChoice === result['3rd choice'] && (
                      <View style={[styles.selectedBadge, { backgroundColor: theme.primary }]}>
                        <Typography variant="caption" color={theme.white}>
                          Selected
                        </Typography>
                      </View>
                    )}
                  </View>
                  <Typography variant="body">
                    {result['3rd choice']}
                  </Typography>
                </Card>
              </TouchableOpacity>
            )}
            
            {result['1st choice'] === 'N/A' && (
              <Card variant="outlined" style={styles.noResultsCard}>
                <Typography variant="h4" align="center">
                  No Matches Found
                </Typography>
                <Typography variant="body" align="center" color={theme.textSecondary} style={styles.noResultsText}>
                  We couldn't identify this pill based on the provided images. Try taking clearer photos or consulting a pharmacist.
                </Typography>
              </Card>
            )}
          </View>
        )}
        
        {result && selectedChoice && (
          <Button
            title="Save Medication"
            fullWidth
            onPress={handleSaveMedication}
            icon={<IconSymbol name="square.and.arrow.up.fill" size={20} color={theme.buttonText} />}
            style={styles.saveButton}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    flexGrow: 1,
  },
  photoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 24,
  },
  image: {
    width: '48%',
    height: undefined,
    aspectRatio: 1,
    borderRadius: 12,
    borderWidth: 1,
  },
  loadingCard: {
    padding: 24,
    alignItems: 'center',
  },
  loadingText: {
    marginVertical: 12,
  },
  progressBar: {
    width: '100%',
    marginTop: 12,
  },
  errorCard: {
    padding: 24,
    alignItems: 'center',
    marginVertical: 16,
  },
  errorText: {
    marginVertical: 12,
  },
  tryAgainButton: {
    marginTop: 12,
  },
  resultsContainer: {
    marginTop: 12,
  },
  pillDetailsCard: {
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  sectionTitle: {
    marginBottom: 16,
  },
  matchCard: {
    marginBottom: 16,
  },
  matchCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  selectedBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  noResultsCard: {
    padding: 24,
    alignItems: 'center',
  },
  noResultsText: {
    marginTop: 12,
    textAlign: 'center',
  },
  saveButton: {
    marginTop: 24,
  },
});
