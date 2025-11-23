'use client';

import * as React from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface MissingDataFallbackProps {
  title: string;
  description?: string;
  actionLabel: string;
  onAction: () => void;
  className?: string;
  actionVariant?: 'primary' | 'secondary';
}

/**
 * Presents a simple centered fallback with a CTA button for flows where data failed to load.
 * Keeps visuals consistent across mock/practice screens without forcing navigation immediately.
 */
export const MissingDataFallback = ({ title, description, actionLabel, onAction, className, actionVariant = 'primary' }: MissingDataFallbackProps) => {
  return (
    <main className={cn('flex min-h-[100dvh] items-center justify-center bg-[#f6f6f6] px-[16rem] py-[40rem]', className)}>
      <div className='flex w-full max-w-[480rem] flex-col items-center gap-[16rem] rounded-[24rem] bg-white px-[32rem] py-[40rem] text-center shadow-[0_24rem_64rem_rgba(15,23,42,0.12)]'>
        <p className='text-[22rem] font-semibold leading-[28rem] text-d-black'>{title}</p>
        {description ? <p className='text-[16rem] leading-[22rem] text-d-black/70'>{description}</p> : null}
        <Button
          type='button'
          variant={actionVariant === 'secondary' ? 'outline' : 'default'}
          className='mt-[8rem] w-full rounded-[16rem] px-[24rem] py-[16rem] text-[16rem] font-semibold text-d-black'
          onClick={onAction}
        >
          {actionLabel}
        </Button>
      </div>
    </main>
  );
};
