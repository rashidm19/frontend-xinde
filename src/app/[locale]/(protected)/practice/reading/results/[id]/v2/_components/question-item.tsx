'use client';

import { useState } from 'react';

import { AnimatePresence, motion } from 'framer-motion';
import { Check, Minus, X } from 'lucide-react';

import { cn } from '@/lib/utils';
import type { ReadingBlockFeedback } from '@/types/PracticeReadingResultV2';
import { useMediaQuery } from 'usehooks-ts';

interface NormalizedQuestion {
  number: number;
  question: string | null;
  user_answer: string | null;
  correct_answer: string;
  correct: boolean;
  x?: number;
  y?: number;
  choices?: Array<{ choice: string; answer: string }>;
}

interface QuestionItemProps {
  question: NormalizedQuestion;
  block: ReadingBlockFeedback;
  shouldReduceMotion: boolean;
  singleOpen?: boolean;
  isExpanded?: boolean;
  onToggle?: (questionId: number | null) => void;
}

type QuestionStatus = 'correct' | 'incorrect' | 'unanswered';

const STATUS_CONFIG: Record<QuestionStatus, { bg: string; border: string; dot: string; icon: typeof Check; label: string }> = {
  correct: {
    bg: 'bg-[#E7F2DD]',
    border: 'border-[#C9E0B7]',
    dot: 'bg-[#4C7A3A]',
    icon: Check,
    label: 'Correct',
  },
  incorrect: {
    bg: 'bg-[#FFE4E2]',
    border: 'border-[#FFD3CF]',
    dot: 'bg-[#C3423F]',
    icon: X,
    label: 'Incorrect',
  },
  unanswered: {
    bg: 'bg-[#f7f3da]',
    border: 'border-[#E8DCAC]',
    dot: 'bg-[#85784A]',
    icon: Minus,
    label: 'Unanswered',
  },
};

export function QuestionItem({ question, block, shouldReduceMotion, singleOpen, isExpanded: controlledExpanded, onToggle }: QuestionItemProps) {
  const [localExpanded, setLocalExpanded] = useState(false);
  const isMobile = useMediaQuery('(max-width: 767px)');

  // Use controlled expanded state if in singleOpen mode, otherwise use local state
  const isExpanded = singleOpen ? controlledExpanded : localExpanded;

  const handleToggle = () => {
    if (singleOpen && onToggle) {
      // In single open mode, toggle controlled state
      onToggle(isExpanded ? null : question.number);
    } else {
      // In multi-open mode, toggle local state
      setLocalExpanded(prev => !prev);
    }
  };

  const status: QuestionStatus = question.user_answer === null || question.user_answer.trim() === '' ? 'unanswered' : question.correct ? 'correct' : 'incorrect';

  const config = STATUS_CONFIG[status];
  const StatusIcon = config.icon;

  const displayUserAnswer = formatAnswer(question.user_answer, block);
  const displayCorrectAnswer = formatAnswer(question.correct_answer, block);

  return (
    <motion.article
      id={`question-${question.number}`}
      layout
      className={cn('overflow-hidden rounded-[16rem] border transition', config.border, isExpanded ? config.bg : 'bg-white hover:bg-[#FDFBF3]')}
      whileHover={shouldReduceMotion ? undefined : { scale: 1.005 }}
    >
      <button
        type='button'
        onClick={handleToggle}
        className={cn(
          'flex w-full px-[16rem] py-[14rem] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#8E7B45]',
          isMobile ? 'flex-col gap-[8rem]' : 'flex-row items-center justify-between gap-[12rem]'
        )}
        aria-expanded={isExpanded}
      >
        <div className='flex items-center gap-[12rem]'>
          <span className={cn('flex size-[28rem] min-w-[28rem] items-center justify-center rounded-full text-white', config.dot)}>
            <StatusIcon className='size-[14rem] min-w-[14rem] shrink-0' />
          </span>
          <div className='flex flex-col gap-[2rem]'>
            <span className='text-[12rem] font-semibold uppercase tracking-[0.15em] text-[#85784A]'>Question {question.number}</span>
            {question.question && !Number(question.question) ? <p className='line-clamp-1 text-[14rem] text-d-black/80'>{question.question}</p> : null}
          </div>
        </div>

        <span
          className={cn(
            'rounded-[999rem] px-[12rem] py-[5rem] text-center text-[11rem] font-semibold',
            config.bg,
            status === 'correct' ? 'text-[#2F5E25]' : status === 'incorrect' ? 'text-[#9E2E2A]' : 'text-[#6F6335]',
            isMobile ? 'block w-full' : ''
          )}
        >
          {config.label}
        </span>
      </button>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={shouldReduceMotion ? undefined : { height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={shouldReduceMotion ? undefined : { height: 0, opacity: 0 }}
            transition={shouldReduceMotion ? undefined : { duration: 0.2, ease: 'easeInOut' }}
            className='overflow-hidden'
          >
            <div className='space-y-[12rem] border-t border-[#E1D6B4]/40 px-[16rem] py-[14rem]'>
              {question.question && !Number(question.question) ? (
                <div>
                  <p className='text-[11rem] font-semibold uppercase tracking-[0.15em] text-[#85784A]'>Question</p>
                  <p className='mt-[4rem] text-[14rem] leading-[1.6] text-d-black'>{question.question}</p>
                </div>
              ) : null}

              <div className='grid gap-[12rem] tablet:grid-cols-2'>
                <div
                  className={cn(
                    'rounded-[12rem] px-[14rem] py-[12rem]',
                    status === 'correct' ? 'bg-[#E7F2DD]' : status === 'incorrect' ? 'bg-[#FFE4E2]' : 'bg-[#f7f3da]'
                  )}
                >
                  <p className='text-[11rem] font-semibold uppercase tracking-[0.15em] text-[#85784A]'>Your Answer</p>
                  <p
                    className={cn(
                      'mt-[4rem] text-[15rem] font-medium',
                      status === 'correct' ? 'text-[#2F5E25]' : status === 'incorrect' ? 'text-[#9E2E2A]' : 'text-[#6F6335]'
                    )}
                  >
                    {displayUserAnswer || '—'}
                  </p>
                </div>

                <div className='rounded-[12rem] bg-[#E7F2DD] px-[14rem] py-[12rem]'>
                  <p className='text-[11rem] font-semibold uppercase tracking-[0.15em] text-[#2F5E25]/70'>Correct Answer</p>
                  <p className='mt-[4rem] text-[15rem] font-medium text-[#2F5E25]'>{displayCorrectAnswer}</p>
                </div>
              </div>

              {question.choices && question.choices.length > 0 ? (
                <div>
                  <p className='text-[11rem] font-semibold uppercase tracking-[0.15em] text-[#85784A]'>Choices</p>
                  <div className='mt-[8rem] flex flex-wrap gap-[8rem]'>
                    {question.choices.map((choice, i) => {
                      const isSelected = question.user_answer === choice.answer;
                      const isCorrect = question.correct_answer === choice.answer;
                      return (
                        <span
                          key={i}
                          className={cn(
                            'rounded-[8rem] px-[10rem] py-[6rem] text-[13rem]',
                            isCorrect
                              ? 'bg-[#E7F2DD] font-semibold text-[#2F5E25]'
                              : isSelected && !isCorrect
                                ? 'bg-[#FFE4E2] text-[#9E2E2A] line-through'
                                : 'bg-[#F3EDD3]/60 text-d-black/70'
                          )}
                        >
                          {choice.answer}. {choice.choice}
                        </span>
                      );
                    })}
                  </div>
                </div>
              ) : null}

              {status !== 'correct' && (
                <p className='text-[12rem] italic text-[#6F6335]/80'>
                  {status === 'unanswered'
                    ? 'Try to answer every question next time for better practice.'
                    : 'Review the passage to understand why this answer is correct.'}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
}

function formatAnswer(answer: string | null, block: ReadingBlockFeedback): string {
  if (!answer) return '';

  if (block.kind === 'dragdrop' || block.kind === 'dragdrop-type2' || block.kind === 'matching') {
    const choices = 'choices' in block ? block.choices : [];
    const choice = choices.find(c => c.answer === answer);
    if (choice) {
      return `${answer}. ${choice.choice}`;
    }
  }

  if (block.kind === 'checkboxes' && 'choices' in block) {
    const answers = answer.split('|');
    const labels = answers
      .map(a => {
        const choice = block.choices.find(c => c.answer === a);
        return choice ? `${a}. ${choice.choice}` : a;
      })
      .join(', ');
    return labels;
  }

  return answer;
}
