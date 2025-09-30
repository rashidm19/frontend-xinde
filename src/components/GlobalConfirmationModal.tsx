'use client';

import { useCallback } from 'react';

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useCustomTranslations } from '@/hooks/useCustomTranslations';
import { cn } from '@/lib/utils';
import { useConfirmationModalStore } from '@/stores/confirmationModalStore';
import { useShallow } from 'zustand/react/shallow';

const parseErrorMessage = (error: unknown, fallback: string) => {
  if (!error) {
    return fallback;
  }

  if (typeof error === 'string') {
    return error;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (typeof error === 'object' && error !== null) {
    const response = (error as { response?: { data?: unknown } }).response;
    const data = response?.data as { message?: unknown; detail?: unknown } | undefined;

    if (typeof data?.message === 'string') {
      return data.message;
    }

    if (typeof data?.detail === 'string') {
      return data.detail;
    }
  }

  return fallback;
};

export const GlobalConfirmationModal = () => {
  const { tActions, tMessages } = useCustomTranslations();
  const { isOpen, options, isLoading, error, close, setLoading, setError } = useConfirmationModalStore(
    useShallow(state => ({
      isOpen: state.isOpen,
      options: state.options,
      isLoading: state.isLoading,
      error: state.error,
      close: state.close,
      setLoading: state.setLoading,
      setError: state.setError,
    }))
  );

  const confirmLabel = options?.confirmText ?? tActions('confirm');
  const cancelLabel = options?.cancelText ?? tActions('cancel');
  const fallbackError = tMessages('unexpectedError');

  const handleClose = useCallback(() => {
    if (isLoading || !isOpen) {
      return;
    }

    close();
  }, [close, isLoading, isOpen]);

  const handleConfirm = useCallback(async () => {
    if (!options?.onConfirm) {
      close();
      return;
    }

    setError(null);
    setLoading(true);

    try {
      await options.onConfirm();
      close();
    } catch (err) {
      setError(parseErrorMessage(err, fallbackError));
      setLoading(false);
    }
  }, [close, fallbackError, options, setError, setLoading]);

  return (
    <Dialog open={isOpen} onOpenChange={open => (!open ? handleClose() : undefined)}>
      <DialogContent
        className='fixed left-[50%] top-[50%] flex-col items-center justify-center flex h-auto min-w-[30%] -translate-x-1/2 -translate-y-1/2 rounded-[24rem] bg-white p-[28rem] text-left'
        onInteractOutside={event => {
          if (isLoading) {
            event.preventDefault();
          }
        }}
        onEscapeKeyDown={event => {
          if (isLoading) {
            event.preventDefault();
          }
        }}
      >
        <DialogHeader className='space-y-[12rem]'>
          <DialogTitle className='text-[20rem] font-semibold leading-tight text-d-black'>{options?.title}</DialogTitle>
          <DialogDescription className='text-[14rem] font-medium leading-normal text-d-black/80'>{options?.message}</DialogDescription>
        </DialogHeader>

        {error && <p className='mt-[12rem] text-[12rem] font-medium leading-tight text-d-red'>{error}</p>}

        <DialogFooter className='mt-[24rem] flex-row-reverse gap-[12rem]'>
          <button
            type='button'
            onClick={handleConfirm}
            disabled={isLoading}
            className={cn(
              'flex h-[50rem] min-w-[140rem] items-center justify-center rounded-full px-[32rem] text-[14rem] font-medium leading-none transition-colors disabled:cursor-not-allowed',
              options?.variant === 'destructive'
                ? 'bg-d-red text-white hover:bg-d-red/80 disabled:bg-d-red/60'
                : 'bg-d-green text-d-black hover:bg-d-green/40 disabled:bg-d-green/60'
            )}
          >
            {isLoading ? (
              <svg className='size-[20rem] animate-spin text-current' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'>
                <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' />
                <path
                  className='opacity-75'
                  fill='currentColor'
                  d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                />
              </svg>
            ) : (
              <span>{confirmLabel}</span>
            )}
          </button>

          <button
            type='button'
            onClick={handleClose}
            disabled={isLoading}
            className='flex h-[50rem] min-w-[140rem] items-center justify-center rounded-full border border-d-light-gray bg-white px-[32rem] text-[14rem] font-medium leading-none text-d-black transition-colors hover:bg-d-light-gray/80 disabled:cursor-not-allowed disabled:opacity-60'
          >
            {cancelLabel}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
