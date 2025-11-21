'use client';

import { memo, type ReactNode } from 'react';

import { motion } from 'framer-motion';
import { CheckCircle2, MinusCircle, XCircle } from 'lucide-react';

import { cn } from '@/lib/utils';

import type { NormalizedReadingQuestion, ReadingFilterKey } from './question-types';

interface AnswerTilesGridProps {
  questions: NormalizedReadingQuestion[];
  activeFilter: ReadingFilterKey;
  onQuestionSelect: (questionNumber: number) => void;
  shouldReduceMotion: boolean;
}

const statusVisuals: Record<NormalizedReadingQuestion['status'], { icon: ReactNode; ring: string; hover: string; border: string; iconWrap: string; answer: string }> = {
  correct: {
    icon: <CheckCircle2 className='size-[18rem] text-[#2F6A3A]' aria-hidden='true' />,
    ring: 'focus-visible:ring-[#2F6A3A]',
    hover: 'hover:bg-[#F1F8EC]',
    border: 'border-[#C4DFB3]',
    iconWrap: 'bg-[#E6F3DD]',
    answer: 'text-[#2F5E25]',
  },
  incorrect: {
    icon: <XCircle className='size-[18rem] text-[#D12F3A]' aria-hidden='true' />,
    ring: 'focus-visible:ring-[#D12F3A]',
    hover: 'hover:bg-[#FFECEC]',
    border: 'border-[#F4B8B5]',
    iconWrap: 'bg-[#FBE4E3]',
    answer: 'text-[#A3222A]',
  },
  unanswered: {
    icon: <MinusCircle className='size-[18rem] text-[#9A8D5D]' aria-hidden='true' />,
    ring: 'focus-visible:ring-[#9A8D5D]',
    hover: 'hover:bg-[#F9F1D7]',
    border: 'border-[#E6D9B5]',
    iconWrap: 'bg-[#F6EED0]',
    answer: 'text-[#6F6540]',
  },
};

const filterPredicate: Record<ReadingFilterKey, (question: NormalizedReadingQuestion) => boolean> = {
  all: () => true,
  correct: question => question.status === 'correct',
  incorrect: question => question.status === 'incorrect',
  unanswered: question => question.status === 'unanswered',
};

export const AnswerTilesGrid = memo(function AnswerTilesGrid({ questions, activeFilter, onQuestionSelect, shouldReduceMotion }: AnswerTilesGridProps) {
  const matchesFilter = filterPredicate[activeFilter];

  return (
    <div
      className='grid gap-[12rem] tablet:gap-[14rem]'
      role='grid'
      aria-label='Answers overview'
      style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(120rem, 1fr))' }}
    >
      {questions.map(question => {
        const visuals = statusVisuals[question.status];
        const isVisible = matchesFilter(question);
        const statusText = question.status === 'unanswered' ? 'No answer' : (question.answer ?? (question.status === 'correct' ? 'Correct' : '—'));

        return (
          <motion.button
            key={question.number}
            type='button'
            role='gridcell'
            className={cn(
              'group relative flex h-[54px] items-center gap-[12rem] rounded-[18rem] border border-[#E1D6B4] bg-white px-[12rem] py-[8rem] text-left shadow-[0_12px_32px_-22px_rgba(56,56,56,0.18)] transition-all',
              'hover:shadow-[0_16px_36px_-24px_rgba(56,56,56,0.18)]',
              visuals.hover,
              visuals.ring,
              visuals.border,
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#FFF6D6]',
              isVisible ? 'opacity-100' : 'opacity-45'
            )}
            onClick={() => onQuestionSelect(question.number)}
            onKeyDown={event => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onQuestionSelect(question.number);
              }
            }}
            initial={shouldReduceMotion ? undefined : { opacity: 0, scale: 0.94 }}
            animate={shouldReduceMotion ? undefined : { opacity: isVisible ? 1 : 0.45, scale: 1 }}
            whileHover={shouldReduceMotion ? undefined : { scale: 1.02 }}
            whileTap={shouldReduceMotion ? undefined : { scale: 0.97 }}
            transition={shouldReduceMotion ? undefined : { duration: 0.24, ease: 'easeOut' }}
            aria-label={`Question ${question.number}: ${statusText}`}
          >
            <span className={cn('flex size-[32px] flex-shrink-0 items-center justify-center rounded-full', visuals.iconWrap)}>{visuals.icon}</span>
            <span className='flex min-w-0 flex-col gap-[2px]'>
              <span className='text-[12px] font-semibold uppercase tracking-[0.18em] text-[#85784A]'>Q{question.number}</span>
              <span className={cn('text-[12px] leading-[16px] text-[#5C5333]', visuals.answer, 'line-clamp-2')}>{statusText}</span>
            </span>
          </motion.button>
        );
      })}
    </div>
  );
});
