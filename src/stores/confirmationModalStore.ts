import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export type ConfirmationModalVariant = 'default' | 'destructive';

export interface ConfirmationModalOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => Promise<void> | void;
  variant?: ConfirmationModalVariant;
}

interface ConfirmationModalState {
  isOpen: boolean;
  isLoading: boolean;
  error: string | null;
  options: ConfirmationModalOptions | null;
  open: (options: ConfirmationModalOptions) => void;
  close: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useConfirmationModalStore = create<ConfirmationModalState>()(
  devtools(
    set => ({
      isOpen: false,
      isLoading: false,
      error: null,
      options: null,

      open: (options) =>
        set((s) =>
          s.isOpen && s.options === options && !s.isLoading && s.error === null
            ? s
            : { ...s, isOpen: true, isLoading: false, error: null, options }
        ),

      close: () =>
        set((s) =>
          !s.isOpen && !s.isLoading && s.error === null && s.options === null
            ? s
            : { ...s, isOpen: false, isLoading: false, error: null, options: null }
        ),

      setLoading: isLoading => set({ isLoading }),
      setError: error => set({ error }),
    }),
    {
      name: 'confirmation-modal-store',
      anonymousActionType: 'CONFIRMATION_MODAL',
    }
  )
);

export const openConfirmationModal = (options: ConfirmationModalOptions) => useConfirmationModalStore.getState().open(options);

export const closeConfirmationModal = () => useConfirmationModalStore.getState().close();
