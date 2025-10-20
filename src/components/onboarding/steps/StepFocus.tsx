'use client';

import type { BaseStepProps } from '../types';

export function StepFocus({ answers, onUpdate, t, error, clearError, question }: BaseStepProps) {
  const selected = answers.targetScore;
  const options = [...(question?.options ?? [])].sort((a, b) => a.order - b.order);
  const helperText = question?.description ?? t('onboarding.steps.score.helper');
  const groupLabel = question?.title ?? t('onboarding.steps.score.ariaLabel');

  const handleSelect = (id: string) => {
    onUpdate({ targetScore: id });
    clearError();
  };

  return (
    <div className='flex flex-col gap-[16rem]'>
      {helperText ? <p className='text-[14rem] leading-[1.55] text-slate-500'>{helperText}</p> : null}
      <div
        role='radiogroup'
        aria-label={groupLabel}
        className='grid grid-cols-2 gap-[10rem] tabular-nums tablet:grid-cols-3 desktop:grid-cols-6'
      >
        {options.map(option => {
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
              {option.label}
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
