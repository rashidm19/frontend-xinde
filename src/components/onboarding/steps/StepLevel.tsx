'use client';

import type { BaseStepProps } from '../types';

import { ChoiceCard } from './ChoiceCard';

export function StepLevel({ answers, onUpdate, t, error, clearError, question }: BaseStepProps) {
  const selected = answers.goal;
  const options = [...(question?.options ?? [])].sort((a, b) => a.order - b.order);
  const selectedOption = options.find(option => option.id === selected);
  const otherActive = Boolean(selectedOption?.allows_custom_answer);
  const helperText = question?.description ?? t('onboarding.steps.goal.helper');
  const groupLabel = question?.title ?? t('onboarding.steps.goal.ariaLabel');

  const handleSelect = (id: string) => {
    const option = options.find(item => item.id === id);
    const allowsCustom = option?.allows_custom_answer ?? false;
    onUpdate({ goal: id, goalOther: allowsCustom ? answers.goalOther ?? '' : '' });
    clearError();
  };

  return (
    <div className='flex flex-col gap-[16rem]'>
      {helperText ? <p className='text-[14rem] leading-[1.55] text-slate-500'>{helperText}</p> : null}

      <div role='radiogroup' aria-label={groupLabel} className='grid gap-[12rem]'>
        {options.map(option => {
          const isActive = selected === option.id;
          const requiresInput = option.allows_custom_answer ?? false;

          return (
            <div key={option.id} className='flex flex-col gap-[10rem]'>
              <ChoiceCard
                role='radio'
                aria-checked={isActive}
                active={isActive}
                label={option.label}
                onClick={() => handleSelect(option.id)}
              />
              {requiresInput && isActive ? (
                <div className='pl-[14rem]'>
                  <label htmlFor='goal-other-input' className='sr-only'>
                    {t('onboarding.steps.goal.otherLabel')}
                  </label>
                  <input
                    id='goal-other-input'
                    type='text'
                    value={answers.goalOther ?? ''}
                    onChange={event => {
                      onUpdate({ goalOther: event.target.value });
                      clearError();
                    }}
                    className='w-full rounded-[12rem] border border-slate-200 bg-white px-[14rem] py-[10rem] text-[13.5rem] text-slate-800 shadow-[0_14rem_32rem_-28rem_rgba(15,23,42,0.25)] focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200'
                    placeholder={t('onboarding.steps.goal.otherPlaceholder')}
                  />
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      {otherActive ? (
        <p className='text-[12rem] text-slate-500'>{t('onboarding.steps.goal.otherHint')}</p>
      ) : null}

      {error ? (
        <p className='text-[12.5rem] font-medium text-red-500' role='alert'>
          {error}
        </p>
      ) : null}
    </div>
  );
}
