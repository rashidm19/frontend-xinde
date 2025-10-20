import { create } from 'zustand';

import type { MockOut } from '@/types/Mock';

interface MockStore {
  mockData: MockOut;
  setMockData: (value: MockOut) => void;

  timer: number | null;
  setTimer: (value: MockStore['timer']) => void;
}

const defaultMockData: MockOut = {
  listening: null,
  reading: null,
  writing: {
    part_1: null,
    part_2: null,
  },
  speaking: {
    part_1: null,
    part_2: null,
    part_3: null,
  },
};

export const mockStore = create<MockStore>(set => ({
  mockData: defaultMockData,

  setMockData: value => set(() => ({ mockData: value })),

  timer: null,
  setTimer: value => set(() => ({ timer: value })),
}));
