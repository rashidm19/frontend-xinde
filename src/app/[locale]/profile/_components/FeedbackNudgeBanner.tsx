'use client';

import { motion } from 'framer-motion';
import { X } from 'lucide-react';

interface FeedbackNudgeBannerProps {
  onOpen: () => void;
  onDismiss: () => void;
}

export function FeedbackNudgeBanner({ onOpen, onDismiss }: FeedbackNudgeBannerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 12 }}
      transition={{ duration: 0.24, ease: 'easeOut' }}
      className='pointer-events-none fixed left-0 right-0 z-50 px-[16rem]'
      style={{ bottom: 'calc(env(safe-area-inset-bottom) + 112rem)' }}
    >
      <div className='pointer-events-auto mx-auto mb-3 flex max-w-[520rem] items-center gap-[12rem] rounded-[24rem] border border-gray-200 bg-[#f9fafb] px-[16rem] py-[12rem] shadow-sm'>
        <button type='button' onClick={onOpen} className='flex flex-1 flex-col items-start gap-[4rem] text-left'>
          <span className='text-[13rem] font-semibold text-slate-900'>How’s your StudyBox experience?</span>
          <span className='text-[11rem] text-slate-600'>1 min</span>
        </button>
        <button
          type='button'
          onClick={onOpen}
          className='rounded-full bg-blue-600 px-[18rem] py-[10rem] text-[12rem] font-semibold text-white shadow-[0_12rem_24rem_-16rem_rgba(37,99,235,0.6)] transition hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200 focus-visible:ring-offset-2'
        >
          Give feedback
        </button>
        <button
          type='button'
          onClick={onDismiss}
          className='rounded-full p-[6rem] text-slate-400 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200 focus-visible:ring-offset-2'
          aria-label='Dismiss feedback nudge'
        >
          <X className='size-[16rem]' />
        </button>
      </div>
    </motion.div>
  );
}
