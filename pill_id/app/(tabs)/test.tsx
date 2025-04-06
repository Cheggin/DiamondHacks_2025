import React, { useEffect, useState } from 'react';
import { PillHistory } from './pill-history-class';
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
import { PillResultStore } from '../(tabs)/pill-result-store';
import { useRouter } from 'expo-router';

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
    
    useEffect(() => {
        if (pills.length === 0) {
            Alert.alert('No drugs were found!', 'Please try again.', [
                {
                    text: 'OK',
                    onPress: () => router.replace('/(tabs)/pill-upload'),
                },
            ]);
        }
    }, []);
    
    const handleBoxSelect = (index: number) => {
        setSelectedBox(index === selectedBox ? null : index);
    };
    
    const handleViewMore = (index: number) => {
        setModalIndex(index);
        setModalVisible(true);
    };
    
    return (
        <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.header}>Select a Medication</Text>
        
        {pills.map((pill, index) => (
            <TouchableOpacity
            key={index}
            style={[styles.box, selectedBox === index && styles.selectedBox]}
            onPress={() => handleBoxSelect(index)}
            >
            <View style={styles.headerContainer}>
            <Text style={styles.title}>{pill.title}</Text>
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
                alert(`You selected: ${pills[selectedBox].title}`);
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
                
                router.push('/(tabs)/pill-history-page'); // ✅ Navigate after submit
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
        {modalIndex !== null && (
            <>
            <Text style={styles.modalTitle}>{pills[modalIndex].title}</Text>
            <Text>Imprint: {pills[modalIndex].imprint}</Text>
            <Text>Color: {pills[modalIndex].color}</Text>
            <Text>Shape: {pills[modalIndex].shape}</Text>
            <Text>Strength: {pills[modalIndex].strength}</Text>
            <TouchableOpacity
            onPress={() => setModalVisible(false)}
            style={styles.closeModal}
            >
            <Text style={{ color: 'white' }}>Close</Text>
            </TouchableOpacity>
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
        paddingTop: 16, // added top padding for consistent spacing across screens
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
    title: {
        paddingTop: 16,
        fontSize: 18,
        fontWeight: 'bold',
        flex: 1,
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
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    closeModal: {
        backgroundColor: '#0077b6',
        padding: 10,
        borderRadius: 8,
        marginTop: 16,
        alignItems: 'center',
    },
});
