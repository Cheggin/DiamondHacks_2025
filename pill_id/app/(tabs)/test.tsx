import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  SafeAreaView,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { PillHistory } from './pill-history-class';
import { PillResultStore } from '../(tabs)/pill-result-store';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';

export default function SelectableBoxPage() {
  const history = new PillHistory();
  const router = useRouter();
  const [selectedBox, setSelectedBox] = useState<number | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalIndex, setModalIndex] = useState<number | null>(null);

  const rawPills = PillResultStore.get();

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
      if (!pills || pills.length === 0) {
        Alert.alert('No medications found', undefined , [
          {
            text: 'OK',
            onPress: () => router.replace('/(tabs)/pill-upload'),
          },
        ]);
      }
    }, [pills])
  );

  const handleBoxSelect = (index: number) => {
    setSelectedBox(index === selectedBox ? null : index);
  };

  const handleViewMore = (index: number) => {
    setModalIndex(index);
    setModalVisible(true);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Text style={styles.header}>Select a Medication</Text>

          {pills.map((pill, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.box, selectedBox === index && styles.selectedBox]}
              onPress={() => handleBoxSelect(index)}
            >
              <View style={styles.headerContainer}>
                <View style={styles.titleContainer}>
                  <Text style={styles.title}>{pill.title}</Text>
                  {index === 0 && (
                    <Text style={styles.mostLikely}>(Most Likely)</Text>
                  )}
                </View>
                <Text style={styles.boxNumber}>{index + 1}</Text>
              </View>

              <TouchableOpacity
                style={styles.dropdown}
                onPress={() => handleViewMore(index)}
              >
                <Text style={styles.dropdownText}>View More Info</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.submitButton}
            onPress={async () => {
              if (selectedBox !== null) {
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
                  router.push('/(tabs)/pill-history-page');
                } else {
                  Alert.alert(
                    'Not Added',
                    'This medication is already in your history.'
                  );
                  router.push('/(tabs)/pill-history-page');
                }
              } else {
                alert('Please select a box');
              }
            }}
          >
            <Text style={styles.submitText}>Submit</Text>
          </TouchableOpacity>
        </View>

        <Modal
          visible={modalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              {modalIndex !== null && pills[modalIndex] && (
                <ScrollView style={{ maxHeight: 300 }}>
                  <Text>Imprint: {pills[modalIndex].imprint}</Text>
                  <Text>Color: {pills[modalIndex].color}</Text>
                  <Text>Shape: {pills[modalIndex].shape}</Text>
                  <Text>Strength: {pills[modalIndex].strength}</Text>

                  <Text style={{ marginTop: 12, fontWeight: 'bold' }}>
                    Reported Side Effects:
                  </Text>
                  {pills[modalIndex].side_effects?.length > 0 ? (
                    pills[modalIndex].side_effects.map((effect: string, i: number) => (
                      <Text key={i} style={{ marginLeft: 8 }}>
                        • {effect}
                      </Text>
                    ))
                  ) : (
                    <Text style={{ marginLeft: 8 }}>No side effects found.</Text>
                  )}

                  <TouchableOpacity
                    onPress={() => setModalVisible(false)}
                    style={styles.closeModal}
                  >
                    <Text style={{ color: 'white' }}>Close</Text>
                  </TouchableOpacity>
                </ScrollView>
              )}
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'white',
  },
  container: {
    padding: 16,
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 80,
    paddingTop: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  box: {
    padding: 16,
    marginVertical: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectedBox: {
    borderColor: '#0077b6',
    backgroundColor: '#e6f7ff',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  mostLikely: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#0077b6',
  },
  boxNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#00b4d8',
    color: 'white',
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: 'bold',
    fontSize: 14,
  },
  dropdown: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#0077b6',
    borderRadius: 4,
  },
  dropdownText: {
    color: 'white',
    textAlign: 'center',
  },
  footer: {
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: 'white',
  },
  submitButton: {
    backgroundColor: '#00b4d8',
    paddingVertical: 12,
    paddingHorizontal: 32,
    marginBottom: 80,
    borderRadius: 8,
    width: '90%',
    alignItems: 'center',
  },
  submitText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 8,
    width: '80%',
  },
  closeModal: {
    backgroundColor: '#0077b6',
    padding: 10,
    borderRadius: 8,
    marginTop: 16,
    alignItems: 'center',
  },
});