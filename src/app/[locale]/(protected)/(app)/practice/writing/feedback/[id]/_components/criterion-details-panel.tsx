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
    <div className='flex flex-col gap-[18rem] rounded-[22rem] border border-white/60 bg-white px-[20rem] py-[20rem] shadow-[0_28rem_88rem_-70rem_rgba(18,37,68,0.26)] tablet:gap-[22rem] tablet:rounded-[28rem] tablet:px-[28rem] tablet:py-[26rem] tablet:shadow-[0_32rem_96rem_-80rem_rgba(18,37,68,0.28)]'>
      <header className='flex flex-wrap items-start justify-between gap-[14rem] tablet:gap-[16rem] tablet:space-y-[8rem]'>
        <div className='flex w-full items-center justify-between'>
          <div>
            <p className='text-[12.5rem] font-semibold uppercase tracking-[0.18em] text-slate-400 tablet:text-[13rem]'>Criterion</p>
            <h3 className='text-[20rem] font-semibold text-slate-900 tablet:text-[26rem] tablet:text-[24rem]'>{criterion.label}</h3>
          </div>
          <span className={`rounded-[16rem] px-[16rem] py-[8rem] text-[14.5rem] font-semibold ${accent.badge} ${accent.badgeText} tablet:rounded-[18rem] tablet:px-[20rem] tablet:py-[10rem] tablet:text-[16rem]`}>{formatScore(criterion.score)}</span>
        </div>
        {criterion.data?.feedback ? <p className='text-[14rem] leading-[1.7] text-slate-600 tablet:text-[15rem]'>{criterion.data.feedback}</p> : null}
      </header>

      <section className={`rounded-[20rem] px-[20rem] py-[18rem] text-[13.5rem] leading-[1.6] ${accent.focusBg} ${accent.focusText} tablet:rounded-[24rem] tablet:px-[24rem] tablet:py-[22rem]`}>
        <p className='text-[12.5rem] font-semibold uppercase tracking-[0.18em] opacity-70 tablet:text-[13rem]'>What to focus on next</p>
        {focusPoints.length > 0 ? (
          <ul className='mt-[10rem] flex list-disc flex-col gap-[8rem] pl-[18rem] tablet:mt-[12rem] tablet:gap-[10rem] tablet:pl-[20rem]'>
            {focusPoints.map((point, index) => (
              <li key={`${criterion.key}-focus-${index}`} className='text-[13.5rem] font-medium tablet:text-[14rem]'>
                {point}
              </li>
            ))}
          </ul>
        ) : (
          <p className='mt-[12rem] text-[13.5rem] opacity-80 tablet:text-[14rem]'>We will surface specific next steps for this criterion soon.</p>
        )}
      </section>

      <section className='space-y-[12rem] tablet:space-y-[14rem]'>
        <header className='flex items-center gap-[10rem]'>
          <p className='text-[13rem] font-semibold uppercase tracking-[0.18em] text-slate-400 tablet:text-[14rem]'>Detailed breakdown</p>
        </header>
        {breakdown.length > 0 ? (
          <div className='flex flex-col gap-[12rem] tablet:gap-[14rem]'>
            {breakdown.map(item => {
              const isOpen = expanded[item.name] ?? false;
              return (
                <article
                  key={`${criterion.key}-${item.name}`}
                  className='overflow-hidden rounded-[18rem] border border-white/70 bg-[#F9FBFF] shadow-[0_22rem_70rem_-60rem_rgba(18,37,68,0.22)] tablet:rounded-[22rem] tablet:shadow-[0_26rem_80rem_-72rem_rgba(18,37,68,0.24)]'
                >
                  <button
                    type='button'
                    onClick={() => toggle(item.name)}
                    className='flex w-full items-center justify-between gap-[12rem] px-[18rem] py-[16rem] text-left text-[14rem] font-semibold text-slate-800 transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2 tablet:px-[22rem] tablet:py-[18rem] tablet:text-[15rem]'
                  >
                    <span>{item.name}</span>
                    <div className='flex items-center gap-[12rem]'>
                      <span className='rounded-full bg-white px-[12rem] py-[6rem] text-[12.5rem] font-semibold text-slate-600 tablet:px-[14rem] tablet:text-[13rem]'>{formatScore(item.score)}</span>
                      <ChevronDown className={`size-[16rem] text-slate-500 transition tablet:size-[18rem] ${isOpen ? 'rotate-180' : ''}`} aria-hidden='true' />
                    </div>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen ? (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.24, ease: 'easeOut' }}
                        className='px-[18rem] pb-[16rem] text-[13.5rem] leading-[1.7] text-slate-600 tablet:px-[22rem] tablet:pb-[18rem] tablet:text-[14rem]'
                      >
                        <p className='mt-[8rem] font-medium text-slate-700 tablet:mt-[10rem]'>Feedback</p>
                        <p className='mt-[6rem]'>{item.feedback}</p>
                        {item.recommendation ? (
                          <>
                            <p className='mt-[12rem] font-medium text-slate-700 tablet:mt-[14rem]'>Recommendation</p>
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
          <p className='text-[13.5rem] text-slate-500 tablet:text-[14rem]'>Sub-criteria insights will appear here once available.</p>
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
