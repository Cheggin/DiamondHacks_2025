import React, { useState } from 'react';
import { PillHistory } from './pill-history-class'; // Adjust path if needed

import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    Modal,
    SafeAreaView,
    Platform,
} from 'react-native';

export default function SelectableBoxPage() {
    const history = new PillHistory();
    const [selectedBox, setSelectedBox] = useState<number | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [modalIndex, setModalIndex] = useState<number | null>(null);
    
    const handleBoxSelect = (index: number) => {
        setSelectedBox(index === selectedBox ? null : index);
    };
    
    const handleViewMore = (index: number) => {
        setModalIndex(index);
        setModalVisible(true);
    };
    
    const pills = [
        {
            title: 'Ibuprofen',
            imprint: 'IBU 600',
            strength: '600 mg',
            drugClass: 'Nonsteroidal anti-inflammatory drugs',
            availability: 'Rx and/or OTC',
            csaSchedule: 'Not a controlled drug',
            labeler: 'Sandoz Pharmaceuticals Inc.',
        },
        {
            title: 'Aspirin',
            imprint: 'ASP 500',
            strength: '500 mg',
            drugClass: 'Nonsteroidal anti-inflammatory drugs',
            availability: 'Rx and/or OTC',
            csaSchedule: 'Not a controlled drug',
            labeler: 'Bayer Healthcare',
        },
        {
            title: 'Paracetamol',
            imprint: 'PAR 250',
            strength: '250 mg',
            drugClass: 'Analgesics',
            availability: 'OTC',
            csaSchedule: 'Not a controlled drug',
            labeler: 'Acme Pharmaceuticals',
        },
    ];
    
    return (
        <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
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
            <Text>Imprint: {pill.imprint}</Text>
            <Text>Strength: {pill.strength}</Text>
            <Text>Drug Class: {pill.drugClass}</Text>
            
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
                // Load history first (optional if already loaded earlier)
                const selectedPill = pills[selectedBox];
                await history.load();
                
                // Save selected pill to history
                await history.addPill(
                    selectedPill.title,
                    "unknown", // shape — not shown in your UI (can add if you have it)
                    "unknown", // color — same
                    selectedPill.strength
                );
            } else {
                alert('Please select a box');
            }
        }}
        >
        <Text style={styles.submitText}>Submit</Text>
        </TouchableOpacity>
        </View>
        
        {/* Modal for dropdown info */}
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
            <Text style={styles.modalTitle}>
            {pills[modalIndex].title}
            </Text>
            <Text>Availability: {pills[modalIndex].availability}</Text>
            <Text>CSA Schedule: {pills[modalIndex].csaSchedule}</Text>
            <Text>Labeler/Supplier: {pills[modalIndex].labeler}</Text>
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
        </View>
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
        flexDirection: 'row', // Align the title and badge in a row
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        flex: 1,
        // color: '#00b4d8',
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
        paddingTop: 16,
        alignItems: 'center',
    },
    submitButton: {
        // backgroundColor: '#0077b6',
        backgroundColor: '#00b4d8',
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderRadius: 8,
        width: '100%',
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