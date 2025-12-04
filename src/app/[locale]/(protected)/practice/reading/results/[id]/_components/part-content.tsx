'use client';

import { useState } from 'react';
import { BookOpen } from 'lucide-react';
import type { ReadingPartFeedback } from '@/types/PracticeReadingResultV2';

import { BlockSection } from './block-section';
import { PassageModal } from './passage-modal';

type PartKey = 'part_1' | 'part_2' | 'part_3';

interface PartContentProps {
  part: ReadingPartFeedback;
  partKey: PartKey;
  shouldReduceMotion: boolean;
  singleOpen?: boolean;
  expandedQuestionId?: number | null;
  onQuestionToggle?: (questionId: number | null) => void;
}

export function PartContent({ part, partKey, shouldReduceMotion, singleOpen = false, expandedQuestionId, onQuestionToggle }: PartContentProps) {
  const [passageOpen, setPassageOpen] = useState(false);

  return (
    <div className="space-y-[20rem]">
      <div className="rounded-[20rem] border border-[#E1D6B4]/60 bg-d-yellow-secondary/30 px-[16rem] py-[14rem]">
        <div className="flex flex-col gap-[12rem] tablet:flex-row tablet:items-center tablet:justify-between">
          <p className="flex-1 text-[13rem] leading-[1.6] text-d-black/80">{part.task}</p>
          {part.text && part.text.trim() && (
            <button
              type="button"
              onClick={() => setPassageOpen(true)}
              className="inline-flex w-full items-center justify-center gap-[6rem] rounded-[999rem] bg-[#4C7A3A] px-[14rem] py-[10rem] text-[12rem] font-semibold text-white shadow-[0_8rem_20rem_-12rem_rgba(76,122,58,0.4)] transition hover:bg-[#3C612E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2F5E25] focus-visible:ring-offset-2 tablet:w-auto tablet:py-[8rem]"
            >
              <BookOpen className="size-[14rem]" />
              View Passage
            </button>
          )}
        </div>
      </div>

      <div className="space-y-[16rem]">
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

      <PassageModal
        open={passageOpen}
        onOpenChange={setPassageOpen}
        title="Reading Passage"
        text={part.text}
        picture={part.picture}
      />
    </div>
  );
}
