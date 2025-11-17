'use client';

import { motion, useReducedMotion } from 'framer-motion';

import { cn } from '@/lib/utils';

interface OverallBandCardProps {
  score: number | null;
  summary: string;
  pillLabel?: string;
  className?: string;
}

const GRADIENTS = [
  { threshold: 7.5, className: 'from-[#ECFFF6] via-[#E6F5FF] to-[#E8EFFF]' },
  { threshold: 6.5, className: 'from-[#FFF8EC] via-[#FFF2E4] to-[#FFEADD]' },
  { threshold: 0, className: 'from-[#FFF1F1] via-[#FFE9EE] to-[#FFE0E9]' },
];

export function OverallBandCard({ score, summary, pillLabel, className }: OverallBandCardProps) {
  const shouldReduceMotion = useReducedMotion();
  const displayScore = score === null || Number.isNaN(score) ? '—' : score.toFixed(1);
  const gradient = GRADIENTS.find(entry => typeof score === 'number' && score >= entry.threshold) ?? GRADIENTS[GRADIENTS.length - 1];
  const progress = Math.max(0, Math.min(100, typeof score === 'number' ? (score / 9) * 100 : 0));

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, ease: 'easeOut' }}
      className={cn(
        'relative w-full overflow-hidden rounded-[22rem] border border-[#D4E1F6] bg-gradient-to-br px-[20rem] py-[18rem] text-slate-900 shadow-[0_18rem_48rem_-32rem_rgba(24,47,98,0.28)] min-h-[152rem]',
        gradient.className,
        className
      )}
      style={{ backgroundSize: shouldReduceMotion ? undefined : '140% 140%' }}
    >
      <div className='flex flex-col gap-[12rem]'>
        <div className='flex flex-wrap items-start justify-between gap-[10rem]'>
          <div>
            <span className='text-[11rem] font-semibold uppercase tracking-[0.22em] text-slate-500/80'>Overall band</span>
            <div className='mt-[4rem] flex items-center gap-[10rem]'>
              <motion.span
                key={displayScore}
                initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: shouldReduceMotion ? 0 : 0.22, ease: 'easeOut' }}
                className='text-[48rem] font-semibold leading-none text-slate-900'
              >
                {displayScore}
              </motion.span>
              <span className='text-[12rem] font-medium text-slate-600'>Based on IELTS band descriptors</span>
            </div>
          </div>
          {pillLabel ? (
            <span className='rounded-[16rem] border border-[#CBD8F1] bg-white/80 px-[12rem] py-[6rem] text-[11rem] font-semibold uppercase tracking-[0.18em] text-slate-600'>
              {pillLabel}
            </span>
          ) : null}
        </div>

        {summary ? <p className='text-[12.5rem] leading-normal text-slate-600 line-clamp-2'>{summary}</p> : null}

        <div className='space-y-[8rem]'>
          <div className='flex items-center justify-between text-[11rem] font-semibold uppercase tracking-[0.18em] text-slate-500'>
            <span>Band scale</span>
            <span className='text-slate-700'>{typeof score === 'number' ? `${score.toFixed(1)} / 9` : 'Pending'}</span>
          </div>
          <div className='h-[6rem] w-full rounded-[999rem] bg-white/70'>
            <motion.div
              className='h-full rounded-[999rem] bg-[#2D4AA8]'
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.38, ease: 'easeOut' }}
            />
          </div>
        </div>
      </div>
    </motion.section>
  );
}
