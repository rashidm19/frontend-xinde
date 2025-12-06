'use client';

import { motion } from 'framer-motion';
import { AlertTriangle, Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export type AudioStatus = 'playing' | 'loading' | 'error' | 'finished';

interface AudioStatusIndicatorProps {
  state: AudioStatus;
  className?: string;
}

function SoundWaveIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-hidden="true"
    >
      <motion.rect
        x="1" y="4" width="3" height="8" rx="1"
        animate={{ scaleY: [0.4, 1, 0.4] }}
        transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
        style={{ originY: '50%' }}
      />
      <motion.rect
        x="6.5" y="2" width="3" height="12" rx="1"
        animate={{ scaleY: [1, 0.4, 1] }}
        transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut', delay: 0.15 }}
        style={{ originY: '50%' }}
      />
      <motion.rect
        x="12" y="4" width="3" height="8" rx="1"
        animate={{ scaleY: [0.6, 1, 0.6] }}
        transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
        style={{ originY: '50%' }}
      />
    </svg>
  );
}

const stateConfig = {
  playing: {
    bg: 'bg-[#ECFFC3]',
    border: 'border-[rgba(76,122,58,0.3)]',
    text: 'text-[#4C7A3A]',
    label: 'Playing',
    ariaLabel: 'Audio is playing',
  },
  loading: {
    bg: 'bg-[#F4F4F4]',
    border: 'border-[rgba(56,56,56,0.1)]',
    text: 'text-d-black/60',
    label: 'Loading...',
    ariaLabel: 'Audio is loading',
  },
  error: {
    bg: 'bg-[#FF6E6E]/10',
    border: 'border-[#FF6E6E]/30',
    text: 'text-[#FF6E6E]',
    label: 'Error',
    ariaLabel: 'Audio failed to load',
  },
  finished: {
    bg: 'bg-[#E8EEF7]',
    border: 'border-[#C5D4E8]',
    text: 'text-[#4A6FA5]',
    label: 'Finished',
    ariaLabel: 'Audio playback finished',
  },
};

export function AudioStatusIndicator({ state, className }: AudioStatusIndicatorProps) {
  const config = stateConfig[state];

  return (
    <motion.div
      key={state}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      role={state === 'error' ? 'alert' : 'status'}
      aria-label={config.ariaLabel}
      aria-busy={state === 'loading'}
      className={cn(
        'inline-flex items-center gap-[8rem] rounded-[999rem] border px-[14rem] py-[8rem] transition-colors',
        config.bg,
        config.border,
        config.text,
        className
      )}
    >
      {state === 'playing' && <SoundWaveIcon className="size-[16rem]" />}
      {state === 'loading' && <Loader2 className="size-[16rem] animate-spin" aria-hidden="true" />}
      {state === 'error' && <AlertTriangle className="size-[16rem]" aria-hidden="true" />}
      {state === 'finished' && <Check className="size-[16rem]" aria-hidden="true" />}
      <span className="text-[12rem] font-semibold uppercase tracking-[0.08em]">
        {config.label}
      </span>
    </motion.div>
  );
}
