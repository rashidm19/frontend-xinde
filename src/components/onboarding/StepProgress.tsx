'use client';

import { motion, useReducedMotion } from 'framer-motion';

interface StepProgressProps {
  currentStep: number;
  totalSteps: number;
  label: string;
}

export function StepProgress({ currentStep, totalSteps, label }: StepProgressProps) {
  const prefersReducedMotion = useReducedMotion();
  const completion = Math.min(Math.max(currentStep / totalSteps, 0), 1);

  return (
    <div className='flex flex-col gap-[6rem]' aria-live='polite'>
      <div className='flex items-center justify-between text-[11.5rem] font-medium uppercase tracking-[0.14em] text-slate-500'>
        <span>{label}</span>
        <span>
          {Math.round(completion * 100)}%
        </span>
      </div>
      <div className='h-[4rem] w-full overflow-hidden rounded-full bg-slate-100'>
        <motion.div
          className='h-full w-full rounded-full bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600'
          style={{ transformOrigin: 'left center' }}
          initial={prefersReducedMotion ? { scaleX: completion } : { scaleX: 0 }}
          animate={{ scaleX: completion }}
          transition={prefersReducedMotion ? undefined : { duration: 0.6, ease: 'easeInOut' }}
          role='progressbar'
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(completion * 100)}
        />
      </div>
    </div>
  );
}
