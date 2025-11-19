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
        'hidden tablet:fixed tablet:bottom-[32rem] tablet:right-[24rem] tablet:z-[40] tablet:flex tablet:size-[48rem] tablet:items-center tablet:justify-center tablet:rounded-full tablet:bg-sky-700 tablet:text-white tablet:shadow-[0_18rem_40rem_-28rem_rgba(45,78,168,0.4)] tablet:transition tablet:hover:bg-[#2743B2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 desktop:size-[56rem]',
        !visible && 'tablet:pointer-events-none'
      )}
      initial={false}
      animate={{ opacity: visible ? 1 : 0, y: visible || shouldReduceMotion ? 0 : 12 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.24, ease: 'easeOut' }}
    >
      <ArrowUp className='size-[20rem] tablet:size-[22rem]' aria-hidden='true' />
    </motion.button>
  );
}
