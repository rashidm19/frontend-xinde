import { create } from 'zustand';

interface MockStore {
  mockData: {
    listening: any;
    reading: any;
    speaking: any;
    writing: any;
  };
  setMockData: (value: MockStore['mockData']) => void;

  timer: number | null;
  setTimer: (value: MockStore['timer']) => void;
}

export const mockStore = create<MockStore>(set => ({
  mockData: {
    listening: null,
    reading: null,
    speaking: null,
    writing: null,
  },

  setMockData: value => set(() => ({ mockData: value })),

  timer: null,
  setTimer: value => set(() => ({ timer: value })),
}));
