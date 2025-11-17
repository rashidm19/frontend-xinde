'use client';

import { motion } from 'framer-motion';

import type { NormalizedCriterionData } from '@/lib/writing-feedback-v2';

interface FeedbackSummaryGridProps {
  criteria: NormalizedCriterionData[];
  onSelect: (key: NormalizedCriterionData['key']) => void;
}

const CRITERION_BADGES: Record<NormalizedCriterionData['key'], { bg: string; text: string; border: string }> = {
  task: { bg: 'bg-[#FFE5F1]', text: 'text-[#B91C6F]', border: 'border-[#FECFE0]' },
  coherence: { bg: 'bg-[#E6EDFF]', text: 'text-[#3B5BDB]', border: 'border-[#D4E0FF]' },
  lexical: { bg: 'bg-[#E0FBF7]', text: 'text-[#0F766E]', border: 'border-[#C6F7EE]' },
  grammar: { bg: 'bg-[#FFF2DE]', text: 'text-[#B45309]', border: 'border-[#FFE2B8]' },
};

export function FeedbackSummaryGrid({ criteria, onSelect }: FeedbackSummaryGridProps) {
  return (
    <section className='space-y-[20rem]'>
      <header className='space-y-[8rem]'>
        <span className='inline-flex items-center gap-[8rem] rounded-[16rem] bg-white/60 px-[14rem] py-[6rem] text-[12rem] font-semibold uppercase tracking-[0.18em] text-slate-500'>
          At a glance
        </span>
        <h2 className='text-[24rem] font-semibold text-slate-900 tablet:text-[28rem]'>Feedback summary</h2>
      </header>
      <div className='grid gap-[16rem] tablet:grid-cols-2 tablet:gap-[18rem]'>
        {criteria.map((criterion, index) => {
          const badge = CRITERION_BADGES[criterion.key];
          return (
            <motion.article
              key={criterion.key}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.28, delay: index * 0.05, ease: 'easeOut' }}
              className='flex h-full flex-col gap-[18rem] rounded-[24rem] border border-white/70 bg-white px-[24rem] py-[22rem] shadow-[0_26rem_86rem_-70rem_rgba(18,37,68,0.32)]'
            >
              <div className='flex items-start justify-between gap-[12rem]'>
                <div className='space-y-[6rem]'>
                  <p className='text-[13rem] font-semibold uppercase tracking-[0.18em] text-slate-400'>{criterion.label}</p>
                  <p className='text-[15rem] leading-[1.6] text-slate-600'>{criterion.summary}</p>
                </div>
                <span className={`rounded-full px-[14rem] py-[6rem] text-[14rem] font-semibold ${badge.bg} ${badge.text} ${badge.border}`}>{formatScore(criterion.score)}</span>
              </div>
              <button
                type='button'
                onClick={() => onSelect(criterion.key)}
                className='mt-auto inline-flex items-center text-[13rem] font-semibold text-slate-600 underline-offset-4 transition hover:text-slate-900 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2'
              >
                View details
              </button>
            </motion.article>
          );
        })}
      </div>
    </section>
  );
}

function formatScore(value: number | null): string {
  if (value === null || Number.isNaN(value)) {
    return '—';
  }
  return value.toFixed(1);
}
