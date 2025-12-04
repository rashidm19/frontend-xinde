'use client';

import { useEffect, useState } from 'react';

import { motion } from 'framer-motion';
import { CheckCircle2, XCircle } from 'lucide-react';

import { cn } from '@/lib/utils';
import { useMediaQuery } from 'usehooks-ts';

interface ScoreSummaryCardProps {
  correctCount: number;
  totalCount: number;
  score: number | null;
  testTitle: string | null;
  completedAt: string | null;
  shouldReduceMotion: boolean;
}

export function ScoreSummaryCard({ correctCount, totalCount, score, testTitle, completedAt, shouldReduceMotion }: ScoreSummaryCardProps) {
  const [displayedCount, setDisplayedCount] = useState(0);
  const incorrectCount = totalCount - correctCount;
  const percentage = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;

  const isMobile = useMediaQuery('(max-width: 767px)');

  useEffect(() => {
    if (shouldReduceMotion) {
      setDisplayedCount(correctCount);
      return;
    }

    let frame: number;
    const duration = 1200;
    const start = performance.now();

    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayedCount(Math.round(eased * correctCount));

      if (progress < 1) {
        frame = requestAnimationFrame(animate);
      }
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [correctCount, shouldReduceMotion]);

  const formattedDate = completedAt
    ? new Date(completedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  return (
    <motion.section
      initial={shouldReduceMotion ? undefined : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={shouldReduceMotion ? undefined : { duration: 0.4, ease: 'easeOut' }}
      className='rounded-[32rem] border border-[#E1D6B4] bg-white px-[24rem] py-[28rem] shadow-[0_18rem_48rem_-30rem_rgba(56,56,56,0.18)] tablet:px-[32rem] tablet:py-[36rem]'
    >
      <div className='flex flex-col gap-[20rem] tablet:flex-row tablet:items-center tablet:justify-between'>
        <div className='flex flex-col gap-[8rem]'>
          <span className='text-[12rem] font-semibold uppercase tracking-[0.24em] text-[#85784A]'>Results Summary</span>
          {testTitle ? <h1 className='text-[22rem] font-bold text-d-black tablet:text-[28rem]'>{testTitle}</h1> : null}
          {formattedDate ? <p className='text-[13rem] text-d-black/60'>Completed on {formattedDate}</p> : null}
        </div>

        <div className='flex w-full items-center justify-center gap-[16rem] tablet:w-auto tablet:justify-start tablet:gap-[24rem]'>
          <div className='relative flex size-[100rem] items-center justify-center tablet:size-[120rem]'>
            <svg className='absolute inset-0 -rotate-90' viewBox='0 0 100 100'>
              <circle cx='50' cy='50' r='42' fill='none' stroke='#E1D6B4' strokeWidth='8' />
              <motion.circle
                cx='50'
                cy='50'
                r='42'
                fill='none'
                stroke='#4C7A3A'
                strokeWidth='8'
                strokeLinecap='round'
                strokeDasharray={264}
                initial={{ strokeDashoffset: 264 }}
                animate={{ strokeDashoffset: 264 - (264 * percentage) / 100 }}
                transition={shouldReduceMotion ? { duration: 0 } : { duration: 1.2, ease: 'easeOut' }}
              />
            </svg>
            <div className='flex flex-col items-center'>
              <span className='text-[28rem] font-bold text-d-black tablet:text-[32rem]'>{displayedCount}</span>
              <span className='text-[12rem] text-d-black/60'>/ {totalCount}</span>
            </div>
          </div>

          {score !== null ? (
            <div className='flex flex-col items-center rounded-[16rem] bg-[#E7F2DD] px-[16rem] py-[12rem]'>
              <span className='text-[11rem] font-semibold uppercase tracking-[0.2em] text-[#2F5E25]'>Band</span>
              <span className='text-[28rem] font-bold text-[#2F5E25]'>{score}</span>
            </div>
          ) : null}
        </div>
      </div>

      <div className={cn('mt-[20rem] gap-[12rem] border-t border-[#E1D6B4]/60 pt-[20rem]', isMobile ? 'grid grid-cols-2' : 'flex flex-wrap')}>
        <div className={cn('flex items-center gap-[8rem] rounded-[999rem] px-[14rem] py-[8rem]', 'bg-[#E7F2DD]', isMobile ? 'justify-center' : '')}>
          <CheckCircle2 className='size-[16rem] text-[#4C7A3A]' />
          <span className='text-[13rem] font-semibold text-[#2F5E25]'>{correctCount} Correct</span>
        </div>
        <div className={cn('flex items-center gap-[8rem] rounded-[999rem] px-[14rem] py-[8rem]', 'bg-[#FFE4E2]', isMobile ? 'justify-center' : '')}>
          <XCircle className='size-[16rem] text-[#C3423F]' />
          <span className='text-[13rem] font-semibold text-[#9E2E2A]'>{incorrectCount} Incorrect</span>
        </div>
      </div>
    </motion.section>
  );
}
