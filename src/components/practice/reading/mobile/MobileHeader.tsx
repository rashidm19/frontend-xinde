'use client';

import * as React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

import { cn } from '@/lib/utils';

const headerVariants = {
  initial: { y: -24, opacity: 0 },
  animate: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 320, damping: 28 } },
};

const progressVariants = {
  initial: { width: '0%' },
  animate: (progress: number) => ({
    width: `${Math.max(0, Math.min(100, progress))}%`,
    transition: { type: 'spring', stiffness: 280, damping: 36, mass: 0.6 },
  }),
};

const closeActionClasses = cn(
  'flex size-[32rem] items-center justify-center rounded-full transition',
  'border border-d-black/10 bg-white text-d-black shadow-[0_4rem_12rem_rgba(56,56,56,0.12)]',
  'hover:bg-neutral-100 active:bg-neutral-200',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-neutral-400'
);

export type CloseActionProps = {
  as?: 'button' | 'link';
  href?: string;
  onClick?: () => void;
  ariaLabel?: string;
};

export const CloseAction: React.FC<CloseActionProps> = ({ as = 'button', href, onClick, ariaLabel = 'Close' }) => {
  if (as === 'link' && href) {
    return (
      <Link href={href} aria-label={ariaLabel} className={closeActionClasses}>
        <X className='h-[16rem] w-[16rem] text-neutral-600' aria-hidden='true' />
      </Link>
    );
  }

  return (
    <motion.button type='button' whileTap={{ scale: 0.9 }} onClick={onClick} aria-label={ariaLabel} className={closeActionClasses}>
      <X className='h-[16rem] w-[16rem] text-neutral-600' aria-hidden='true' />
    </motion.button>
  );
};

export type MobileHeaderVariant = 'reading' | 'writing' | "listening" | "speaking";

export interface MobileHeaderProps {
  title: string;
  tag?: string | null;
  timerLabel?: string | null;
  progress?: number;
  exitLabel: string;
  progressLabel?: string;
  onExit?: () => void;
  className?: string;
  showProgress?: boolean;
  closeAs?: 'button' | 'link';
  closeHref?: string;
  onClose?: () => void;
  variant?: MobileHeaderVariant;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  title,
  tag,
  showProgress = false,
  timerLabel,
  progress,
  exitLabel,
  progressLabel,
  onExit,
  className,
  closeAs,
  closeHref,
  onClose,
  variant = 'reading',
}) => {
  const handleClose = React.useCallback(() => {
    if (onClose) {
      onClose();
      return;
    }

    if (onExit) {
      onExit();
      return;
    }
  }, [onClose, onExit]);

  const variantClasses: Record<MobileHeaderVariant, string> = {
    reading: 'border-[#f0e8cc] bg-[#FFFDF5]/95',
    writing: 'border-[#C8E6F0] bg-[#F5FCFE]/95',
    listening: 'border-[#cdecd6] bg-[#F7FFF9]/95',
    speaking: 'border-[#f2e3ce] bg-[#FFF9F2]/95',
  };

  return (
    <motion.header
      {...headerVariants}
      role='banner'
      className={cn(
        'tablet:hidden',
        'sticky top-0 z-50 flex flex-col gap-[12rem] border-b px-[18rem] pb-[12rem] pt-[calc(12rem+env(safe-area-inset-top))] backdrop-blur',
        variantClasses[variant],
        className
      )}
    >
      <div className='flex items-center justify-between gap-[16rem]'>
        <div className='flex items-center gap-[10rem]'>
          <img src='/images/logo.svg' alt='Studybox' className='size-[28rem]' />
          <div className='flex flex-col leading-none'>
            <span className='font-poppins text-[16rem] font-semibold text-d-black'>{title}</span>
            {tag ? <span className='text-[12rem] font-medium uppercase tracking-[0.08em] text-d-black/60'>{tag}</span> : null}
          </div>
        </div>

        <div className='flex items-center gap-[12rem]'>
          {timerLabel ? (
            <span className='text-[14rem] font-semibold text-d-black/80' aria-live='polite'>
              {timerLabel}
            </span>
          ) : null}
          <CloseAction as={closeAs} href={closeHref} onClick={handleClose} ariaLabel={exitLabel || 'Close'} />
        </div>
      </div>

      {showProgress && progress && (
        <div className='relative h-[6rem] w-full overflow-hidden rounded-full bg-white/60'>
          <motion.span
            custom={progress}
            initial='initial'
            animate='animate'
            variants={progressVariants}
            className='absolute inset-y-0 left-0 rounded-full bg-[#C9FF55]/80'
            aria-hidden='true'
          />
          <span className='sr-only'>{progressLabel ?? `${Math.round(progress)}% completed`}</span>
        </div>
      )}
    </motion.header>
  );
};
