type PillEntry = {
  name: string;
  shape: string;
  color: string;
  dosage: string;
  timestamp: string;
};

export class PillHistory {
  private history: PillEntry[] = [];

  constructor(initialData?: PillEntry[]) {
    if (initialData) {
      this.history = [...initialData];
    }
  }

  addPill(name: string, shape: string, color: string, dosage: string) {
    const entry: PillEntry = {
      name,
      shape,
      color,
      dosage,
      timestamp: new Date().toISOString(),
    };
    this.history.push(entry);
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

  filterBy(field: keyof PillEntry, value: string): PillEntry[] {
    const lower = value.toLowerCase();
    return this.history.filter((entry) =>
      entry[field].toLowerCase().includes(lower)
    );
  }

  clearHistory() {
    this.history = [];
  }
}
