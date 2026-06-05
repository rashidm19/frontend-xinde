'use client';

import { memo } from 'react';

import { motion } from 'framer-motion';

import { cn } from '@/lib/utils';

export type QuestionStatus = 'correct' | 'incorrect' | 'unanswered';
export type FilterKey = 'all' | 'correct' | 'incorrect' | 'unanswered';

export interface MobileQuestion {
  number: number;
  status: QuestionStatus;
  partKey: 'part_1' | 'part_2' | 'part_3';
  blockIndex: number;
}

interface MobileAnswerGridProps {
  questions: MobileQuestion[];
  activeFilter: FilterKey;
  onQuestionSelect: (number: number) => void;
  shouldReduceMotion: boolean;
}

const STATUS_STYLES: Record<QuestionStatus, string> = {
  correct: 'bg-[#E7F2DD] text-[#2F5E25] border-[#C9E0B7]',
  incorrect: 'bg-[#FFE4E2] text-[#9E2E2A] border-[#FFD3CF]',
  unanswered: 'bg-[#f7f3da] text-[#6F6335] border-[#E8DCAC]',
};

const FILTER_LABELS: Record<FilterKey, string> = {
  all: 'All',
  correct: 'Correct',
  incorrect: 'Incorrect',
  unanswered: 'Unanswered',
};

const filterPredicate: Record<FilterKey, (question: MobileQuestion) => boolean> = {
  all: () => true,
  correct: question => question.status === 'correct',
  incorrect: question => question.status === 'incorrect',
  unanswered: question => question.status === 'unanswered',
};

export const MobileAnswerGrid = memo(function MobileAnswerGrid({ questions, activeFilter, onQuestionSelect, shouldReduceMotion }: MobileAnswerGridProps) {
  const matchesFilter = filterPredicate[activeFilter];

  return (
    <div className="flex flex-col gap-[12rem]">
      <span className="inline-flex w-fit items-center gap-[6rem] rounded-[999rem] bg-white px-[12rem] py-[6rem] text-[12rem] font-semibold uppercase tracking-[0.18em] text-[#6F6335]">
        Showing {FILTER_LABELS[activeFilter]}
      </span>
      <div className="grid grid-cols-8 gap-[6rem]" role="grid" aria-label="Answer overview grid">
        {questions.map((q, idx) => {
          const isVisible = matchesFilter(q);

          return (
            <motion.button
              key={q.number}
              type="button"
              role="gridcell"
              onClick={() => onQuestionSelect(q.number)}
              initial={shouldReduceMotion ? undefined : { opacity: 0, scale: 0.9 }}
              animate={shouldReduceMotion ? undefined : { opacity: isVisible ? 1 : 0.4, scale: 1 }}
              transition={shouldReduceMotion ? undefined : { duration: 0.2, delay: idx * 0.015 }}
              whileTap={shouldReduceMotion ? undefined : { scale: 0.95 }}
              className={cn(
                'flex size-[33.35rem] items-center justify-center rounded-[10rem] border text-[12rem] font-semibold transition',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8E7B45]',
                STATUS_STYLES[q.status],
                !isVisible && 'opacity-40'
              )}
              aria-label={`Question ${q.number}, ${q.status}`}
            >
              {q.number}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
});
