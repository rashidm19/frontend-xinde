'use client';

import { PRIORITY_OPTIONS } from '../constants';
import type { BaseStepProps } from '../types';

export function StepPriority({ answers, onUpdate, t, error, clearError }: BaseStepProps) {
  const selected = answers.prioritySections;

  const togglePriority = (id: (typeof PRIORITY_OPTIONS)[number]['id']) => {
    let next: typeof selected;

    if (id === 'not-sure') {
      next = selected.includes(id) ? [] : ['not-sure'];
    } else {
      const withoutNotSure = selected.filter(value => value !== 'not-sure');
      next = withoutNotSure.includes(id) ? withoutNotSure.filter(value => value !== id) : [...withoutNotSure, id];
    }

    onUpdate({ prioritySections: next });
    clearError();
  };

  return (
    <div className='flex flex-col gap-[16rem]'>
      <p className='text-[14rem] leading-[1.55] text-slate-500'>{t('onboarding.steps.priority.helper')}</p>

      <div role='group' aria-label={t('onboarding.steps.priority.ariaLabel')} className='flex flex-col gap-[10rem]'>
        {PRIORITY_OPTIONS.map(option => {
          const isChecked = selected.includes(option.id);

          return (
            <label
              key={option.id}
              className='flex cursor-pointer items-center gap-[12rem] rounded-[16rem] border border-slate-200 bg-white px-[16rem] py-[12rem] transition hover:border-blue-200 hover:bg-blue-50/40 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-200'
            >
              <input
                type='checkbox'
                checked={isChecked}
                onChange={() => togglePriority(option.id)}
                className='h-[16rem] w-[16rem] shrink-0 rounded-[4rem] border border-slate-300 text-blue-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-200'
              />
              <span className='flex items-center gap-[8rem] text-[14rem] font-medium text-slate-800'>
                {option.icon ? <span aria-hidden='true'>{option.icon}</span> : null}
                {t(option.labelKey)}
              </span>
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
