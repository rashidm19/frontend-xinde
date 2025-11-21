'use client';

import { memo } from 'react';

import { motion } from 'framer-motion';

import { cn } from '@/lib/utils';

import type { ListeningFilterKey } from './question-types';

interface FilterBarProps {
  counts: Record<ListeningFilterKey, number>;
  activeFilter: ListeningFilterKey;
  onChange: (value: ListeningFilterKey) => void;
  shouldReduceMotion: boolean;
}

const FILTER_LABELS: Record<ListeningFilterKey, string> = {
  all: 'All',
  correct: 'Correct',
  incorrect: 'Incorrect',
  unanswered: 'Unanswered',
};

export const FilterPillsBar = memo(function FilterPillsBar({ counts, activeFilter, onChange, shouldReduceMotion }: FilterBarProps) {
  return (
    <section className='relative overflow-hidden rounded-[28rem] border border-[#CFE7D5] bg-white px-[16rem] py-[14rem] shadow-[0_16rem_40rem_-28rem_rgba(47,143,104,0.22)]'>
      <div className='pointer-events-none absolute inset-y-0 left-0 w-[28rem] bg-gradient-to-r from-white to-transparent' aria-hidden='true' />
      <div className='pointer-events-none absolute inset-y-0 right-0 w-[28rem] bg-gradient-to-l from-white to-transparent' aria-hidden='true' />

      <div className='relative flex items-center gap-[10rem] overflow-x-auto scroll-smooth px-[8rem] py-[4rem] text-[13rem] font-semibold text-[#1E5A45] scrollbar-thin scrollbar-thumb-transparent'>
        {(Object.keys(FILTER_LABELS) as ListeningFilterKey[]).map(key => (
          <motion.button
            key={key}
            type='button'
            whileTap={shouldReduceMotion ? undefined : { scale: 0.96 }}
            onClick={() => onChange(key)}
            className={cn(
              'inline-flex items-center gap-[8rem] rounded-[999rem] border px-[16rem] py-[8rem] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#2F8F68]',
              activeFilter === key
                ? 'border-[#2F8F68] bg-[#2F8F68] text-white'
                : 'border-[#CFE7D5] bg-[#EAF8F0] text-[#1E5A45] hover:bg-[#DCF2E6]'
            )}
            aria-pressed={activeFilter === key}
            aria-label={`${FILTER_LABELS[key]} questions: ${counts[key]}`}
          >
            <span>{FILTER_LABELS[key]}</span>
            <span className={cn('rounded-[999rem] px-[8rem] py-[2rem] text-[12rem] font-semibold', activeFilter === key ? 'bg-white/20' : 'bg-white/80 text-[#1E5A45]/80')}>
              {counts[key]}
            </span>
          </motion.button>
        ))}
      </div>
    </section>
  );
});
