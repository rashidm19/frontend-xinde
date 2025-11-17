'use client';

import { useMemo, useState } from 'react';

import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

import type { NormalizedCriterionData } from '@/lib/writing-feedback-v2';

interface CriterionDetailsPanelProps {
  criterion: NormalizedCriterionData;
  accent: { badge: string; badgeText: string; focusBg: string; focusText: string };
}

export function CriterionDetailsPanel({ criterion, accent }: CriterionDetailsPanelProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => ({}));
  const breakdown = criterion.data?.breakdown ?? [];

  const focusPoints = useMemo(() => toBulletPoints(criterion.data?.recommendation), [criterion.data?.recommendation]);

  const toggle = (name: string) => {
    setExpanded(state => ({ ...state, [name]: !state[name] }));
  };

  return (
    <div className='flex flex-col gap-[22rem] rounded-[28rem] border border-white/60 bg-white px-[28rem] py-[26rem] shadow-[0_32rem_96rem_-80rem_rgba(18,37,68,0.28)]'>
      <header className='flex flex-wrap items-start justify-between gap-[16rem] space-y-[8rem]'>
        <div className='flex items-center justify-between w-full'>
          <div>
            <p className='text-[13rem] font-semibold uppercase tracking-[0.18em] text-slate-400'>Criterion</p>
            <h3 className='text-[24rem] font-semibold text-slate-900 tablet:text-[26rem]'>{criterion.label}</h3>
          </div>
          <span className={`rounded-[18rem] px-[20rem] py-[10rem] text-[16rem] font-semibold ${accent.badge} ${accent.badgeText}`}>{formatScore(criterion.score)}</span>
        </div>
        {criterion.data?.feedback ? <p className='text-[15rem] leading-[1.7] text-slate-600'>{criterion.data.feedback}</p> : null}
      </header>

      <section className={`rounded-[24rem] px-[24rem] py-[22rem] text-[14rem] leading-[1.6] ${accent.focusBg} ${accent.focusText}`}>
        <p className='text-[13rem] font-semibold uppercase tracking-[0.18em] opacity-70'>What to focus on next</p>
        {focusPoints.length > 0 ? (
          <ul className='mt-[12rem] flex list-disc flex-col gap-[10rem] pl-[20rem]'>
            {focusPoints.map((point, index) => (
              <li key={`${criterion.key}-focus-${index}`} className='text-[14rem] font-medium'>
                {point}
              </li>
            ))}
          </ul>
        ) : (
          <p className='mt-[12rem] text-[14rem] opacity-80'>We will surface specific next steps for this criterion soon.</p>
        )}
      </section>

      <section className='space-y-[14rem]'>
        <header className='flex items-center gap-[10rem]'>
          <p className='text-[14rem] font-semibold uppercase tracking-[0.18em] text-slate-400'>Detailed breakdown</p>
        </header>
        {breakdown.length > 0 ? (
          <div className='flex flex-col gap-[14rem]'>
            {breakdown.map(item => {
              const isOpen = expanded[item.name] ?? false;
              return (
                <article
                  key={`${criterion.key}-${item.name}`}
                  className='overflow-hidden rounded-[22rem] border border-white/70 bg-[#F9FBFF] shadow-[0_26rem_80rem_-72rem_rgba(18,37,68,0.24)]'
                >
                  <button
                    type='button'
                    onClick={() => toggle(item.name)}
                    className='flex w-full items-center justify-between gap-[12rem] px-[22rem] py-[18rem] text-left text-[15rem] font-semibold text-slate-800 transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2'
                  >
                    <span>{item.name}</span>
                    <div className='flex items-center gap-[12rem]'>
                      <span className='rounded-full bg-white px-[14rem] py-[6rem] text-[13rem] font-semibold text-slate-600'>{formatScore(item.score)}</span>
                      <ChevronDown className={`size-[18rem] text-slate-500 transition ${isOpen ? 'rotate-180' : ''}`} aria-hidden='true' />
                    </div>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen ? (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.24, ease: 'easeOut' }}
                        className='px-[22rem] pb-[18rem] text-[14rem] leading-[1.7] text-slate-600'
                      >
                        <p className='mt-[10rem] font-medium text-slate-700'>Feedback</p>
                        <p className='mt-[6rem]'>{item.feedback}</p>
                        {item.recommendation ? (
                          <>
                            <p className='mt-[14rem] font-medium text-slate-700'>Recommendation</p>
                            <p className='mt-[6rem]'>{item.recommendation}</p>
                          </>
                        ) : null}
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </article>
              );
            })}
          </div>
        ) : (
          <p className='text-[14rem] text-slate-500'>Sub-criteria insights will appear here once available.</p>
        )}
      </section>
    </div>
  );
}

function toBulletPoints(source?: string): string[] {
  if (!source) {
    return [];
  }

  const normalized = source.replace(/\r\n/g, '\n');
  const segments = normalized
    .split(/\n+|\u2022|- /)
    .map(segment => segment.replace(/^[-•\s]+/, '').trim())
    .filter(Boolean);

  if (segments.length === 0) {
    const trimmed = source.trim();
    return trimmed ? [trimmed] : [];
  }

  return segments;
}

function formatScore(score: number | null): string {
  if (score === null || Number.isNaN(score)) {
    return '—';
  }
  return score.toFixed(1);
}
