import React, { useState, useCallback } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { Table, Row, Rows } from "react-native-table-component";
import { PillHistory } from "./pill-history-class";
import { useFocusEffect } from "expo-router";

const history = new PillHistory();

export default function PillHistoryTable() {
  const [tableData, setTableData] = useState<string[][]>([]);
  const [searchText, setSearchText] = useState("");

  const tableHead = ["Name", "Shape", "Color", "Dosage", "Time"];

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
    const formatted = raw.map((pill) => [
      pill.name,
      pill.shape,
      pill.color,
      pill.dosage,
      new Date(pill.timestamp).toLocaleString(),
    ]);
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

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Pill History</Text>

      <TextInput
        style={styles.search}
        placeholder="Search by name, shape, color, or dosage..."
        value={searchText}
        onChangeText={handleSearch}
      />

      <Table borderStyle={{ borderWidth: 1, borderColor: "#ccc" }}>
        <Row data={tableHead} style={styles.head} textStyle={styles.headText} />
        <Rows data={tableData} />
      </Table>

      <TouchableOpacity style={styles.resetButton} onPress={handleResetHistory}>
        <Text style={styles.resetButtonText}>Reset History</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: "#fff", flex: 1 },
  title: { fontSize: 24, fontWeight: "600", marginBottom: 16, paddingTop: 30 },
  search: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  head: { height: 40, backgroundColor: "#f1f8ff" },
  headText: { margin: 6, fontWeight: "bold" },
  resetButton: {
    marginTop: 20,
    backgroundColor: "#e74c3c",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  resetButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});
