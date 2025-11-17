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
    <section className='space-y-[16rem] tablet:space-y-[20rem]'>
      <header className='space-y-[6rem] tablet:space-y-[8rem]'>
        <span className='inline-flex items-center gap-[8rem] rounded-[14rem] bg-white/60 px-[12rem] py-[5rem] text-[11.5rem] font-semibold uppercase tracking-[0.18em] text-slate-500 tablet:rounded-[16rem] tablet:px-[14rem] tablet:py-[6rem] tablet:text-[12rem]'>
          At a glance
        </span>
        <h2 className='text-[19rem] font-semibold text-slate-900 tablet:text-[24rem] tablet:text-[28rem]'>Feedback summary</h2>
      </header>
      <div className='grid gap-[12rem] tablet:gap-[16rem] tablet:grid-cols-2 tablet:gap-[18rem]'>
        {criteria.map((criterion, index) => {
          const badge = CRITERION_BADGES[criterion.key];
          return (
            <motion.article
              key={criterion.key}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.28, delay: index * 0.05, ease: 'easeOut' }}
              className='flex h-full flex-col gap-[14rem] rounded-[18rem] border border-white/70 bg-white px-[18rem] py-[16rem] shadow-[0_20rem_70rem_-60rem_rgba(18,37,68,0.28)] tablet:gap-[18rem] tablet:rounded-[24rem] tablet:px-[24rem] tablet:py-[22rem]'
            >
              <div className='flex items-start justify-between gap-[12rem]'>
                <div className='space-y-[6rem]'>
                  <p className='text-[12rem] font-semibold uppercase tracking-[0.18em] text-slate-400 tablet:text-[13rem]'>{criterion.label}</p>
                  <p className='text-[14rem] leading-relaxed text-slate-600 tablet:text-[15rem]'>{criterion.summary}</p>
                </div>
                <span className={`rounded-full px-[12rem] py-[6rem] text-[13rem] font-semibold ${badge.bg} ${badge.text} ${badge.border} tablet:px-[14rem] tablet:text-[14rem]`}>{formatScore(criterion.score)}</span>
              </div>
              <button
                type='button'
                onClick={() => onSelect(criterion.key)}
                className='mt-auto inline-flex items-center text-[12.5rem] font-semibold text-slate-600 underline-offset-4 transition hover:text-slate-900 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2 tablet:text-[13rem]'
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
