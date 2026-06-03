'use client';

import { motion } from 'framer-motion';
import { FileText } from 'lucide-react';

import { cn } from '@/lib/utils';

interface StickySectionNavProps {
  visible: boolean;
  sections: Array<{ key: string; label: string }>;
  active: string;
  onSelect: (key: string) => void;
  onViewTask?: () => void;
  className?: string;
}

export function StickySectionNav({ visible, sections, active, onSelect, onViewTask, className }: StickySectionNavProps) {
  const hasTaskButton = typeof onViewTask === 'function';

  return (
    <motion.nav
      initial={false}
      animate={{
        opacity: visible ? 1 : 0,
        y: visible ? 0 : -12,
        pointerEvents: visible ? 'auto' : 'none',
      }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={cn('fixed inset-x-0 top-0 z-[60] px-[10rem] py-[6rem] tablet:px-[12rem] tablet:py-[8rem]', className)}
      aria-label='Page sections'
    >
      <div
        className={cn(
          'mx-auto flex w-full max-w-[960rem] flex-wrap items-center gap-[12rem] rounded-[18rem] border border-slate-200/70 bg-white/80 px-[12rem] py-[6rem] text-[12rem] font-semibold text-slate-600 shadow-[0_10rem_32rem_-24rem_rgba(18,37,68,0.2)] backdrop-blur-xl backdrop-saturate-150 tablet:gap-[16rem] tablet:rounded-[20rem] tablet:px-[16rem] tablet:py-[8rem] tablet:text-[13rem] tablet:shadow-[0_12rem_40rem_-32rem_rgba(18,37,68,0.22)] tablet:flex-nowrap',
          hasTaskButton ? 'justify-between' : 'justify-center'
        )}
      >
        <div className='flex min-w-0 flex-1 items-center gap-[10rem] overflow-x-auto pr-[6rem] tablet:gap-[12rem] tablet:pr-[8rem]'>
          {sections.map(section => {
            const isActive = section.key === active;
            return (
              <button
                key={section.key}
                type='button'
                aria-current={isActive ? 'page' : undefined}
                onClick={() => onSelect(section.key)}
                className={cn(
                  'whitespace-nowrap rounded-[14rem] px-[14rem] py-[6rem] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 tablet:rounded-[16rem] tablet:px-[16rem] tablet:py-[8rem]',
                  isActive
                    ? 'bg-sky-700 text-white shadow-[0_12rem_28rem_-22rem_rgba(45,78,168,0.34)]'
                    : 'border border-transparent text-slate-600/85 hover:border-slate-300 hover:bg-white/90'
                )}
              >
                {section.label}
              </button>
            );
          })}
        </div>

        {hasTaskButton ? (
          <button
            type='button'
            onClick={() => onViewTask?.()}
            aria-label='View writing task'
            title='View the original IELTS task'
            className='inline-flex shrink-0 items-center gap-[6rem] rounded-[999rem] border border-sky-200 bg-sky-50 px-[12rem] py-[6rem] text-[11.5rem] font-semibold text-sky-700 shadow-[0_10rem_24rem_-18rem_rgba(29,78,216,0.3)] transition hover:border-sky-300 hover:bg-sky-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-sky-400 tablet:gap-[8rem] tablet:px-[14rem] tablet:py-[7rem] tablet:text-[12rem]'
          >
            <FileText className='size-[14rem] text-sky-600 tablet:size-[15rem]' aria-hidden='true' />
            View task
          </button>
        ) : null}
      </div>
    </motion.nav>
  );
}
