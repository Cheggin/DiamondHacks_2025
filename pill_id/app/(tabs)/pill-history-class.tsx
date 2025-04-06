import AsyncStorage from "@react-native-async-storage/async-storage";

export type PillEntry = {
  name: string;
  shape: string;
  color: string;
  dosage: string;
  timestamp: string;
};

const STORAGE_KEY = "pill_history";

export class PillHistory {
  private history: PillEntry[] = [];

  async load() {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) {
      this.history = JSON.parse(raw);
    }
  }

  private async save() {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(this.history));
  }

  async addPill(name: string, shape: string, color: string, dosage: string) {
    const entry: PillEntry = {
      name,
      shape,
      color,
      dosage,
      timestamp: new Date().toISOString(),
    };
    this.history.push(entry);
    await this.save();
  }

  getAll(): PillEntry[] {
    return [...this.history];
  }

  search(term: string): PillEntry[] {
    const lower = term.toLowerCase();
    return this.history.filter(
      (entry) =>
        entry.name.toLowerCase().includes(lower) ||
        entry.shape.toLowerCase().includes(lower) ||
        entry.color.toLowerCase().includes(lower) ||
        entry.dosage.toLowerCase().includes(lower)
    );
  }

  async clearHistory() {
    this.history = [];
    await AsyncStorage.removeItem(STORAGE_KEY);
  }
}
