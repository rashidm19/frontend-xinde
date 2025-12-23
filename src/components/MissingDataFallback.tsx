'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface MissingDataFallbackProps {
  title: string;
  description?: string;
  actionLabel: string;
  onAction: () => void;
  className?: string;
}

/**
 * Presents a simple centered fallback with a CTA button for flows where data failed to load.
 * Keeps visuals consistent across mock/practice screens without forcing navigation immediately.
 */
export const MissingDataFallback = ({ title, description, actionLabel, onAction, className}: MissingDataFallbackProps) => {
  return (
    <main className={cn('flex min-h-[100dvh] items-center justify-center bg-[#f6f6f6] px-[16rem] py-[40rem]', className)}>
      <div className='flex w-full max-w-[480rem] flex-col items-center gap-[16rem] rounded-[24rem] bg-white px-[32rem] py-[40rem] text-center shadow-[0_24rem_64rem_rgba(15,23,42,0.12)]'>
        <p className='text-[22rem] font-semibold leading-[28rem] text-d-black'>{title}</p>
        {description ? <p className='text-[16rem] leading-[22rem] text-d-black/70'>{description}</p> : null}

        <button
          type='button'
          className='flex h-[48rem] w-full items-center justify-center rounded-[40rem] bg-d-green text-[20rem] font-normal leading-[24rem] tracking-[-0.2rem] text-d-black hover:bg-d-green/20'
          onClick={onAction}
        >
          {actionLabel}
        </button>
      </div>
    </main>
  );
};
