'use client';

import { memo } from 'react';

import { BottomSheet, BottomSheetClose, BottomSheetContent } from '@/components/ui/bottom-sheet';
import { cn } from '@/lib/utils';

import type { ListeningFilterKey } from './question-types';

interface ListeningFiltersSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  counts: Record<ListeningFilterKey, number>;
  activeFilter: ListeningFilterKey;
  onSelect: (value: ListeningFilterKey) => void;
}

const FILTER_LABELS: Record<ListeningFilterKey, string> = {
  all: 'All questions',
  correct: 'Correct',
  incorrect: 'Incorrect',
  unanswered: 'Unanswered',
};

export const ListeningFiltersSheet = memo(function ListeningFiltersSheet({ open, onOpenChange, counts, activeFilter, onSelect }: ListeningFiltersSheetProps) {
  return (
    <BottomSheet open={open} onOpenChange={onOpenChange}>
      <BottomSheetContent className='px-[4rem]'>
        <div className='flex h-full flex-col'>
          <header className='sticky top-0 z-[1] flex items-center justify-between gap-[12rem] border-b border-[#CFE7D5] bg-white/95 px-[12rem] py-[14rem] backdrop-blur'>
            <div className='space-y-[2rem] text-left'>
              <span className='text-[12rem] font-semibold uppercase tracking-[0.18em] text-[#2F8F68]/80'>Filters</span>
              <h2 className='text-[18rem] font-semibold text-[#0F3A2E]'>Focus your review</h2>
              <p className='text-[13rem] text-[#1E5A45]/70'>Choose which answers you want to scan in the overview.</p>
            </div>
            <BottomSheetClose asChild>
              <button
                type='button'
                className='inline-flex size-[32rem] min-w-[32rem] items-center justify-center rounded-full border border-[#CFE7D5] bg-white text-[#2F8F68] transition hover:bg-[#EAF8F0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2F8F68] focus-visible:ring-offset-2'
                aria-label='Close filters'
              >
                <span className='text-[16rem] font-semibold'>×</span>
              </button>
            </BottomSheetClose>
          </header>

          <div className='flex-1 overflow-y-auto px-[12rem] py-[20rem] scrollbar-thin scrollbar-thumb-[#CFE7D5]'>
            <ul className='flex flex-col gap-[12rem]'>
              {(Object.keys(FILTER_LABELS) as ListeningFilterKey[]).map(key => {
                const isActive = activeFilter === key;
                return (
                  <li key={key}>
                    <button
                      type='button'
                      onClick={() => onSelect(key)}
                      aria-pressed={isActive}
                      className={cn(
                        'flex w-full items-center justify-between rounded-[20rem] border px-[18rem] py-[14rem] text-left text-[14rem] font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2F8F68] focus-visible:ring-offset-2',
                        isActive ? 'border-[#2F8F68] bg-[#F0FFF7] text-[#0F3A2E]' : 'border-[#CFE7D5] text-[#1E5A45] hover:bg-[#EAF8F0]'
                      )}
                    >
                      <span>{FILTER_LABELS[key]}</span>
                      <span className='text-[13rem] font-semibold text-[#2F8F68]'>{counts[key]}</span>
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
