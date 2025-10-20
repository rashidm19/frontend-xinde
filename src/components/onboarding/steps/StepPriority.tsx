'use client';

import type { BaseStepProps } from '../types';

const PRIORITY_ICONS: Record<string, string> = {
  writing: '✍️',
  speaking: '🎤',
  reading: '📖',
  listening: '🎧',
  'not-sure': '❓',
};

export function StepPriority({ answers, onUpdate, t, error, clearError, question }: BaseStepProps) {
  const selected = answers.prioritySections;
  const options = [...(question?.options ?? [])].sort((a, b) => a.order - b.order);
  const helperText = question?.description ?? t('onboarding.steps.priority.helper');
  const groupLabel = question?.title ?? t('onboarding.steps.priority.ariaLabel');

  const togglePriority = (id: string) => {
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
      {helperText ? <p className='text-[14rem] leading-[1.55] text-slate-500'>{helperText}</p> : null}

      <div role='group' aria-label={groupLabel} className='flex flex-col gap-[10rem]'>
        {options.map(option => {
          const isChecked = selected.includes(option.id);
          const icon = PRIORITY_ICONS[option.id];

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
                {icon ? <span aria-hidden='true'>{icon}</span> : null}
                {option.label}
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
