'use client';

import { memo } from 'react';

import { Filter } from 'lucide-react';

import { BottomSheet, BottomSheetClose, BottomSheetContent } from '@/components/ui/bottom-sheet';
import { cn } from '@/lib/utils';

type PartKey = 'part_1' | 'part_2' | 'part_3' | 'part_4';

interface MobileNavSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activePart: PartKey;
  onPartChange: (part: PartKey) => void;
  partCounts: Record<PartKey, number>;
  onOpenFilters: () => void;
}

const PARTS: { key: PartKey; label: string }[] = [
  { key: 'part_1', label: 'Part 1' },
  { key: 'part_2', label: 'Part 2' },
  { key: 'part_3', label: 'Part 3' },
  { key: 'part_4', label: 'Part 4' },
];

export const MobileNavSheet = memo(function MobileNavSheet({ open, onOpenChange, activePart, onPartChange, partCounts, onOpenFilters }: MobileNavSheetProps) {
  const handlePartSelect = (part: PartKey) => {
    onPartChange(part);
    onOpenChange(false);
  };

  return (
    <BottomSheet open={open} onOpenChange={onOpenChange}>
      <BottomSheetContent className='px-[4rem]'>
        <div className='flex h-full flex-col'>
          <header className='sticky top-0 z-[1] flex items-center justify-between gap-[12rem] border-b border-[#E1D6B4] bg-white/95 px-[12rem] py-[14rem] backdrop-blur'>
            <div className='space-y-[2rem] text-left'>
              <span className='text-[12rem] font-semibold uppercase tracking-[0.18em] text-[#85784A]'>Quick Actions</span>
              <h2 className='text-[18rem] font-semibold text-d-black'>Navigation</h2>
            </div>
            <BottomSheetClose asChild>
              <button
                type='button'
                className='inline-flex size-[32rem] min-w-[32rem] items-center justify-center rounded-full border border-[#D9CDA9] bg-white text-[#6F6335] transition hover:bg-d-yellow-secondary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8E7B45] focus-visible:ring-offset-2'
                aria-label='Close navigation'
              >
                <span className='text-[16rem] font-semibold'>×</span>
              </button>
            </BottomSheetClose>
          </header>

          <div className='flex-1 overflow-y-auto px-[12rem] py-[20rem] scrollbar-thin scrollbar-thumb-[#E1D6B4]'>
            <div className='space-y-[20rem]'>
              {/* Action buttons - No View Passage for Listening */}
              <div className='space-y-[12rem]'>
                <button
                  type='button'
                  onClick={() => {
                    onOpenFilters();
                    onOpenChange(false);
                  }}
                  className='flex w-full items-center gap-[14rem] rounded-[16rem] border border-[#E1D6B4] px-[16rem] py-[14rem] text-left transition hover:bg-d-yellow-secondary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8E7B45] focus-visible:ring-offset-2'
                >
                  <span className='flex size-[36rem] items-center justify-center rounded-[10rem] bg-d-yellow-secondary/70'>
                    <Filter className='size-[18rem] text-[#6F6335]' />
                  </span>
                  <div className='flex flex-col gap-[2rem]'>
                    <span className='text-[14rem] font-semibold text-d-black'>Filter Questions</span>
                    <span className='text-[12rem] text-d-black/60'>Show only correct, incorrect, or unanswered</span>
                  </div>
                </button>
              </div>

              {/* Part selection - 2x2 grid for 4 parts */}
              <div className='space-y-[12rem]'>
                <div className='border-t border-[#E1D6B4]/60 pt-[20rem]'>
                  <span className='text-[12rem] font-semibold uppercase tracking-[0.15em] text-[#85784A]'>Jump to Part</span>
                </div>
                <div className='grid grid-cols-2 gap-[10rem]'>
                  {PARTS.map(part => {
                    const isActive = activePart === part.key;
                    return (
                      <button
                        key={part.key}
                        type='button'
                        onClick={() => handlePartSelect(part.key)}
                        data-active={isActive}
                        className={cn(
                          'flex flex-col items-center gap-[4rem] rounded-[12rem] border px-[10rem] py-[12rem] text-[13rem] font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8E7B45] focus-visible:ring-offset-2',
                          isActive ? 'border-[#5e7a3f] bg-[#F0F6E8] text-[#2F5E25]' : 'border-[#E1D6B4] bg-white text-[#4B4628] hover:bg-d-yellow-secondary/30'
                        )}
                      >
                        <span>{part.label}</span>
                        <span className='text-[11rem] font-medium text-[#85784A]'>{partCounts[part.key]} Q&apos;s</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </BottomSheetContent>
    </BottomSheet>
  );
});
