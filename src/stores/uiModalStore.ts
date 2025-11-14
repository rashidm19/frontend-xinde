import { create } from 'zustand';

import type { ActiveModal, ModalKey } from '@/api/uiModals';

export interface UiModalInstance<K extends ModalKey = ModalKey> extends ActiveModal<K> {
  id: string;
}

interface UiModalState {
  current: UiModalInstance | null;
  queue: UiModalInstance[];
  setFromServer: (modals: ActiveModal[]) => void;
  removeModal: (id: string) => void;
  clear: () => void;
}

const buildInstance = (modal: ActiveModal): UiModalInstance => ({
  ...modal,
  id: `${modal.key}:${modal.version}`,
});

export const useUiModalStore = create<UiModalState>(set => ({
  current: null,
  queue: [],
  setFromServer: modals => {
    const instances = modals.map(buildInstance);

    if (instances.length === 0) {
      set({ current: null, queue: [] });
      return;
    }

    set(state => {
      if (state.current) {
        const updatedCurrent = instances.find(instance => instance.id === state.current?.id) ?? null;
        if (updatedCurrent) {
          const queue = instances.filter(instance => instance.id !== updatedCurrent.id);
          return {
            current: updatedCurrent,
            queue,
          };
        }
      }

      const [first, ...rest] = instances;
      return {
        current: first ?? null,
        queue: rest ?? [],
      };
    });
  },
  removeModal: id => {
    set(state => {
      if (state.current?.id === id) {
        const [next, ...rest] = state.queue;
        return {
          current: next ?? null,
          queue: rest ?? [],
        };
      }

      return {
        current: state.current,
        queue: state.queue.filter(instance => instance.id !== id),
      };
    });
  },
  clear: () => set({ current: null, queue: [] }),
}));
