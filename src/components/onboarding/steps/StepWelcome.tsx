'use client';

import { INTRO_OPTIONS } from '../constants';
import type { BaseStepProps } from '../types';

export function StepWelcome({ answers, onUpdate, t, error, clearError }: BaseStepProps) {
  const selected = answers.introReasons;

  const toggleReason = (id: typeof selected[number]) => {
    const isSelected = selected.includes(id);
    const next = isSelected ? selected.filter(reasonId => reasonId !== id) : [...selected, id];
    onUpdate({ introReasons: next });
    clearError();
  };

  return (
    <div className='flex flex-col gap-[16rem]'>
      <p className='text-[14rem] leading-[1.55] text-slate-500'>{t('onboarding.steps.intro.helper')}</p>

      <div role='group' aria-label={t('onboarding.steps.intro.ariaLabel')} className='flex flex-col gap-[10rem]'>
        {INTRO_OPTIONS.map(option => {
          const isChecked = selected.includes(option.id);

          return (
            <label
              key={option.id}
              className='flex cursor-pointer items-center gap-[12rem] rounded-[16rem] border border-slate-200 bg-white px-[16rem] py-[12rem] transition hover:border-blue-200 hover:bg-blue-50/40 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-200'
            >
              <input
                type='checkbox'
                checked={isChecked}
                onChange={() => toggleReason(option.id)}
                className='h-[16rem] w-[16rem] shrink-0 rounded-[4rem] border border-slate-300 text-blue-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-200'
              />
              <span className='text-[14rem] font-medium text-slate-800'>{t(option.labelKey)}</span>
            </label>
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
