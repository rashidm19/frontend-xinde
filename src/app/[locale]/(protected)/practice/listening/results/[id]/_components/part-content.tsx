'use client';

import type { PracticeListeningResultV2 } from '@/types/PracticeListeningResultV2';

import { BlockSection } from './block-section';

type PartKey = 'part_1' | 'part_2' | 'part_3' | 'part_4';
type ListeningPartFeedback = PracticeListeningResultV2['listening']['part_1'];

interface PartContentProps {
  part: ListeningPartFeedback;
  partKey: PartKey;
  shouldReduceMotion: boolean;
  singleOpen?: boolean;
  expandedQuestionId?: number | null;
  onQuestionToggle?: (questionId: number | null) => void;
}

export function PartContent({ part, partKey, shouldReduceMotion, singleOpen = false, expandedQuestionId, onQuestionToggle }: PartContentProps) {
  // Get task from first block if available
  const firstBlockTask = part.blocks[0]?.task;

  return (
    <div className='space-y-[20rem]'>
      {firstBlockTask && (
        <div className='rounded-[20rem] border border-[#E1D6B4]/60 bg-d-yellow-secondary/70 px-[16rem] py-[14rem]'>
          <p className='text-[13rem] leading-[1.6] text-d-black/80'>{firstBlockTask}</p>
        </div>
      )}

      <div className='space-y-[16rem]'>
        {part.blocks.map((block, index) => (
          <BlockSection
            key={`${partKey}-block-${index}`}
            block={block}
            blockIndex={index}
            shouldReduceMotion={shouldReduceMotion}
            singleOpen={singleOpen}
            expandedQuestionId={expandedQuestionId}
            onQuestionToggle={onQuestionToggle}
          />
        ))}
      </div>
    </div>
  );
}
