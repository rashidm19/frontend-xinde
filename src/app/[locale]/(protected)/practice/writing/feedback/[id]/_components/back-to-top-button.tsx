'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { ArrowUp } from 'lucide-react';

import { cn } from '@/lib/utils';

interface BackToTopButtonProps {
  visible: boolean;
  onClick: () => void;
  variant?: 'writing' | 'reading';
  display?: 'tablet-only' | 'all';
}

const VARIANT_CLASSES: Record<'writing' | 'reading', string> = {
  writing: 'bg-sky-700 hover:bg-[#2743B2] text-white shadow-[0_18rem_40rem_-28rem_rgba(45,78,168,0.4)] focus-visible:ring-sky-500',
  reading: 'bg-[#4C7A3A] hover:bg-[#3C612E] text-white shadow-[0_18rem_42rem_-28rem_rgba(76,122,58,0.35)] focus-visible:ring-[#2F5E25]',
};

export function BackToTopButton({ visible, onClick, variant = 'writing', display = 'tablet-only' }: BackToTopButtonProps) {
  const shouldReduceMotion = useReducedMotion();

  const baseLayout =
    display === 'tablet-only'
      ? 'hidden tablet:fixed tablet:bottom-[32rem] tablet:right-[24rem] tablet:z-[40] tablet:flex tablet:size-[48rem] tablet:items-center tablet:justify-center tablet:rounded-full desktop:size-[56rem]'
      : 'fixed bottom-[24rem] right-[20rem] z-[40] flex size-[48rem] items-center justify-center rounded-full tablet:bottom-[32rem] tablet:right-[24rem] desktop:size-[56rem]';

  return (
    <motion.button
      type='button'
      onClick={onClick}
      aria-label='Back to top'
      className={cn(
        baseLayout,
        'transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        VARIANT_CLASSES[variant],
        !visible && 'pointer-events-none'
      )}
      initial={false}
      animate={{ opacity: visible ? 1 : 0, scale: visible ? 1 : 0.96, y: visible || shouldReduceMotion ? 0 : 12 }}
      whileHover={shouldReduceMotion ? undefined : { scale: 1.04 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.24, ease: 'easeOut' }}
    >
      <ArrowUp className='size-[20rem] tablet:size-[22rem]' aria-hidden='true' />
    </motion.button>
  );
}
