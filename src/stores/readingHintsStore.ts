import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ReadingHintsState {
  hasSeenReadingHint: boolean;
  markReadingHintSeen: () => void;
}

export const useReadingHintsStore = create<ReadingHintsState>()(
  persist(
    set => ({
      hasSeenReadingHint: false,
      markReadingHintSeen: () => set({ hasSeenReadingHint: true }),
    }),
    {
      name: 'hasSeenReadingHint',
    }
  )
);
