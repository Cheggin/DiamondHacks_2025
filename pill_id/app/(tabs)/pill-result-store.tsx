let pillData: any[] = [];

export const PillResultStore = {
  set: (data: any[]) => {
    pillData = data;
  },
  get: () => pillData,
};
