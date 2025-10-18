'use client';

import type { ReactNode } from 'react';

import { LogOut } from 'lucide-react';

import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/auth/Logo';

export interface WritingFeedbackHeaderProps {
  topBarElevated: boolean;
  title: string;
  exitLabel?: string;
  exitHref?: string;
  onExit?: () => void;
  rightSlot?: ReactNode;
}

export function WritingFeedbackHeader({ topBarElevated, title, exitLabel = 'Exit', exitHref = '/profile', onExit, rightSlot }: WritingFeedbackHeaderProps) {
  const router = useRouter();

  const handleExit = () => {
    if (onExit) {
      onExit();
      return;
    }

    if (exitHref) {
      router.push(exitHref);
    }
  };

  return (
    <header
      className={cn(
        'sticky top-0 z-[30] flex h-[64rem] w-full items-center justify-between border-b border-white/60 bg-white/85 px-[40rem] backdrop-blur-sm transition-[box-shadow,backdrop-filter,background-color] tablet:px-[32rem]',
        topBarElevated ? 'bg-white/95 shadow-[0_18rem_44rem_-30rem_rgba(15,23,42,0.2)] backdrop-blur-md' : 'shadow-none'
      )}
      role='navigation'
      aria-label='Writing feedback actions'
    >
      <div className='flex items-center gap-[16rem]'>
        <Logo showStudyboxText className='h-[32rem]' />
      </div>
      <h1 className='text-[18rem] font-semibold text-slate-900'>{title}</h1>
      <div className='flex items-center gap-[16rem]'>
        {exitLabel && (
          <button
            type='button'
            onClick={handleExit}
            className='inline-flex items-center gap-[10rem] rounded-[16rem] border border-slate-200 bg-white px-[18rem] py-[10rem] text-[13rem] font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2'
          >
            <LogOut className='size-[16rem]' aria-hidden='true' />
            {exitLabel}
          </button>
        )}

        {rightSlot}
      </div>
    </header>
  );
}
