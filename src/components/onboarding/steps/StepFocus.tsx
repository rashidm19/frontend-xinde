'use client';

import { TARGET_SCORE_OPTIONS } from '../constants';
import type { BaseStepProps } from '../types';

export function StepFocus({ answers, onUpdate, t, error, clearError }: BaseStepProps) {
  const selected = answers.targetScore;

  const handleSelect = (id: (typeof TARGET_SCORE_OPTIONS)[number]['id']) => {
    onUpdate({ targetScore: id });
    clearError();
  };

  return (
    <div className='flex flex-col gap-[16rem]'>
      <p className='text-[14rem] leading-[1.55] text-slate-500'>{t('onboarding.steps.score.helper')}</p>
      <div
        role='radiogroup'
        aria-label={t('onboarding.steps.score.ariaLabel')}
        className='grid grid-cols-6 gap-[10rem] tabular-nums'
      >
        {TARGET_SCORE_OPTIONS.map(option => {
          const isActive = selected === option.id;

          return (
            <button
              key={option.id}
              type='button'
              role='radio'
              aria-checked={isActive}
              onClick={() => handleSelect(option.id)}
              className={`inline-flex w-full items-center justify-center rounded-full border px-[12rem] py-[9rem] text-[13rem] font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200 focus-visible:ring-offset-2 ${isActive ? 'border-transparent bg-blue-600 text-white shadow-[0_16rem_36rem_-28rem_rgba(37,99,235,0.45)]' : 'border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:bg-blue-50/40'}`}
            >
              {t(option.labelKey)}
            </button>
          );
        })}
      </div>
      {error ? (
        <p className='text-[12.5rem] font-medium text-red-500' role='alert'>
          {error}
        </p>
      ) : null}
    </div>
  );
}
