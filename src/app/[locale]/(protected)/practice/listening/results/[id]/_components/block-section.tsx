'use client';

import { useState } from 'react';

import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useMediaQuery } from 'usehooks-ts';

import type { PracticeListeningResultV2 } from '@/types/PracticeListeningResultV2';
import { cn } from '@/lib/utils';

import { QuestionItem } from './question-item';

type ListeningBlockFeedback = PracticeListeningResultV2['listening']['part_1']['blocks'][number];

interface BlockSectionProps {
  block: ListeningBlockFeedback;
  blockIndex: number;
  shouldReduceMotion: boolean;
  singleOpen?: boolean;
  expandedQuestionId?: number | null;
  onQuestionToggle?: (questionId: number | null) => void;
}

const KIND_LABELS: Record<string, string> = {
  words: 'Sentence Completion',
  test: 'Multiple Choice',
  titles: 'Title Matching',
  matching: 'Matching',
  checkboxes: 'Multiple Selection',
  table: 'Table Completion',
};

export function BlockSection({ block, blockIndex, shouldReduceMotion, singleOpen, expandedQuestionId, onQuestionToggle }: BlockSectionProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const isMobile = useMediaQuery('(max-width: 767px)');

  const kindLabel = KIND_LABELS[block.kind] || block.kind;
  const questionsRange = block.task_questions || `Questions ${blockIndex + 1}`;

  const questions = getQuestionsFromBlock(block);

  return (
    <div className='overflow-hidden rounded-[16rem] border border-[#E1D6B4] bg-white shadow-[0_12rem_32rem_-24rem_rgba(56,56,56,0.12)]'>
      {isMobile ? (
        <button
          type='button'
          onClick={() => setIsExpanded(!isExpanded)}
          className='flex w-full flex-col gap-[4rem] p-[12rem] text-left transition hover:bg-d-yellow-secondary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#8E7B45]'
          aria-expanded={isExpanded}
        >
          <div className='flex items-center justify-between rounded-[8rem] bg-[#F3EDD3] px-[10rem] py-[4rem]'>
            <span className='text-[11rem] font-semibold uppercase tracking-[0.15em] text-[#6F6335]'>{kindLabel}</span>
            <motion.span
              initial={false}
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.2 }}
              className='flex shrink-0 items-center justify-center rounded-full text-[#6F6335]'
            >
              <ChevronDown className='size-[18rem]' />
            </motion.span>
          </div>
          <span className='text-[12rem] font-medium text-d-black/50'>{questionsRange}</span>
          <p className='text-[13rem] font-medium leading-[1.6] text-d-black tablet:text-[14rem] tablet:leading-[1.5]'>{block.task}</p>
        </button>
      ) : (
        <button
          type='button'
          onClick={() => setIsExpanded(!isExpanded)}
          className='flex w-full items-center justify-between gap-[12rem] px-[20rem] py-[16rem] text-left transition hover:bg-d-yellow-secondary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#8E7B45]'
          aria-expanded={isExpanded}
        >
          <div className='flex flex-col gap-[4rem]'>
            <div className='flex flex-col gap-[4rem] tablet:flex-row tablet:items-center tablet:gap-[10rem]'>
              <span className='rounded-[8rem] bg-[#F3EDD3] px-[10rem] py-[4rem] text-[11rem] font-semibold uppercase tracking-[0.15em] text-[#6F6335]'>{kindLabel}</span>
              <span className='text-[12rem] font-medium text-d-black/50'>{questionsRange}</span>
            </div>
            <p className='text-[13rem] font-medium leading-[1.6] text-d-black tablet:text-[14rem] tablet:leading-[1.5]'>{block.task}</p>
          </div>
          <motion.span
            initial={false}
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.2 }}
            className='flex size-[32rem] shrink-0 items-center justify-center rounded-full bg-[#F3EDD3] text-[#6F6335]'
          >
            <ChevronDown className='size-[18rem]' />
          </motion.span>
        </button>
      )}

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={shouldReduceMotion ? undefined : { height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={shouldReduceMotion ? undefined : { height: 0, opacity: 0 }}
            transition={shouldReduceMotion ? undefined : { duration: 0.25, ease: 'easeInOut' }}
            className='overflow-hidden'
          >
            <div className={cn('border-t border-[#E1D6B4]/60', isMobile ? 'p-[12rem]' : 'px-[20rem] py-[16rem]')}>
              {block.hint ? (
                <div className='mb-[16rem] rounded-[12rem] bg-[#f7f3da]/60 px-[14rem] py-[12rem]'>
                  <p className='text-[12rem] font-medium text-[#6F6335]'>Hint / Options:</p>
                  <p className='mt-[4rem] whitespace-pre-line text-[13rem] text-d-black/70'>{block.hint}</p>
                </div>
              ) : null}

              {block.text && block.text.trim() && (
                <div className='mb-[16rem] rounded-[12rem] bg-[#f7f3da]/40 px-[14rem] py-[12rem]'>
                  <p className='text-[12rem] font-medium text-[#6F6335]'>Question Text:</p>
                  <p className='mt-[6rem] whitespace-pre-line text-[14rem] leading-[1.7] text-d-black/80'>{block.text}</p>
                </div>
              )}

              {/* Render choices for titles/matching/checkboxes blocks */}
              {(block.kind === 'titles' || block.kind === 'matching' || block.kind === 'checkboxes') && 'choices' in block && block.choices.length > 0 && (
                <div className='mb-[16rem] rounded-[12rem] bg-[#f7f3da]/60 px-[14rem] py-[12rem]'>
                  <p className='text-[12rem] font-medium text-[#6F6335]'>{'choices_label' in block ? block.choices_label : 'Options'}:</p>
                  <div className='mt-[8rem] flex flex-wrap gap-[6rem]'>
                    {block.choices.map((choice, i) => (
                      <span key={i} className='rounded-[8rem] bg-white px-[10rem] py-[6rem] text-[13rem] text-d-black/70 shadow-sm'>
                        {choice.answer}. {choice.choice}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Render table structure for table blocks */}
              {block.kind === 'table' && 'cells' in block && block.cells.length > 0 && (
                <div className='mb-[16rem] overflow-x-auto rounded-[12rem] bg-[#f7f3da]/60 p-[14rem]'>
                  <p className='mb-[8rem] text-[12rem] font-medium text-[#6F6335]'>Table Structure:</p>
                  <table className='w-full border-collapse text-[13rem]'>
                    <tbody>
                      {block.cells.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                          {row.map((cell, cellIndex) => (
                            <td key={cellIndex} className='border border-[#E1D6B4]/60 bg-white px-[10rem] py-[8rem] text-d-black/80'>
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className='space-y-[12rem]'>
                {questions.map((question, qIndex) => (
                  <QuestionItem
                    key={`q-${question.number}-${qIndex}`}
                    question={question}
                    block={block}
                    shouldReduceMotion={shouldReduceMotion}
                    singleOpen={singleOpen}
                    isExpanded={expandedQuestionId === question.number}
                    onToggle={onQuestionToggle}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface NormalizedQuestion {
  number: number;
  question: string | null;
  hint: string | null;
  user_answer: string | null;
  correct_answer: string;
  correct: boolean;
  x?: number;
  y?: number;
  choices?: Array<{ choice: string; answer: string }>;
  picture?: string | null;
}

function getQuestionsFromBlock(block: ListeningBlockFeedback): NormalizedQuestion[] {
  switch (block.kind) {
    case 'words':
      return block.questions.map(q => ({
        number: q.number,
        question: q.question,
        hint: q.hint,
        user_answer: q.user_answer,
        correct_answer: q.correct_answer,
        correct: q.correct,
      }));

    case 'test':
      return block.questions.map(q => ({
        number: q.number,
        question: q.question,
        hint: null,
        user_answer: q.user_answer,
        correct_answer: q.correct_answer,
        correct: q.correct,
        choices: q.choices ?? undefined,
        picture: q.picture,
      }));

    case 'titles':
    case 'matching':
      return block.answers.map(a => ({
        number: a.number,
        question: a.question,
        hint: null,
        user_answer: a.user_answer,
        correct_answer: a.correct_answer,
        correct: a.correct,
      }));

    case 'checkboxes':
      return block.answers.map(a => ({
        number: a.number,
        question: null,
        hint: null,
        user_answer: a.user_answer,
        correct_answer: a.correct_answer,
        correct: a.correct,
      }));

    case 'table':
      return block.questions.map(q => ({
        number: q.number,
        question: null,
        hint: null,
        user_answer: q.user_answer,
        correct_answer: q.correct_answer,
        correct: q.correct,
        x: q.x,
        y: q.y,
      }));

    default:
      return [];
  }
}
