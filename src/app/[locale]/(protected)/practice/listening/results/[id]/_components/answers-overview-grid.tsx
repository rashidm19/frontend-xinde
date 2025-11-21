'use client';

import { memo, type ReactNode } from 'react';

import { motion } from 'framer-motion';
import { CheckCircle2, MinusCircle, XCircle } from 'lucide-react';

import { cn } from '@/lib/utils';

import type { ListeningFilterKey, NormalizedListeningQuestion } from './question-types';

interface AnswerTilesGridProps {
  questions: NormalizedListeningQuestion[];
  activeFilter: ListeningFilterKey;
  onQuestionSelect: (questionNumber: number) => void;
  shouldReduceMotion: boolean;
}

const statusVisuals: Record<NormalizedListeningQuestion['status'], { icon: ReactNode; ring: string; hover: string; border: string; iconWrap: string; answer: string }> = {
  correct: {
    icon: <CheckCircle2 className='size-[18rem] text-[#2F8F68]' aria-hidden='true' />,
    ring: 'focus-visible:ring-[#2F8F68]',
    hover: 'hover:bg-[#F0FFF7]',
    border: 'border-[#C3E8D2]',
    iconWrap: 'bg-[#E1F7EB]',
    answer: 'text-[#1E5A45]',
  },
  incorrect: {
    icon: <XCircle className='size-[18rem] text-[#D54F4E]' aria-hidden='true' />,
    ring: 'focus-visible:ring-[#D54F4E]',
    hover: 'hover:bg-[#FFF1F0]',
    border: 'border-[#F6B9B7]',
    iconWrap: 'bg-[#FFE3E2]',
    answer: 'text-[#B23B3A]',
  },
  unanswered: {
    icon: <MinusCircle className='size-[18rem] text-[#B29B5F]' aria-hidden='true' />,
    ring: 'focus-visible:ring-[#B29B5F]',
    hover: 'hover:bg-[#FFF8EA]',
    border: 'border-[#ECDDB3]',
    iconWrap: 'bg-[#FAF1D8]',
    answer: 'text-[#8C7949]',
  },
};

const filterPredicate: Record<ListeningFilterKey, (question: NormalizedListeningQuestion) => boolean> = {
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
        const statusText = question.status === 'unanswered' ? 'No answer' : question.answer ?? (question.status === 'correct' ? 'Correct' : '—');

        return (
          <motion.button
            key={question.number}
            type='button'
            role='gridcell'
            className={cn(
              'group relative flex h-[54px] items-center gap-[12rem] rounded-[18rem] border border-[#CFE7D5] bg-white px-[12rem] py-[8rem] text-left shadow-[0_12px_32px_-22px_rgba(47,143,104,0.18)] transition-all',
              'hover:shadow-[0_16px_36px_-24px_rgba(47,143,104,0.2)]',
              visuals.hover,
              visuals.ring,
              visuals.border,
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#F4FFF6]',
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
              <span className='text-[12px] font-semibold uppercase tracking-[0.18em] text-[#2F8F68]/90'>Q{question.number}</span>
              <span className={cn('text-[12px] leading-[16px] text-[#1E5A45]', visuals.answer, 'line-clamp-2')}>{statusText}</span>
            </span>
          </motion.button>
        );
      })}
    </div>
  );
});
