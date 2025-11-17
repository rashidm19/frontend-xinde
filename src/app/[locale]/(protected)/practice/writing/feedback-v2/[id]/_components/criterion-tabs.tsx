'use client';

import { useMemo } from 'react';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

import type { CriterionKey, NormalizedCriterionData } from '@/lib/writing-feedback-v2';

import { CriterionDetailsPanel } from './criterion-details-panel';

interface CriterionTabsProps {
  criteria: NormalizedCriterionData[];
  activeKey: CriterionKey;
  onChange: (key: CriterionKey) => void;
}

const ACCENTS: Record<CriterionKey, { badge: string; badgeText: string; focusBg: string; focusText: string; tabBg: string; tabText: string; tabActiveText: string }> = {
  task: {
    badge: 'bg-[#FFE5F1]',
    badgeText: 'text-[#B91C6F]',
    focusBg: 'bg-[#FFF3F9]',
    focusText: 'text-[#8E1B58]',
    tabBg: 'bg-[#FDECF5]',
    tabText: 'text-[#B91C6F]',
    tabActiveText: 'text-[#8E1B58]',
  },
  coherence: {
    badge: 'bg-[#E6EDFF]',
    badgeText: 'text-[#3B5BDB]',
    focusBg: 'bg-[#F0F4FF]',
    focusText: 'text-[#3B5BDB]',
    tabBg: 'bg-[#E6EDFF]',
    tabText: 'text-[#3B5BDB]',
    tabActiveText: 'text-[#3B5BDB]',
  },
  lexical: {
    badge: 'bg-[#E0FBF7]',
    badgeText: 'text-[#0F766E]',
    focusBg: 'bg-[#EBFFFC]',
    focusText: 'text-[#0F766E]',
    tabBg: 'bg-[#E0FBF7]',
    tabText: 'text-[#0F766E]',
    tabActiveText: 'text-[#0F766E]',
  },
  grammar: {
    badge: 'bg-[#FFF2DE]',
    badgeText: 'text-[#B45309]',
    focusBg: 'bg-[#FFF7EA]',
    focusText: 'text-[#B45309]',
    tabBg: 'bg-[#FFF2DE]',
    tabText: 'text-[#B45309]',
    tabActiveText: 'text-[#B45309]',
  },
};

export function CriterionTabs({ criteria, activeKey, onChange }: CriterionTabsProps) {
  const activeCriterion = useMemo(() => criteria.find(item => item.key === activeKey) ?? criteria[0], [criteria, activeKey]);
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className='space-y-[24rem]'>
      <div className='sticky top-[120rem] z-[10] rounded-[26rem] border border-white/70 bg-white px-[10rem] py-[10rem] shadow-[0_26rem_88rem_-72rem_rgba(18,37,68,0.24)]'>
        <div className='flex flex-wrap gap-[12rem]'>
          {criteria.map(item => {
            const accent = ACCENTS[item.key];
            const isActive = item.key === activeKey;
            return (
              <button
                key={item.key}
                type='button'
                onClick={() => onChange(item.key)}
                className='relative overflow-hidden rounded-[20rem] px-[20rem] py-[12rem] text-[13rem] font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2'
              >
                {isActive ? (
                  <motion.span
                    layoutId='criterion-tab-background'
                    className={`absolute inset-0 ${accent.tabBg}`}
                    transition={{ duration: shouldReduceMotion ? 0 : 0.24, ease: 'easeOut' }}
                  />
                ) : null}
                <span className={`relative z-[1] ${isActive ? accent.tabActiveText : accent.tabText}`}>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <AnimatePresence mode='wait'>
        {activeCriterion ? (
          <motion.div
            key={activeCriterion.key}
            initial={{ opacity: shouldReduceMotion ? 1 : 0, y: shouldReduceMotion ? 0 : 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: shouldReduceMotion ? 1 : 0, y: shouldReduceMotion ? 0 : -18 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.3, ease: 'easeOut' }}
          >
            <CriterionDetailsPanel criterion={activeCriterion} accent={ACCENTS[activeCriterion.key]} />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}
