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

const history = new PillHistory();

export default function PillHistoryTable() {
  const [tableData, setTableData] = useState<any[]>([]);
  const [searchText, setSearchText] = useState("");
  const insets = useSafeAreaInsets();

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
    refreshTable();
  };

  const renderItem = ({ item, index }: { item: any; index: number }) => (
    <View style={[styles.row, index % 2 === 0 && styles.altRow]}>
      <Text style={styles.cell}>{item.name}</Text>
      <Text style={styles.cell}>{item.shape}</Text>
      <Text style={styles.cell}>{item.color}</Text>
      <Text style={styles.cell}>{item.dosage}</Text>
      <Text style={styles.cell}>{item.time}</Text>
    </View>
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
          </>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="medkit-outline" size={64} color="#90e0ef" />
            <Text style={styles.emptyText}>No pill history yet</Text>
            <Text style={styles.emptySubtext}>Captured pills will show up here.</Text>
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
});