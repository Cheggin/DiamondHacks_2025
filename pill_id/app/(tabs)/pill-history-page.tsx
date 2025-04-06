// import React, { useEffect, useState } from "react";
// import {
//   View,
//   ScrollView,
//   StyleSheet,
//   Text,
//   TextInput,
// } from "react-native";
// import { Table, Row, Rows } from "react-native-table-component";
// import { PillHistory } from "./pill-history-class"; // <- should contain async `load` & `addPill`

// const history = new PillHistory();

// export default function PillHistoryTable() {
//   const [tableData, setTableData] = useState<string[][]>([]);
//   const [searchText, setSearchText] = useState("");

//   const tableHead = ["Name", "Shape", "Color", "Dosage", "Time"];

//   // 🔁 Modified useEffect to handle async loading
//   useEffect(() => {
//     (async () => {
//       await history.load(); // Load history from AsyncStorage

//       // Optional: Add mock data only if history is empty
//       if (history.getAll().length === 0) {
//         await history.addPill("Ibuprofen", "Round", "Orange", "200mg");
//         await history.addPill("Zoloft", "Capsule", "Green", "50mg");
//         await history.addPill("Adderall", "Oval", "Blue", "20mg");
//       }

//       refreshTable();
//     })();
//   }, []);

//   // 🔁 Make refreshTable async and await loading
//   const refreshTable = async (filter: string = "") => {
//     const raw = filter ? history.search(filter) : history.getAll();

//     const formatted = raw.map((pill) => [
//       pill.name,
//       pill.shape,
//       pill.color,
//       pill.dosage,
//       new Date(pill.timestamp).toLocaleString(),
//     ]);
//     setTableData(formatted);
//   };

//   const handleSearch = (text: string) => {
//     setSearchText(text);
//     refreshTable(text);
//   };

//   return (
//     <ScrollView style={styles.container}>
//       <Text style={styles.title}>Pill History</Text>

//       <TextInput
//         style={styles.search}
//         placeholder="Search by name, shape, color, or dosage..."
//         value={searchText}
//         onChangeText={handleSearch}
//       />

//       <Table borderStyle={{ borderWidth: 1, borderColor: "#ccc" }}>
//         <Row data={tableHead} style={styles.head} textStyle={styles.headText} />
//         <Rows data={tableData} textStyle={styles.text} />
//       </Table>
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { padding: 16, backgroundColor: "#fff", flex: 1 },
//   title: { fontSize: 24, fontWeight: "600", marginBottom: 16 },
//   search: {
//     height: 40,
//     borderColor: "#ccc",
//     borderWidth: 1,
//     borderRadius: 8,
//     paddingHorizontal: 12,
//     marginBottom: 16,
//   },
//   head: { height: 40, backgroundColor: "#f1f8ff" },
//   headText: { margin: 6, fontWeight: "bold" },
//   text: { margin: 6 },
// });
import React, { useEffect, useState } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
} from "react-native";
import { Table, Row, Rows } from "react-native-table-component";
import { PillHistory } from "./pill-history-class"; // <- should contain async `load` & `addPill`

const history = new PillHistory();

export default function PillHistoryTable() {
  const [tableData, setTableData] = useState<string[][]>([]);
  const [searchText, setSearchText] = useState("");

  const tableHead = ["Name", "Shape", "Color", "Dosage", "Time"];

  // 🔁 Modified useEffect to handle async loading
  useEffect(() => {
    (async () => {
      await history.load(); // Load history from AsyncStorage

      // Optional: Add mock data only if history is empty
      if (history.getAll().length === 0) {
        await history.addPill("Ibuprofen", "Round", "Orange", "200mg");
        await history.addPill("Zoloft", "Capsule", "Green", "50mg");
        await history.addPill("Adderall", "Oval", "Blue", "20mg");
      }

      refreshTable();
    })();
  }, []);

  // 🔁 Make refreshTable async and await loading
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
        <Rows data={tableData} textStyle={styles.text} />
      </Table>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: "#fff", flex: 1 },
  title: { fontSize: 24, fontWeight: "600", marginBottom: 16 },
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
  text: { margin: 6 },
});