'use client';

import { TIMELINE_OPTIONS } from '../constants';
import type { BaseStepProps } from '../types';

import { ChoiceCard } from './ChoiceCard';

export function StepRhythm({ answers, onUpdate, t, error, clearError }: BaseStepProps) {
  const selected = answers.timeline;

  return (
    <div className='flex flex-col gap-[16rem]'>
      <p className='text-[14rem] leading-[1.55] text-slate-500'>{t('onboarding.steps.timeline.helper')}</p>
      <div role='radiogroup' aria-label={t('onboarding.steps.timeline.ariaLabel')} className='grid gap-[12rem]'>
        {TIMELINE_OPTIONS.map(option => (
          <ChoiceCard
            key={option.id}
            role='radio'
            aria-checked={selected === option.id}
            active={selected === option.id}
            label={t(option.labelKey)}
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
