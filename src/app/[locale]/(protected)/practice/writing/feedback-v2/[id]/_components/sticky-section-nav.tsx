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
}

export function StickySectionNav({ visible, sections, active, onSelect, onViewTask }: StickySectionNavProps) {
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
      className='fixed inset-x-0 top-0 z-[60] px-[12rem] py-[8rem]'
      aria-label='Page sections'
    >
      <div
        className={cn(
          'mx-auto flex w-full max-w-[960rem] flex-wrap items-center gap-[16rem] rounded-[20rem] border border-slate-200/70 bg-white/75 px-[16rem] py-[8rem] text-[13rem] font-semibold text-slate-600 shadow-[0_12rem_40rem_-32rem_rgba(18,37,68,0.22)] backdrop-blur-xl backdrop-saturate-150 md:flex-nowrap',
          hasTaskButton ? 'justify-between' : 'justify-center'
        )}
      >
        <div className='flex min-w-0 flex-1 items-center gap-[12rem] overflow-x-auto pr-[8rem]'>
          {sections.map(section => {
            const isActive = section.key === active;
            return (
              <button
                key={section.key}
                type='button'
                aria-current={isActive ? 'page' : undefined}
                onClick={() => onSelect(section.key)}
                className={cn(
                  'whitespace-nowrap rounded-[16rem] px-[16rem] py-[8rem] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2',
                  isActive
                    ? 'bg-slate-900 text-white shadow-[0_12rem_28rem_-22rem_rgba(15,23,42,0.34)]'
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
            className='inline-flex shrink-0 items-center gap-[8rem] rounded-[999rem] border border-sky-200 bg-sky-50 px-[14rem] py-[7rem] text-[12rem] font-semibold text-sky-700 shadow-[0_10rem_24rem_-18rem_rgba(29,78,216,0.3)] transition hover:border-sky-300 hover:bg-sky-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-sky-400'
          >
            <FileText className='size-[15rem] text-slate-500' aria-hidden='true' />
            View task
          </button>
        ) : null}
      </div>
    </motion.nav>
  );
}
