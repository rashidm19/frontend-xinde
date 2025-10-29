'use client';

import * as React from 'react';
import { motion } from 'framer-motion';

import { cn } from '@/lib/utils';
import { BottomSheetClose } from '@/components/ui/bottom-sheet';

const BACK_BUTTON_DIMENSION_CLASS = 'size-[36rem]';
const HEADER_ANIMATION = {
  initial: { y: -12, opacity: 0 },
  animate: { y: 0, opacity: 1 },
  exit: { y: -12, opacity: 0 },
  transition: { type: 'spring', stiffness: 260, damping: 28 },
};

interface HeaderSlots {
  left: React.ReactNode;
  center: React.ReactNode;
  right: React.ReactNode;
  className?: string;
}

const HeaderContent = ({ left, center, right, className }: HeaderSlots) => (
  <div className={cn('flex items-center gap-[12rem]', className)}>
    <div className='flex min-h-[44rem] min-w-[44rem] items-center justify-start'>{left}</div>
    <div className='flex-1'>{center}</div>
    <div className='flex min-h-[44rem] min-w-[44rem] items-center justify-end'>{right}</div>
  </div>
);

const PlaceholderSlot = () => <span className={BACK_BUTTON_DIMENSION_CLASS} aria-hidden='true' />;

export interface MobilePageHeaderProps {
  title: string;
  subtitle?: string;
  back?: boolean;
  rightAction?: React.ReactNode;
  onBack?: () => void;
  backLabel?: string;
  className?: string;
}

export const MobilePageHeader = ({ title, subtitle, back = true, rightAction, onBack, backLabel = 'Back', className }: MobilePageHeaderProps) => {
  const handleBack = React.useCallback(() => {
    if (onBack) {
      onBack();
      return;
    }

    if (typeof window !== 'undefined') {
      window.history.back();
    }
  }, [onBack]);

  const leftSlot = back ? (
    <button
      type='button'
      onClick={handleBack}
      aria-label={backLabel}
      className={cn(
        BACK_BUTTON_DIMENSION_CLASS,
        'flex items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-d-violet/40'
      )}
    >
      <img src='/images/icon_chevron--back.svg' alt='' className='size-[14rem]' />
    </button>
  ) : (
    <PlaceholderSlot />
  );

  const hasRightAction = rightAction !== undefined && rightAction !== null;
  const rightSlot = hasRightAction ? <div className='flex items-center'>{rightAction}</div> : <PlaceholderSlot />;

  return (
    <motion.header
      {...HEADER_ANIMATION}
      role='banner'
      aria-label={title}
      className={cn('sticky top-0 z-40 border-b border-slate-100 bg-white/95 px-[20rem] pb-[12rem] pt-[calc(16rem+env(safe-area-inset-top))] backdrop-blur', className)}
    >
      <HeaderContent
        left={leftSlot}
        right={rightSlot}
        center={
          <div className='flex flex-col gap-[4rem]'>
            <h1 className='text-center text-[18rem] font-semibold leading-[120%] text-slate-900'>{title}</h1>
            {subtitle ? <p className='line-clamp-2 text-center text-[14rem] leading-[140%] text-slate-500'>{subtitle}</p> : null}
          </div>
        }
      />
    </motion.header>
  );
};

export interface BottomSheetHeaderProps {
  title: string;
  subtitle?: string;
  back?: boolean;
  onBack?: () => void;
  backLabel?: string;
  rightAction?: React.ReactNode;
  closeButton?: boolean;
  onClose?: () => void;
  closeLabel?: string;
  className?: string;
}

export const BottomSheetHeader = ({
  title,
  subtitle,
  back = false,
  onBack,
  backLabel = 'Back',
  rightAction,
  closeButton = true,
  onClose,
  closeLabel = 'Close',
  className,
}: BottomSheetHeaderProps) => {
  const handleBack = React.useCallback(() => {
    onBack?.();
  }, [onBack]);

  const handleClose = React.useCallback(() => {
    onClose?.();
  }, [onClose]);

  const leftSlot = back ? (
    <button
      type='button'
      onClick={handleBack}
      aria-label={backLabel}
      className={cn(
        BACK_BUTTON_DIMENSION_CLASS,
        'flex items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-d-violet/40'
      )}
    >
      <img src='/images/icon_chevron--back.svg' alt='' className='size-[18rem]' />
    </button>
  ) : (
    <PlaceholderSlot />
  );

  const hasRightAction = rightAction !== undefined && rightAction !== null;
  const showCloseButton = closeButton && !hasRightAction;
  const rightSlot = hasRightAction ? (
    <div className='flex items-center'>{rightAction}</div>
  ) : (
    <PlaceholderSlot />
  );

  return (
    <motion.div
      {...HEADER_ANIMATION}
      role='banner'
      aria-label={title}
      className={cn('px-[20rem] pb-[12rem] pt-[16rem]', className)}
    >
      {showCloseButton ? (
        <BottomSheetClose asChild>
          <button
            type='button'
            onClick={handleClose}
            aria-label={closeLabel}
            className='absolute right-[8rem] top-[8rem] flex size-[44rem] items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-d-violet/40'
          >
            <img src='/images/icon_close--black.svg' alt='' className='size-[18rem]' />
          </button>
        </BottomSheetClose>
      ) : null}
      <HeaderContent
        left={leftSlot}
        right={rightSlot}
        center={
          <div className='flex flex-col gap-[4rem]'>
            <h2 className='text-center text-[18rem] font-semibold leading-[120%] text-slate-900'>{title}</h2>
            {subtitle ? <p className='text-center line-clamp-2 text-[14rem] leading-[140%] text-slate-500'>{subtitle}</p> : null}
          </div>
        }
      />
    </motion.div>
  );
};
