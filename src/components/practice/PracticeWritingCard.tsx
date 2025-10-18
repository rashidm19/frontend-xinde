import type { ReactNode } from 'react';

import Link from 'next/link';

import { cn } from '@/lib/utils';

interface PracticeWritingCardProps {
  closeHref: string;
  closeAlt: string;
  iconAlt: string;
  headingLabel: ReactNode;
  durationLabel: ReactNode;
  partsLabel: ReactNode;
  partsValue: ReactNode;
  children: ReactNode;
  className?: string;
  headingSlot?: ReactNode;
}

export function PracticeWritingCard({
  closeHref,
  closeAlt,
  iconAlt,
  headingLabel,
  durationLabel,
  partsLabel,
  partsValue,
  children,
  className,
  headingSlot,
}: PracticeWritingCardProps) {
  return (
    <div
      className={cn(
        'relative flex w-full max-w-[720rem] flex-col gap-[24rem] rounded-[20rem] border border-white/80 bg-white/95 px-[36rem] py-[28rem] shadow-[0_22rem_64rem_-38rem_rgba(15,23,42,0.3)] backdrop-blur-sm',
        className
      )}
    >
      <Link href={closeHref} className='absolute right-[20rem] top-[20rem] flex size-[34rem] items-center justify-center rounded-full bg-slate-100 transition hover:bg-slate-200'>
        <img src='/images/icon_cross.svg' alt={closeAlt} className='size-[16rem]' />
      </Link>

      {headingSlot ?? (
        <div className='flex items-center gap-x-[12rem]'>
          <div className='flex size-[48rem] items-center justify-center rounded-full bg-d-blue-secondary'>
            <img src='/images/icon_writingSection.svg' className='size-[22rem]' alt={iconAlt} />
          </div>
          <div className='flex flex-col gap-y-[6rem]'>
            <div className='text-[14rem] font-medium leading-none text-d-black/80'>{headingLabel}</div>
            <div className='text-[18rem] font-semibold leading-none text-d-black'>{durationLabel}</div>
          </div>
          <div className='ml-[12rem] flex flex-col gap-y-[6rem]'>
            <div className='text-[14rem] font-medium leading-none text-d-black/80'>{partsLabel}</div>
            <div className='text-[18rem] font-semibold leading-none text-d-black'>{partsValue}</div>
          </div>
        </div>
      )}

      <div>{children}</div>
    </div>
  );
}
