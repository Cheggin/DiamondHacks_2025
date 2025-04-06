import React, { useEffect, useState } from 'react';
import { PillHistory } from './pill-history-class';
import {
  View,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  SafeAreaView,
  Alert,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
} from 'react-native';
import { PillResultStore } from './pill-result-store';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Card } from '@/components/Card';
import { ThemedButton } from '@/components/ThemedButton';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function SelectableBoxPage() {
  const history = new PillHistory();
  const router = useRouter();
  const [selectedBox, setSelectedBox] = useState<number | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalIndex, setModalIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const rawPills = PillResultStore.get();
  const [isLoading, setIsLoading] = useState(true);

  // Filter out duplicate pills
  const pills = rawPills.filter((pill, index, self) => {
    return (
      index ===
      self.findIndex(
        (p) =>
          p.title === pill.title &&
          p.strength === pill.strength &&
          p.imprint === pill.imprint &&
          p.color === pill.color &&
          p.shape === pill.shape
      )
    );
  });

  useFocusEffect(
    useCallback(() => {
      setIsLoading(true);
      
      // Add a small delay to simulate loading and let the animation show
      setTimeout(() => {
        setIsLoading(false);
        
        if (pills.length === 0) {
          Alert.alert(
            'No Medications Found', 
            'We couldn\'t identify any medications from your photos. Please try again with clearer images.',
            [
              {
                text: 'Try Again',
                onPress: () => router.replace('/(tabs)/pill-upload'),
              },
            ]
          );
        }
      }, 800);
    }, [pills])
  );

  const handleBoxSelect = (index: number) => {
    setSelectedBox(index === selectedBox ? null : index);
  };

  const handleViewMore = (index: number) => {
    setModalIndex(index);
    setModalVisible(true);
  };

  const handleSubmit = async () => {
    if (selectedBox === null) {
      Alert.alert('Selection Required', 'Please select a medication first.');
      return;
    }

    setLoading(true);

    try {
      const selectedPill = pills[selectedBox];
      await history.load();

      const all = history.getAll();
      const alreadyExists = all.some(
        (p) =>
          p.name === selectedPill.title &&
          p.shape === (selectedPill.shape || 'unknown') &&
          p.color === (selectedPill.color || 'unknown') &&
          p.dosage === selectedPill.strength
      );

      if (!alreadyExists) {
        await history.addPill(
          selectedPill.title,
          selectedPill.shape || 'unknown',
          selectedPill.color || 'unknown',
          selectedPill.strength
        );
        await history.save();
      }

      // Show success message
      Alert.alert(
        'Medication Saved',
        `${selectedPill.title} has been added to your medication history.`,
        [
          {
            text: 'View History',
            onPress: () => router.push('/(tabs)/pill-history-page'),
          },
          {
            text: 'Scan Another',
            onPress: () => router.push('/(tabs)/pill-upload'),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to save medication to history. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.tint} />
        <ThemedText style={styles.loadingText}>Loading medication matches...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colorScheme === 'light' ? '#fff' : '#121212' }}>
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          <ThemedText type="header" style={styles.header}>
            Possible Matches
          </ThemedText>
          
          <ThemedText style={styles.subheader}>
            Select the medication that best matches your pill:
          </ThemedText>

          {pills.length === 0 ? (
            <Card elevation="medium" style={styles.noResultsCard}>
              <ThemedText style={styles.noResultsText}>
                No medications found. Please try again with clearer photos.
              </ThemedText>
              <ThemedButton
                title="Try Again"
                onPress={() => router.replace('/(tabs)/pill-upload')}
                variant="primary"
                buttonStyle={styles.tryAgainButton}
              />
            </Card>
          ) : (
            pills.map((pill, index) => (
              <Card
                key={index}
                elevation="medium"
                style={[
                  styles.pillCard,
                  selectedBox === index && styles.selectedCard,
                ]}
              >
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => handleBoxSelect(index)}
                  style={styles.pillCardContent}
                >
                  <View style={styles.pillCardHeader}>
                    <View style={styles.pillInfoContainer}>
                      <ThemedText type="subtitle" numberOfLines={2} style={styles.pillTitle}>
                        {pill.title}
                      </ThemedText>
                      
                      <View style={styles.pillAttributes}>
                        {pill.strength !== 'N/A' && (
                          <View style={styles.pillAttributeTag}>
                            <ThemedText type="caption" style={styles.pillAttributeText}>
                              {pill.strength}
                            </ThemedText>
                          </View>
                        )}
                        
                        {pill.color !== 'N/A' && (
                          <View style={styles.pillAttributeTag}>
                            <ThemedText type="caption" style={styles.pillAttributeText}>
                              {pill.color}
                            </ThemedText>
                          </View>
                        )}
                        
                        {pill.shape !== 'N/A' && (
                          <View style={styles.pillAttributeTag}>
                            <ThemedText type="caption" style={styles.pillAttributeText}>
                              {pill.shape}
                            </ThemedText>
                          </View>
                        )}
                      </View>
                    </View>
                    
                    <View style={styles.indexContainer}>
                      <View style={[styles.indexBadge, selectedBox === index && styles.selectedIndexBadge]}>
                        <ThemedText style={[styles.indexText, selectedBox === index && styles.selectedIndexText]}>
                          {index + 1}
                        </ThemedText>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.detailsButton}
                  onPress={() => handleViewMore(index)}
                >
                  <ThemedText style={styles.detailsButtonText}>
                    More Details
                  </ThemedText>
                  <IconSymbol name="chevron.right" size={14} color={colors.tint} />
                </TouchableOpacity>
              </Card>
            ))
          )}
        </ScrollView>

        {pills.length > 0 && (
          <View style={styles.footer}>
            <ThemedButton
              title={loading ? "Saving..." : "Confirm Selection"}
              onPress={handleSubmit}
              loading={loading}
              disabled={selectedBox === null || loading}
              size="large"
              buttonStyle={styles.submitButton}
            />
          </View>
        )}

        <Modal
          visible={modalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              {modalIndex !== null && pills[modalIndex] && (
                <>
                  <ThemedText type="header" style={styles.modalTitle}>
                    {pills[modalIndex].title}
                  </ThemedText>
                  
                  <View style={styles.modalDetailRow}>
                    <ThemedText type="defaultSemiBold">Strength:</ThemedText>
                    <ThemedText>{pills[modalIndex].strength}</ThemedText>
                  </View>
                  
                  <View style={styles.modalDetailRow}>
                    <ThemedText type="defaultSemiBold">Imprint:</ThemedText>
                    <ThemedText>{pills[modalIndex].imprint}</ThemedText>
                  </View>
                  
                  <View style={styles.modalDetailRow}>
                    <ThemedText type="defaultSemiBold">Color:</ThemedText>
                    <ThemedText>{pills[modalIndex].color}</ThemedText>
                  </View>
                  
                  <View style={styles.modalDetailRow}>
                    <ThemedText type="defaultSemiBold">Shape:</ThemedText>
                    <ThemedText>{pills[modalIndex].shape}</ThemedText>
                  </View>
                  
                  <View style={styles.modalActions}>
                    <ThemedButton
                      title="Select This Medication"
                      onPress={() => {
                        setSelectedBox(modalIndex);
                        setModalVisible(false);
                      }}
                      variant="primary"
                      buttonStyle={styles.modalSelectButton}
                    />
                    
                    <ThemedButton
                      title="Close"
                      onPress={() => setModalVisible(false)}
                      variant="outline"
                      buttonStyle={styles.modalCloseButton}
                    />
                  </View>
                </>
              )}
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
  },
  scrollContainer: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 120,
  },
  header: {
    marginBottom: 12,
  },
  subheader: {
    marginBottom: 24,
    opacity: 0.7,
  },
  noResultsCard: {
    padding: 20,
    alignItems: 'center',
  },
  noResultsText: {
    textAlign: 'center',
    marginBottom: 20,
  },
  tryAgainButton: {
    minWidth: 150,
  },
  pillCard: {
    marginBottom: 16,
    overflow: 'hidden',
  },
  selectedCard: {
    borderWidth: 2,
    borderColor: '#0077b6',
  },
  pillCardContent: {
    padding: 16,
  },
  pillCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  pillInfoContainer: {
    flex: 1,
    marginRight: 16,
  },
  pillTitle: {
    marginBottom: 8,
  },
  pillAttributes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 6,
  },
  pillAttributeTag: {
    backgroundColor: '#e6f7ff',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 8,
    marginBottom: 8,
  },
  pillAttributeText: {
    color: '#0077b6',
  },
  indexContainer: {
    justifyContent: 'flex-start',
  },
  indexBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#e6f7ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedIndexBadge: {
    backgroundColor: '#0077b6',
  },
  indexText: {
    color: '#0077b6',
    fontWeight: 'bold',
  },
  selectedIndexText: {
    color: 'white',
  },
  detailsButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  detailsButtonText: {
    color: '#0077b6',
    fontWeight: '500',
    marginRight: 4,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: Platform.OS === 'ios' ? 'rgba(255,255,255,0.9)' : 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  submitButton: {
    width: '100%',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '85%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    marginBottom: 16,
    textAlign: 'center',
  },
  modalDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  modalActions: {
    marginTop: 24,
  },
  modalSelectButton: {
    marginBottom: 12,
  },
  modalCloseButton: {}
});