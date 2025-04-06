import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  FlatList,
  RefreshControl,
  Platform,
} from "react-native";
import { PillHistory } from "./pill-history-class";
import { useFocusEffect } from "expo-router";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Card } from "@/components/Card";
import { ThemedButton } from "@/components/ThemedButton";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

const history = new PillHistory();

type PillEntry = {
  name: string;
  shape: string;
  color: string;
  dosage: string;
  timestamp: number;
};

export default function PillHistoryScreen() {
  const [pills, setPills] = useState<PillEntry[]>([]);
  const [searchText, setSearchText] = useState("");
  const [filteredPills, setFilteredPills] = useState<PillEntry[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];

  const loadHistory = async () => {
    await history.load();
    const allPills = history.getAll();
    setPills(allPills);
    
    if (searchText) {
      setFilteredPills(history.search(searchText));
    } else {
      setFilteredPills(allPills);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [])
  );

  useEffect(() => {
    if (searchText) {
      setFilteredPills(history.search(searchText));
    } else {
      setFilteredPills(pills);
    }
  }, [searchText, pills]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadHistory();
    setRefreshing(false);
  };

  const handleSearch = (text: string) => {
    setSearchText(text);
  };

  const handleResetHistory = async () => {
    Alert.alert(
      "Clear History",
      "Are you sure you want to clear your entire pill history? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Clear",
          style: "destructive",
          onPress: async () => {
            await history.clear();
            await loadHistory();
            Alert.alert("Success", "Your pill history has been cleared.");
          },
        },
      ]
    );
  };

  const renderEmptyState = () => (
    <Card elevation="medium" style={styles.emptyCard}>
      <View style={styles.emptyStateContent}>
        <IconSymbol 
          name="doc.text" 
          color={colors.icon} 
          size={60}
        />
        <ThemedText type="subtitle" style={styles.emptyTitle}>
          No Pill History Found
        </ThemedText>
        <ThemedText style={styles.emptyDescription}>
          Identified medications will appear here. Scan a pill to get started.
        </ThemedText>
        <View style={styles.scanButton}>
          <ThemedButton
            title="Scan a Pill"
            onPress={() => {
              // Navigate to pill upload
            }}
            variant="primary"
          />
        </View>
      </View>
    </Card>
  );

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderPillItem = ({ item }: { item: PillEntry }) => (
    <Card elevation="low" style={styles.pillCard}>
      <View style={styles.pillHeader}>
        <ThemedText type="subtitle" numberOfLines={1} style={styles.pillName}>
          {item.name}
        </ThemedText>
        <ThemedText type="caption" style={styles.timestamp}>
          {formatDate(item.timestamp)}
        </ThemedText>
      </View>
      
      <View style={styles.pillDetails}>
        <View style={styles.pillProperty}>
          <ThemedText type="caption" greyText style={styles.propertyLabel}>
            Dosage
          </ThemedText>
          <ThemedText style={styles.propertyValue}>
            {item.dosage}
          </ThemedText>
        </View>
        
        <View style={styles.pillProperty}>
          <ThemedText type="caption" greyText style={styles.propertyLabel}>
            Color
          </ThemedText>
          <ThemedText style={styles.propertyValue}>
            {item.color}
          </ThemedText>
        </View>
        
        <View style={styles.pillProperty}>
          <ThemedText type="caption" greyText style={styles.propertyLabel}>
            Shape
          </ThemedText>
          <ThemedText style={styles.propertyValue}>
            {item.shape}
          </ThemedText>
        </View>
      </View>
    </Card>
  );

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="header" style={styles.header}>
        Medication History
      </ThemedText>
      
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <IconSymbol
            name="doc.text"
            color={colors.icon}
            size={16}
            style={styles.searchIcon}
          />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search by name, shape, color..."
            placeholderTextColor={colors.icon}
            value={searchText}
            onChangeText={handleSearch}
          />
          {searchText.length > 0 && (
            <TouchableOpacity 
              onPress={() => setSearchText("")}
              style={styles.clearButton}
            >
              <ThemedText style={styles.clearButtonText}>✕</ThemedText>
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      {pills.length === 0 ? (
        renderEmptyState()
      ) : (
        <>
          <View style={styles.resultsHeader}>
            <ThemedText type="defaultSemiBold">
              {filteredPills.length} {filteredPills.length === 1 ? 'Medication' : 'Medications'}
            </ThemedText>
            
            {pills.length > 0 && (
              <TouchableOpacity 
                onPress={handleResetHistory}
                style={styles.clearHistoryButton}
              >
                <ThemedText style={styles.clearHistoryText}>Clear All</ThemedText>
              </TouchableOpacity>
            )}
          </View>
          
          <FlatList
            data={filteredPills}
            renderItem={renderPillItem}
            keyExtractor={(item) => item.timestamp.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.pillsList}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={[colors.tint]}
                tintColor={colors.tint}
              />
            }
            ListEmptyComponent={
              searchText ? (
                <ThemedText style={styles.noResultsText}>
                  No medications match your search.
                </ThemedText>
              ) : null
            }
          />
        </>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginTop: 40,
    marginBottom: 20,
  },
  searchContainer: {
    marginBottom: 20,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: "#f9f9f9",
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 16,
    fontFamily: Platform.OS === 'ios' ? 'Helvetica' : 'Roboto',
  },
  clearButton: {
    padding: 6,
  },
  clearButtonText: {
    fontSize: 16,
    color: "#999",
  },
  resultsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  clearHistoryButton: {
    padding: 6,
  },
  clearHistoryText: {
    color: "#dc3545",
    fontWeight: "500",
  },
  pillsList: {
    paddingBottom: 100,
  },
  emptyCard: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyStateContent: {
    alignItems: "center",
    padding: 20,
  },
  emptyTitle: {
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  emptyDescription: {
    textAlign: "center",
    marginBottom: 24,
    opacity: 0.7,
  },
  scanButton: {
    minWidth: 150,
  },
  pillCard: {
    marginBottom: 12,
  },
  pillHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  pillName: {
    flex: 1,
    marginRight: 8,
  },
  timestamp: {
    opacity: 0.6,
  },
  pillDetails: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  pillProperty: {
    width: "33%",
    marginBottom: 10,
  },
  propertyLabel: {
    marginBottom: 4,
  },
  propertyValue: {
    fontWeight: "500",
  },
  noResultsText: {
    textAlign: "center",
    padding: 20,
    opacity: 0.7,
  },
});