import React, { useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ScrollView,
} from "react-native";
import { PillHistory } from "../../components/pill-history-class";
import { useFocusEffect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import GlobalHeader from "../../components/global-header";
import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator } from "react-native";


const history = new PillHistory();

export default function PillHistoryTable() {
  const [tableData, setTableData] = useState<any[]>([]);
  const [searchText, setSearchText] = useState("");
  const [selectedPills, setSelectedPills] = useState<any[]>([]);
  const [interactionResults, setInteractionResults] = useState<
    { title: string; description: string; applies_to: string }[]
  >([]);
  const insets = useSafeAreaInsets();
  const [isLoading, setIsLoading] = useState(false);


  useFocusEffect(
    useCallback(() => {
      (async () => {
        await history.load();
        refreshTable();
      })();
    }, [])
  );

  const refreshTable = async (filter: string = "") => {
    const raw = filter ? history.search(filter) : history.getAll();
    const formatted = raw.map((pill, index) => ({
      key: index.toString(),
      name: pill.name,
      shape: pill.shape,
      color: pill.color,
      dosage: pill.dosage,
      time: new Date(pill.timestamp).toLocaleString(),
    }));
    setTableData(formatted);
  };

  const handleSearch = (text: string) => {
    setSearchText(text);
    refreshTable(text);
  };

  const handleResetHistory = async () => {
    await history.clear();
    setSelectedPills([]);
    setInteractionResults([]);
    refreshTable();
  };

  const comparePills = async (pill1: any, pill2: any) => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `https://pills-backend-4.onrender.com/ddi?drug1_name=${pill1}&drug2_name=${pill2}`,
        { method: "GET" }
      );
      const result = await response.json();
      const ddiObject = result.ddi;
  
      if (ddiObject && typeof ddiObject === "object") {
        const interactionsArray = Object.values(ddiObject);
        setInteractionResults(interactionsArray as any[]);
      } else {
        setInteractionResults([]);
      }
    } catch (error) {
      console.error("Comparison API error:", error);
      setInteractionResults([
        {
          title: "Error",
          description: "Could not fetch interactions.",
          applies_to: "",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };
  

  const handlePillPress = (pill: any) => {
    let newSelection;

    if (selectedPills.some((p) => p.key === pill.key)) {
      newSelection = selectedPills.filter((p) => p.key !== pill.key);
    } else if (selectedPills.length < 2) {
      newSelection = [...selectedPills, pill];
    } else {
      return;
    }

    setSelectedPills(newSelection);
  };

  const handleComparePress = async () => {
    const drug1 = selectedPills[0].name.split(" ")[0];
    const drug2 = selectedPills[1].name.split(" ")[0];

    await comparePills(drug1, drug2);
    setSelectedPills([]);
  };

  const renderItem = ({ item, index }: { item: any; index: number }) => (
    <TouchableOpacity onPress={() => handlePillPress(item)} activeOpacity={0.7}>
      <View
        style={[
          styles.row,
          index % 2 === 0 && styles.altRow,
          selectedPills.some((p) => p.key === item.key) && styles.selectedRow,
        ]}
      >
        <Text style={styles.cell}>{item.name}</Text>
        <Text style={styles.cell}>{item.shape}</Text>
        <Text style={styles.cell}>{item.color}</Text>
        <Text style={styles.cell}>{item.dosage}</Text>
        <Text style={styles.cell}>{item.time}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <>
      <GlobalHeader />
      <ScrollView contentContainerStyle={[styles.container, { paddingTop: insets.top + 16 }]}>
        <Text style={styles.title}>Pill History</Text>

        <TextInput
          style={styles.search}
          placeholder="Search by name, shape, color, or dosage..."
          value={searchText}
          onChangeText={handleSearch}
        />

        {tableData.length > 0 ? (
          <>
            <View style={styles.headerRow}>
              <Text style={styles.headerCell}>Name</Text>
              <Text style={styles.headerCell}>Shape</Text>
              <Text style={styles.headerCell}>Color</Text>
              <Text style={styles.headerCell}>Dosage</Text>
              <Text style={styles.headerCell}>Time</Text>
            </View>

            <FlatList
              data={tableData}
              renderItem={renderItem}
              keyExtractor={(item) => item.key}
              scrollEnabled={false}
            />

            <TouchableOpacity style={styles.resetButton} onPress={handleResetHistory}>
              <Text style={styles.resetButtonText}>Reset History</Text>
            </TouchableOpacity>

            {selectedPills.length === 2 && (
              <TouchableOpacity style={styles.resetButton} onPress={handleComparePress}>
                <Text style={styles.resetButtonText}>Compare Selected Pills</Text>
              </TouchableOpacity>
            )}
            {isLoading && (
              <View style={{ marginTop: 16, alignItems: "center" }}>
                <Text style={{ marginBottom: 8 }}>Checking interactions...</Text>
                <ActivityIndicator size="large" color="#0077b6" />
              </View>
            )}
          </>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="medkit-outline" size={64} color="#90e0ef" />
            <Text style={styles.emptyText}>No pill history yet</Text>
            <Text style={styles.emptySubtext}>Captured pills will show up here.</Text>
          </View>
        )}

        {interactionResults.length > 0 && (
          <View style={styles.interactionBox}>
            <Text style={styles.interactionTitle}>Drug Interaction Warnings:</Text>
            {interactionResults.map((interaction, idx) => (
              <View key={idx} style={styles.interactionCard}>
                <Text style={styles.interactionHeader}>
                  {(interaction?.title ?? "Unknown").split(" ").join(" and ")}
                </Text>
                <Text style={styles.interactionSub}>{interaction?.applies_to ?? "N/A"}</Text>
                <Text style={styles.interactionText}>{interaction?.description ?? "Please try again."}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 16,
  },
  search: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: "row",
    backgroundColor: "#caf0f8",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#90e0ef",
  },
  headerCell: {
    flex: 1,
    paddingVertical: 8,
    fontWeight: "bold",
    fontSize: 12,
    textAlign: "center",
    borderRightWidth: 1,
    borderColor: "#90e0ef",
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#ffffff",
  },
  altRow: {
    backgroundColor: "#f9f9f9",
  },
  selectedRow: {
    backgroundColor: "#ade8f4",
  },
  cell: {
    flex: 1,
    paddingVertical: 6,
    fontSize: 12,
    textAlign: "center",
    borderRightWidth: 1,
    borderColor: "#eee",
  },
  resetButton: {
    marginTop: 24,
    backgroundColor: "#0077b6",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  resetButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#555",
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#888",
    marginTop: 4,
  },
  interactionBox: {
    marginTop: 24,
    padding: 16,
    backgroundColor: "#e0f7fa",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#b2ebf2",
  },
  interactionTitle: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#00796b",
    marginBottom: 8,
  },
  interactionCard: {
    marginBottom: 12,
    padding: 12,
    backgroundColor: "#ffffff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#b2ebf2",
  },
  interactionHeader: {
    fontSize: 15,
    fontWeight: "600",
    color: "#023e8a",
    marginBottom: 4,
  },
  interactionSub: {
    fontSize: 13,
    fontStyle: "italic",
    color: "#555",
    marginBottom: 4,
  },
  interactionText: {
    fontSize: 14,
    color: "#004d40",
  },
});
