'use client';

import type { BaseStepProps } from '../types';

import { ChoiceCard } from './ChoiceCard';

export function StepRhythm({ answers, onUpdate, t, error, clearError, question }: BaseStepProps) {
  const selected = answers.timeline;
  const options = [...(question?.options ?? [])].sort((a, b) => a.order - b.order);
  const helperText = question?.description ?? t('onboarding.steps.timeline.helper');
  const groupLabel = question?.title ?? t('onboarding.steps.timeline.ariaLabel');

  return (
    <div className='flex flex-col gap-[16rem]'>
      {helperText ? <p className='text-[14rem] leading-[1.55] text-slate-500'>{helperText}</p> : null}
      <div role='radiogroup' aria-label={groupLabel} className='grid gap-[12rem]'>
        {options.map(option => (
          <ChoiceCard
            key={option.id}
            role='radio'
            aria-checked={selected === option.id}
            active={selected === option.id}
            label={option.label}
            onClick={() => {
              onUpdate({ timeline: option.id });
              clearError();
            }}
          />
        ))}
      </div>
      {error ? (
        <p className='text-[12.5rem] font-medium text-red-500' role='alert'>
          {error}
        </p>
      ) : null}
    </div>
  );
}
