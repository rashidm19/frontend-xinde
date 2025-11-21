'use client';

import { memo } from 'react';

import { BottomSheet, BottomSheetClose, BottomSheetContent } from '@/components/ui/bottom-sheet';
import { cn } from '@/lib/utils';

import type { ReadingFilterKey } from './question-types';

interface ReadingFiltersSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  counts: Record<ReadingFilterKey, number>;
  activeFilter: ReadingFilterKey;
  onSelect: (value: ReadingFilterKey) => void;
}

const FILTER_LABELS: Record<ReadingFilterKey, string> = {
  all: 'All questions',
  correct: 'Correct',
  incorrect: 'Incorrect',
  unanswered: 'Unanswered',
};

export const ReadingFiltersSheet = memo(function ReadingFiltersSheet({ open, onOpenChange, counts, activeFilter, onSelect }: ReadingFiltersSheetProps) {
  return (
    <BottomSheet open={open} onOpenChange={onOpenChange}>
      <BottomSheetContent className='px-[4rem]'>
        <div className='flex h-full flex-col'>
          <header className='sticky top-0 z-[1] flex items-center justify-between gap-[12rem] border-b border-[#E1D6B4] bg-white/95 px-[12rem] py-[14rem] backdrop-blur'>
            <div className='space-y-[2rem] text-left'>
              <span className='text-[12rem] font-semibold uppercase tracking-[0.18em] text-[#85784A]'>Filters</span>
              <h2 className='text-[18rem] font-semibold text-d-black'>Focus your review</h2>
              <p className='text-[13rem] text-d-black/65'>Choose which answers you want to scan in the overview.</p>
            </div>
            <BottomSheetClose asChild>
              <button
                type='button'
                className='inline-flex size-[32rem] min-w-[32rem] items-center justify-center rounded-full border border-[#D9CDA9] bg-white text-[#6F6335] transition hover:bg-d-yellow-secondary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8E7B45] focus-visible:ring-offset-2'
                aria-label='Close filters'
              >
                <span className='text-[16rem] font-semibold'>×</span>
              </button>
            </BottomSheetClose>
          </header>

          <div className='flex-1 overflow-y-auto px-[12rem] py-[20rem] scrollbar-thin scrollbar-thumb-[#E1D6B4]'>
            <ul className='flex flex-col gap-[12rem]'>
              {(Object.keys(FILTER_LABELS) as ReadingFilterKey[]).map(key => {
                const isActive = activeFilter === key;
                return (
                  <li key={key}>
                    <button
                      type='button'
                      onClick={() => onSelect(key)}
                      aria-pressed={isActive}
                      className={cn(
                        'flex w-full items-center justify-between rounded-[20rem] border px-[18rem] py-[14rem] text-left text-[14rem] font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8E7B45] focus-visible:ring-offset-2',
                        isActive ? 'border-[#5e7a3f] bg-[#F0F6E8] text-[#2F5E25]' : 'border-[#E1D6B4] text-[#4B4628] hover:bg-d-yellow-secondary/50'
                      )}
                    >
                      <span>{FILTER_LABELS[key]}</span>
                      <span className='text-[13rem] font-semibold text-[#85784A]'>{counts[key]}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </BottomSheetContent>
    </BottomSheet>
  );
});
