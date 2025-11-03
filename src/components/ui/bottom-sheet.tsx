'use client';

import * as DialogPrimitive from '@radix-ui/react-dialog';
import { useComposedRefs } from '@radix-ui/react-compose-refs';
import * as React from 'react';
import { motion, type PanInfo } from 'framer-motion';

import { cn } from '@/lib/utils';

type BottomSheetContextValue = {
  close: () => void;
  id: string;
};

const BottomSheetContext = React.createContext<BottomSheetContextValue | null>(null);

const useBottomSheetContext = () => {
  const context = React.useContext(BottomSheetContext);

  if (!context) {
    throw new Error('BottomSheet components must be used within <BottomSheet>.');
  }

  return context;
};

type BottomSheetProps = React.ComponentPropsWithoutRef<typeof DialogPrimitive.Root>;

export function BottomSheet({ children, onOpenChange, ...props }: BottomSheetProps) {
  const closeButtonRef = React.useRef<HTMLButtonElement | null>(null);
  const id = React.useId();

  const contextValue = React.useMemo(
    () => ({
      close: () => {
        if (onOpenChange) {
          onOpenChange(false);
        } else {
          closeButtonRef.current?.click();
        }
      },
      id,
    }),
    [id, onOpenChange]
  );

  return (
    <DialogPrimitive.Root onOpenChange={onOpenChange} {...props}>
      <BottomSheetContext.Provider value={contextValue}>
        <DialogPrimitive.Close ref={closeButtonRef} className='hidden' tabIndex={-1} aria-hidden />
        {children}
      </BottomSheetContext.Provider>
    </DialogPrimitive.Root>
  );
}

export const BottomSheetTrigger = DialogPrimitive.Trigger;

type BottomSheetOverlayProps = React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>;

const BottomSheetOverlay = React.forwardRef<HTMLDivElement, BottomSheetOverlayProps>(({ className, ...props }, ref) => {
  const { id } = useBottomSheetContext();

  return (
    <DialogPrimitive.Overlay asChild {...props}>
      <motion.div
        ref={ref}
        data-bottom-sheet-id={id}
        className={cn('fixed inset-0 z-[9998] bg-slate-900/50', className)}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { duration: 0.15, ease: 'easeOut' } }}
        exit={{ opacity: 0, transition: { duration: 0.12, ease: 'easeIn' } }}
      />
    </DialogPrimitive.Overlay>
  );
});
BottomSheetOverlay.displayName = 'BottomSheetOverlay';

type DialogPortalProps = React.ComponentPropsWithoutRef<typeof DialogPrimitive.Portal>;

interface BottomSheetContentProps extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  hideHandle?: boolean;
  container?: DialogPortalProps['container'];
  forceMount?: DialogPortalProps['forceMount'];
}

export const BottomSheetContent = React.forwardRef<HTMLDivElement, BottomSheetContentProps>(
  ({ className, children, container, forceMount, hideHandle = false, onPointerDownOutside, ...props }, forwardedRef) => {
    const { close, id } = useBottomSheetContext();
    const contentRef = React.useRef<HTMLDivElement | null>(null);
    const composedRefs = useComposedRefs(contentRef, forwardedRef);

    const handleDragEnd = React.useCallback(
      (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        const height = contentRef.current?.getBoundingClientRect().height ?? 0;
        if (height <= 0) {
          return;
        }

        const threshold = height * 0.25;
        if (info.offset.y > threshold || info.velocity.y > 700) {
          close();
        }
      },
      [close]
    );

    const handlePointerDownOutside = React.useCallback<NonNullable<BottomSheetContentProps['onPointerDownOutside']>>(
      event => {
        const originalEvent = event.detail.originalEvent;
        const target = (originalEvent?.target as Element | null) ?? null;
        const nestedSheet = target?.closest<HTMLElement>('[data-bottom-sheet-id]');

        if (nestedSheet && nestedSheet.getAttribute('data-bottom-sheet-id') !== id) {
          event.preventDefault();
        }

        onPointerDownOutside?.(event);
      },
      [id, onPointerDownOutside]
    );

    return (
      <DialogPrimitive.Portal forceMount={forceMount} container={container}>
        <BottomSheetOverlay />
        <DialogPrimitive.Content asChild onPointerDownOutside={handlePointerDownOutside} {...props}>
          <motion.div
            ref={composedRefs}
            data-bottom-sheet-id={id}
            className={cn(
              'fixed inset-x-0 bottom-0 z-[9999] mx-auto flex w-full max-w-[672rem] flex-col overflow-hidden rounded-t-[32rem] bg-white/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_24px_rgba(0,0,0,0.1)] backdrop-blur-lg',
              'max-h-[80dvh]',
              className
            )}
            initial={{ y: '100%' }}
            animate={{ y: 0, transition: { type: 'spring', duration: 0.25, damping: 22, stiffness: 320 } }}
            exit={{ y: '100%', transition: { duration: 0.2, ease: 'easeInOut' } }}
            drag='y'
            dragConstraints={{ top: 0, bottom: 0 }}
            dragDirectionLock
            dragElastic={{ top: 0, bottom: 0.4 }}
            onDragEnd={handleDragEnd}
          >
            {hideHandle ? null : (
              <span className='pointer-events-none mx-auto mt-[12rem] mb-[16rem] h-[6rem] w-[80rem] rounded-full bg-gray-300 opacity-70' />
            )}
            <div className='flex min-h-0 flex-1 flex-col overflow-hidden'>{children}</div>
          </motion.div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    );
  }
);
BottomSheetContent.displayName = 'BottomSheetContent';

export const BottomSheetClose = DialogPrimitive.Close;
