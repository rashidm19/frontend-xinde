'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { ArrowUp } from 'lucide-react';

import { cn } from '@/lib/utils';

interface BackToTopButtonProps {
  visible: boolean;
  onClick: () => void;
}

export function BackToTopButton({ visible, onClick }: BackToTopButtonProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.button
      type='button'
      onClick={onClick}
      aria-label='Back to top'
      className={cn(
        'fixed bottom-[32rem] right-[24rem] z-[40] flex size-[48rem] items-center justify-center rounded-full bg-slate-900 text-white shadow-[0_18rem_40rem_-28rem_rgba(15,23,42,0.45)] transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2 tablet:size-[56rem]',
        !visible && 'pointer-events-none'
      )}
      initial={false}
      animate={{ opacity: visible ? 1 : 0, y: visible || shouldReduceMotion ? 0 : 12 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.24, ease: 'easeOut' }}
    >
      <ArrowUp className='size-[20rem] tablet:size-[22rem]' aria-hidden='true' />
    </motion.button>
  );
}
