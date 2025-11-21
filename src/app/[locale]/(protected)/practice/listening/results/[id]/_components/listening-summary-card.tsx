'use client';

import { useMemo } from 'react';

import { motion } from 'framer-motion';

interface ListeningSummaryCardProps {
  correctCount: number;
  totalCount: number;
  testTitle: string | null;
  completedAt: string | null;
  shouldReduceMotion: boolean;
}

const formatDateTime = (value: string | null) => {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(date);
  } catch (error) {
    return date.toLocaleString();
  }
};

export function ListeningSummaryCard({ correctCount, totalCount, testTitle, completedAt, shouldReduceMotion }: ListeningSummaryCardProps) {
  const accuracy = useMemo(() => {
    if (totalCount <= 0) {
      return 0;
    }
    return Math.min(1, Math.max(0, correctCount / totalCount));
  }, [correctCount, totalCount]);

  const accuracyPercent = Math.round(accuracy * 100);
  const formattedDate = useMemo(() => formatDateTime(completedAt), [completedAt]);

  return (
    <section className='rounded-[32rem] border border-[#CFE7D5] bg-white px-[24rem] py-[28rem] shadow-[0_22rem_60rem_-40rem_rgba(47,143,104,0.2)] tablet:px-[32rem] tablet:py-[36rem]'>
      <div className='grid gap-[24rem] tablet:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] tablet:items-center'>
        <motion.div
          initial={shouldReduceMotion ? undefined : { opacity: 0, y: 12 }}
          animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={shouldReduceMotion ? undefined : { duration: 0.3, ease: 'easeOut' }}
          className='flex flex-col gap-[16rem]'
        >
          <div className='flex flex-col gap-[6rem]'>
            <span className='text-[13rem] font-semibold uppercase tracking-[0.18em] text-[#2F8F68]/80'>Correct answers</span>
            <p className='text-[36rem] font-semibold text-[#0F3A2E] tablet:text-[42rem]'>
              {correctCount}
              <span className='text-[20rem] font-medium text-[#0F3A2E]/70'>/{totalCount}</span>
            </p>
          </div>
          <div className='flex flex-col gap-[10rem]'>
            <div className='w-full max-w-[420rem]'>
              <div className='relative h-[8rem] w-full overflow-hidden rounded-full bg-[#EAF8F0]'>
                <motion.div
                  className='absolute inset-y-0 left-0 rounded-full bg-[#2F8F68]'
                  initial={shouldReduceMotion ? undefined : { width: 0 }}
                  animate={{ width: `${accuracy * 100}%` }}
                  transition={shouldReduceMotion ? undefined : { duration: 0.5, ease: 'easeOut', delay: 0.1 }}
                />
              </div>
            </div>
            <span className='text-[12rem] font-semibold text-[#2F8F68]'>Accuracy {accuracyPercent}%</span>
          </div>
        </motion.div>

        <motion.div
          initial={shouldReduceMotion ? undefined : { opacity: 0, y: 16 }}
          animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={shouldReduceMotion ? undefined : { duration: 0.32, ease: 'easeOut', delay: 0.05 }}
          className='flex flex-col gap-[12rem] rounded-[28rem] border border-[#D9F0E1] bg-[#F4FFF6] px-[20rem] py-[18rem] text-[14rem] text-[#0F3A2E]'
        >
          <div className='flex flex-col gap-[2rem]'>
            <span className='text-[12rem] font-semibold uppercase tracking-[0.18em] text-[#2F8F68]/80'>Section</span>
            <p className='font-semibold'>Listening · {totalCount} questions</p>
          </div>
          {testTitle ? (
            <div className='flex flex-col gap-[2rem]'>
              <span className='text-[12rem] font-semibold uppercase tracking-[0.18em] text-[#2F8F68]/80'>Test</span>
              <p className='font-semibold text-[#0F3A2E]'>{testTitle}</p>
            </div>
          ) : null}
          {formattedDate ? (
            <div className='flex flex-col gap-[2rem]'>
              <span className='text-[12rem] font-semibold uppercase tracking-[0.18em] text-[#2F8F68]/80'>Completed</span>
              <p className='font-medium text-[#0F3A2E]/80'>{formattedDate}</p>
            </div>
          ) : null}
        </motion.div>
      </div>
    </section>
  );
}
