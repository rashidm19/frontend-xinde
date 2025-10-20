'use client';

import type { ButtonHTMLAttributes } from 'react';

import { motion, useReducedMotion } from 'framer-motion';

import { cn } from '@/lib/utils';

interface StepNavigatorProps {
  primaryLabel: string;
  primaryType?: ButtonHTMLAttributes<HTMLButtonElement>['type'];
  disablePrimary?: boolean;
  loadingPrimary?: boolean;
  primaryAriaLabel?: string;
  onBack?: () => void;
  backLabel?: string;
  disableBack?: boolean;
  formId?: string;
  onPrimary?: () => void;
  className?: string;
}

export function StepNavigator({
  primaryLabel,
  primaryType = 'button',
  disablePrimary,
  loadingPrimary,
  primaryAriaLabel,
  onBack,
  backLabel,
  disableBack,
  formId,
  onPrimary,
  className,
}: StepNavigatorProps) {
  const prefersReducedMotion = useReducedMotion();

  const primaryButton = (
    <motion.button
      type={primaryType}
      disabled={disablePrimary || loadingPrimary}
      form={formId}
      onClick={onPrimary}
      aria-label={primaryAriaLabel ?? primaryLabel}
      whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
      className={cn(
        'inline-flex w-full items-center justify-center rounded-full bg-blue-600 px-[22rem] py-[12rem] text-[13.5rem] font-semibold text-white transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200 focus-visible:ring-offset-2 hover:bg-gradient-to-r hover:from-blue-500 hover:to-indigo-600 disabled:cursor-not-allowed disabled:bg-blue-400/70',
        loadingPrimary ? 'opacity-90' : undefined
      )}
    >
      <span className='flex items-center gap-[8rem]'>
        {primaryLabel}
        {loadingPrimary ? (
          <span className='h-[14rem] w-[14rem] animate-spin rounded-full border-[2rem] border-white/40 border-t-white' aria-hidden='true' />
        ) : null}
      </span>
    </motion.button>
  );

  const backButton =
    onBack && backLabel ? (
      <button
        type='button'
        onClick={onBack}
        className='inline-flex w-full items-center justify-center rounded-full border border-slate-200 px-[16rem] py-[10rem] text-[12.5rem] font-medium text-slate-600 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200 focus-visible:ring-offset-2 hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-50'
        disabled={disableBack}
      >
        {backLabel}
      </button>
    ) : null;

  return (
    <div className={cn('flex w-full flex-col gap-[10rem]', className)}>
      <div className='flex w-full flex-col gap-[10rem] tablet:flex-row tablet:items-center tablet:justify-between'>
        {backButton ? (
          <div className='order-2 w-full tablet:order-1 tablet:basis-[20%] tablet:max-w-[160rem]'>{backButton}</div>
        ) : null}
        <div className={cn('order-1 w-full', backButton ? 'tablet:order-2 tablet:flex-1' : 'tablet:order-1 tablet:w-full')}>{primaryButton}</div>
      </div>
    </div>
  );
}
