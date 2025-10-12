'use client';

import { motion, useReducedMotion } from 'framer-motion';

import { GOAL_OPTIONS, INTRO_OPTIONS, PRIORITY_OPTIONS, TARGET_SCORE_OPTIONS, TIMELINE_OPTIONS } from '../constants';
import type { BaseStepProps } from '../types';

export function StepFinish({ answers, t }: BaseStepProps) {
  const prefersReducedMotion = useReducedMotion();

  const introReasons = INTRO_OPTIONS.filter(option => answers.introReasons.includes(option.id));
  const goal = GOAL_OPTIONS.find(option => option.id === answers.goal);
  const targetScore = TARGET_SCORE_OPTIONS.find(option => option.id === answers.targetScore);
  const timeline = TIMELINE_OPTIONS.find(option => option.id === answers.timeline);
  const priorities = PRIORITY_OPTIONS.filter(option => answers.prioritySections.includes(option.id));

  const goalValue = (() => {
    if (!answers.goal) return '—';
    if (answers.goal === 'other') {
      return answers.goalOther?.trim().length ? answers.goalOther.trim() : '—';
    }
    return goal ? t(goal.labelKey) : '—';
  })();

  const summaryRows: Array<{ label: string; value: string }> = [
    {
      label: t('onboarding.steps.finish.summary.intro'),
      value: introReasons.length ? introReasons.map(reason => t(reason.labelKey)).join(', ') : '—',
    },
    {
      label: t('onboarding.steps.finish.summary.goal'),
      value: goalValue,
    },
    {
      label: t('onboarding.steps.finish.summary.score'),
      value: targetScore ? t(targetScore.labelKey) : '—',
    },
    {
      label: t('onboarding.steps.finish.summary.timeline'),
      value: timeline ? t(timeline.labelKey) : '—',
    },
    {
      label: t('onboarding.steps.finish.summary.priority'),
      value: priorities.length ? priorities.map(priority => t(priority.labelKey)).join(', ') : '—',
    },
  ];

  return (
    <div className='flex flex-col gap-[14rem]'>
      <div className='flex flex-col items-center gap-[10rem] text-center'>
        <motion.div
          className='relative flex h-[68rem] w-[68rem] items-center justify-center rounded-full bg-blue-50'
          initial={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.85 }}
          animate={prefersReducedMotion ? undefined : { opacity: 1, scale: 1, transition: { duration: 0.6, ease: 'easeOut' } }}
        >
          <motion.svg
            className='absolute inset-0'
            viewBox='0 0 120 120'
            initial={prefersReducedMotion ? undefined : { rotate: -90 }}
            animate={prefersReducedMotion ? undefined : { rotate: -90 }}
          >
            <circle cx='60' cy='60' r='54' stroke='rgba(59,130,246,0.2)' strokeWidth='6' fill='transparent' />
            <motion.circle
              cx='60'
              cy='60'
              r='54'
              stroke='rgba(37,99,235,0.75)'
              strokeWidth='6'
              strokeLinecap='round'
              fill='transparent'
              initial={prefersReducedMotion ? { pathLength: 1 } : { pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={prefersReducedMotion ? undefined : { duration: 1.2, ease: 'easeInOut' }}
            />
          </motion.svg>
          <motion.div
            className='relative z-10 flex h-[28rem] w-[28rem] items-center justify-center rounded-full bg-blue-600 text-white'
            initial={prefersReducedMotion ? undefined : { scale: 0.7, opacity: 0 }}
            animate={prefersReducedMotion ? undefined : { scale: 1, opacity: 1, transition: { delay: 0.2, duration: 0.4 } }}
            aria-hidden='true'
          >
            <svg width='14' height='14' viewBox='0 0 18 18' fill='none' xmlns='http://www.w3.org/2000/svg'>
              <path d='M4 9.5L7.25 12.5L14 5.5' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' />
            </svg>
          </motion.div>
        </motion.div>
        <div className='flex flex-col gap-[4rem]'>
          <h2 className='text-[24rem] font-semibold text-slate-900'>{t('onboarding.steps.finish.title')}</h2>
          <p className='text-[13.5rem] leading-[1.5] text-slate-500'>{t('onboarding.steps.finish.subtitle')}</p>
        </div>
      </div>

      <div className='space-y-[10rem] rounded-[16rem] border border-gray-100 bg-gray-50 px-[24rem] py-[18rem] text-[13.5rem] text-gray-700'>
        <dl className='grid grid-cols-1 gap-[12rem] tablet:grid-cols-2'>
          {summaryRows.map(row => (
            <div key={row.label} className='flex flex-col gap-[2rem]'>
              <dt className='text-[13rem] font-semibold text-gray-600'>{row.label}</dt>
              <dd className='truncate text-[13rem]' title={row.value}>
                {row.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
