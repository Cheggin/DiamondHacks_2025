import AsyncStorage from '@react-native-async-storage/async-storage';

type PillEntry = {
  name: string;
  shape: string;
  color: string;
  dosage: string;
  timestamp: number;
};

export class PillHistory {
  pills: PillEntry[] = [];

  async load() {
    const stored = await AsyncStorage.getItem('pill_history');
    this.pills = stored ? JSON.parse(stored) : [];
  }

  async save() {
    await AsyncStorage.setItem('pill_history', JSON.stringify(this.pills));
  }

  async addPill(name: string, shape: string, color: string, dosage: string) {
    this.pills.push({
      name,
      shape,
      color,
      dosage,
      timestamp: Date.now(),
    });
    await this.save();
  }

  getAll() {
    return this.pills;
  }

  search(query: string) {
    const lower = query.toLowerCase();
    return this.pills.filter(
      (p) =>
        p.name.toLowerCase().includes(lower) ||
        p.shape.toLowerCase().includes(lower) ||
        p.color.toLowerCase().includes(lower) ||
        p.dosage.toLowerCase().includes(lower)
    );
  }

  async clear() {
    this.pills = [];
    await AsyncStorage.removeItem('pill_history');
  }
}
