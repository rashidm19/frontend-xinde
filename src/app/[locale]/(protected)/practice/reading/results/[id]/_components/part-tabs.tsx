'use client';

import { motion } from 'framer-motion';

import { cn } from '@/lib/utils';

type PartKey = 'part_1' | 'part_2' | 'part_3';

interface PartTabsProps {
  activePart: PartKey;
  onPartChange: (part: PartKey) => void;
  partCounts: Record<PartKey, number>;
  shouldReduceMotion: boolean;
}

const PARTS: { key: PartKey; label: string }[] = [
  { key: 'part_1', label: 'Part 1' },
  { key: 'part_2', label: 'Part 2' },
  { key: 'part_3', label: 'Part 3' },
];

export function PartTabs({ activePart, onPartChange, partCounts, shouldReduceMotion }: PartTabsProps) {
  const activeIndex = PARTS.findIndex(p => p.key === activePart);

  return (
    <div className="relative flex w-full items-center justify-between rounded-[999rem] bg-d-yellow-secondary/70 p-[4rem] tablet:w-fit tablet:gap-[4rem]">
      <motion.span
        initial={false}
        animate={{ x: `${activeIndex * 100}%` }}
        transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.22, ease: 'easeOut' }}
        className="absolute bottom-[4rem] left-[4rem] top-[4rem] w-[calc(33.333%-2.67rem)] rounded-[999rem] bg-white shadow-[0_6rem_18rem_rgba(0,0,0,0.08)]"
      />
      {PARTS.map(part => (
        <button
          key={part.key}
          type="button"
          onClick={() => onPartChange(part.key)}
          className={cn(
            'relative z-[1] flex flex-1 items-center justify-center gap-[4rem] whitespace-nowrap rounded-[999rem] px-[10rem] py-[10rem] text-[12rem] font-semibold transition tablet:gap-[6rem] tablet:px-[20rem] tablet:text-[13rem]',
            activePart === part.key ? 'text-d-black' : 'text-[#4B4628] hover:text-d-black',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8E7B45] focus-visible:ring-offset-1'
          )}
        >
          {part.label}
          <span
            className={cn(
              'rounded-[999rem] px-[6rem] py-[2rem] text-[10rem] font-semibold transition tablet:px-[8rem] tablet:text-[11rem]',
              activePart === part.key ? 'bg-[#4C7A3A] text-white' : 'bg-[#E1D6B4]/60 text-[#6F6335]'
            )}
          >
            {partCounts[part.key]}
          </span>
        </button>
      ))}
    </div>
  );
}
