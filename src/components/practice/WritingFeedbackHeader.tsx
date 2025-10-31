'use client';

import type { ReactNode } from 'react';

import { LogOut } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Logo } from '@/components/auth/Logo';
import Link from 'next/link';

export interface WritingFeedbackHeaderProps {
  topBarElevated?: boolean;
  title: string;
  exitLabel?: string;
  exitHref?: string;
  onExit?: () => void;
  rightSlot?: ReactNode;
}

export function WritingFeedbackHeader({ topBarElevated, title, exitLabel = 'Exit', exitHref = '/profile', onExit, rightSlot }: WritingFeedbackHeaderProps) {
  return (
    <header
      className={cn(
        'sticky top-0 z-[30] flex h-[56rem] w-full items-center justify-between border-b border-white/60 bg-white/90 px-[20rem] backdrop-blur-sm transition-[box-shadow,backdrop-filter,background-color] tablet:h-[64rem] tablet:px-[32rem] desktop:px-[40rem]',
        topBarElevated ? 'bg-white/95 shadow-[0_18rem_44rem_-30rem_rgba(15,23,42,0.2)] backdrop-blur-md' : 'shadow-none'
      )}
      role='navigation'
      aria-label='Writing feedback actions'
    >
      <div className='flex flex-1 items-center gap-[12rem] tablet:flex-none tablet:gap-[16rem]'>
        <Logo showStudyboxText className='h-[28rem] tablet:h-[32rem]' />
      </div>
      <h1 className='hidden text-[18rem] font-semibold text-slate-900 tablet:block'>{title}</h1>
      <div className='flex flex-1 items-center justify-end gap-[12rem] tablet:flex-none tablet:gap-[16rem]'>
        {exitLabel && (
          <Link
            href={exitHref ?? '#'}
            onClick={event => {
              if (onExit) {
                event.preventDefault();
                onExit();
                return;
              }

              if (!exitHref) {
                event.preventDefault();
              }
            }}
            aria-label={exitLabel}
            className='inline-flex items-center gap-[8rem] rounded-[999rem] border border-slate-200 bg-white px-[14rem] py-[8rem] text-[13rem] font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2 tablet:rounded-[16rem] tablet:px-[18rem] tablet:py-[10rem]'
          >
            <LogOut className='size-[16rem]' aria-hidden='true' />
            <span className='hidden tablet:inline'>{exitLabel}</span>
          </Link>
        )}

        {rightSlot}
      </div>
    </header>
  );
}
