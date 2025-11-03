'use client';

import * as React from 'react';
import { motion } from 'framer-motion';

import { BottomSheet, BottomSheetContent } from '@/components/ui/bottom-sheet';
import { cn } from '@/lib/utils';

const sheetVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.18, ease: 'easeOut' } },
};

export interface PartSheetOption {
  id: string;
  label: string;
  subtitle?: string;
  description?: string;
}

export interface PartSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  options: PartSheetOption[];
  activeId: string;
  onSelect: (id: string) => void;
  title: string;
  subtitle?: string;
  closeLabel: string;
}

export const PartSheet: React.FC<PartSheetProps> = ({ open, onOpenChange, options, activeId, onSelect, title, subtitle, closeLabel }) => {
  const handleSelect = React.useCallback(
    (id: string) => {
      onSelect(id);
      onOpenChange(false);
    },
    [onSelect, onOpenChange]
  );

  return (
    <BottomSheet open={open} onOpenChange={onOpenChange}>
      <BottomSheetContent className='px-[20rem] pb-[24rem]' aria-label={title} role='dialog' aria-modal='true'>
        <div className='flex flex-col gap-[20rem]'>
          <div className='flex flex-col gap-[6rem] text-center'>
            <h2 className='mt-[8rem] text-[18rem] font-semibold text-d-black'>{title}</h2>
            {subtitle ? <p className='text-[14rem] leading-[20rem] text-d-black/70'>{subtitle}</p> : null}
          </div>

          <div className='flex max-h-[60dvh] flex-col gap-[12rem] overflow-y-auto pr-[4rem]'>
            {options.map(option => {
              const isActive = option.id === activeId;
              return (
                <motion.button
                  type='button'
                  key={option.id}
                  {...sheetVariants}
                  className={cn(
                    'flex items-center gap-[6rem] rounded-[18rem] border border-transparent bg-white px-[18rem] py-[16rem] text-left shadow-[0_12rem_32rem_rgba(56,56,56,0.08)] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-d-green/50',
                    isActive ? 'border-d-green bg-d-green/40' : 'hover:-translate-y-[1rem] hover:shadow-[0_16rem_40rem_rgba(56,56,56,0.12)]'
                  )}
                  onClick={() => handleSelect(option.id)}
                  aria-pressed={isActive}
                >
                  <span className='text-[15rem] font-semibold text-d-black'>{option.label}</span>
                  {option.subtitle ? <span className='text-[13rem] text-d-black/70'> - {option.subtitle}</span> : null}
                  {option.description ? <span className='text-[12rem] text-d-black/60'> - {option.description}</span> : null}
                </motion.button>
              );
            })}
          </div>

          <button
            type='button'
            onClick={() => onOpenChange(false)}
            className='inline-flex w-full items-center justify-center rounded-[18rem] border border-d-black/10 bg-white px-[18rem] py-[12rem] text-[14rem] font-semibold text-d-black transition hover:bg-d-green/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-d-green/50'
          >
            {closeLabel}
          </button>
        </div>
      </BottomSheetContent>
    </BottomSheet>
  );
};
