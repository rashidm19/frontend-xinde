'use client';

import * as React from 'react';
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

export interface MobileHeaderProps {
  title: string;
  tag?: string | null;
  timerLabel?: string | null;
  progress: number;
  exitLabel: string;
  progressLabel?: string;
  onExit: () => void;
  className?: string;
  showProgress?: boolean;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({ title, tag, showProgress = false, timerLabel, progress, exitLabel, progressLabel, onExit, className }) => {
  return (
    <motion.header
      {...headerVariants}
      role='banner'
      className={cn(
        'tablet:hidden',
        'sticky top-0 z-50 flex flex-col gap-[12rem] border-b border-[#f0e8cc] bg-[#FFFDF5]/95 px-[18rem] pb-[12rem] pt-[calc(12rem+env(safe-area-inset-top))] backdrop-blur',
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
          <button
            type='button'
            onClick={onExit}
            className='inline-flex size-[38rem] items-center justify-center rounded-full border border-d-black/10 bg-white text-d-black shadow-[0_4rem_12rem_rgba(56,56,56,0.12)] transition-colors hover:bg-d-green/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-d-green/60'
            aria-label={exitLabel}
          >
            <X className='size-[18rem]' aria-hidden='true' />
          </button>
        </div>
      </div>

      {showProgress && (
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
