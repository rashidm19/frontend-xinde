'use client';

import { useCallback, useMemo } from 'react';

import { AnimatePresence, motion } from 'framer-motion';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { useMediaQuery } from 'usehooks-ts';

import { cn } from '@/lib/utils';

import { BottomSheet, BottomSheetClose, BottomSheetContent } from '@/components/ui/bottom-sheet';

import type { NormalizedListeningQuestion } from './question-types';

interface ListeningMistakesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  questions: NormalizedListeningQuestion[];
  shouldReduceMotion: boolean;
  onSelectQuestion: (questionNumber: number) => void;
}

const statusLabel: Record<NormalizedListeningQuestion['status'], string> = {
  correct: 'Correct',
  incorrect: 'Incorrect',
  unanswered: 'No answer',
};

const statusTone: Record<NormalizedListeningQuestion['status'], { badge: string; text: string }> = {
  correct: { badge: 'bg-[#E1F7EB] text-[#1E5A45]', text: 'text-[#1E5A45]' },
  incorrect: { badge: 'bg-[#FFE3E2] text-[#B23B3A]', text: 'text-[#B23B3A]' },
  unanswered: { badge: 'bg-[#FFF3D9] text-[#8C7949]', text: 'text-[#8C7949]' },
};

const cardVisuals: Record<NormalizedListeningQuestion['status'], { border: string; background: string; hover: string; shadow: string }> = {
  correct: {
    border: 'border-[#C3E8D2]',
    background: 'bg-[#F3FCF7]',
    hover: 'hover:bg-[#EAF8F0]',
    shadow: 'shadow-[0_16rem_32rem_-28rem_rgba(47,143,104,0.28)]',
  },
  incorrect: {
    border: 'border-[#F6B9B7]',
    background: 'bg-[#FFF5F4]',
    hover: 'hover:bg-[#FFEDEC]',
    shadow: 'shadow-[0_16rem_32rem_-26rem_rgba(213,79,78,0.3)]',
  },
  unanswered: {
    border: 'border-[#F0E0B4]',
    background: 'bg-[#FFF9ED]',
    hover: 'hover:bg-[#FFF4E0]',
    shadow: 'shadow-[0_16rem_32rem_-28rem_rgba(178,155,95,0.25)]',
  },
};

export function ListeningMistakesModal({ open, onOpenChange, questions, shouldReduceMotion, onSelectQuestion }: ListeningMistakesModalProps) {
  const filtered = useMemo(() => questions.filter(question => question.status !== 'correct'), [questions]);
  const isMobile = useMediaQuery('(max-width: 767px)');

  const handleSelect = useCallback(
    (questionNumber: number) => {
      onOpenChange(false);
      if (typeof window === 'undefined') {
        onSelectQuestion(questionNumber);
        return;
      }
      window.setTimeout(
        () => {
          onSelectQuestion(questionNumber);
        },
        shouldReduceMotion ? 0 : 180
      );
    },
    [onOpenChange, onSelectQuestion, shouldReduceMotion]
  );

  if (!isMobile) {
    return (
      <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
        <AnimatePresence>
          {open ? (
            <DialogPrimitive.Portal forceMount>
              <DialogPrimitive.Overlay asChild>
                <motion.div
                  className='fixed inset-0 z-[2000] bg-slate-900/45 backdrop-blur-sm'
                  initial={shouldReduceMotion ? undefined : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={shouldReduceMotion ? undefined : { opacity: 0 }}
                  transition={shouldReduceMotion ? undefined : { duration: 0.24, ease: 'easeOut' }}
                />
              </DialogPrimitive.Overlay>

              <DialogPrimitive.Content asChild>
                <div className='fixed inset-0 z-[2001] flex items-end justify-center px-[12rem] py-[16rem] tablet:items-center tablet:px-[32rem] tablet:py-[40rem]'>
                  <motion.div
                    initial={shouldReduceMotion ? undefined : { y: 32, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={shouldReduceMotion ? undefined : { y: 32, opacity: 0 }}
                    transition={shouldReduceMotion ? undefined : { duration: 0.3, ease: 'easeOut' }}
                    className='relative w-full max-w-[720rem] overflow-hidden rounded-t-[32rem] border border-[#CFE7D5] bg-white shadow-[0_32rem_80rem_-40rem_rgba(15,23,42,0.22)] tablet:max-w-[820rem] tablet:rounded-[32rem]'
                  >
                    <header className='flex items-center justify-between gap-[12rem] border-b border-[#CFE7D5] bg-[#EAF8F0] px-[24rem] py-[18rem]'>
                      <div className='flex flex-col gap-[4rem]'>
                        <DialogPrimitive.Title className='text-[18rem] font-semibold text-[#0F3A2E]'>Review mistakes</DialogPrimitive.Title>
                        <DialogPrimitive.Description className='text-[13rem] text-[#1E5A45]/70'>Focus on incorrect and unanswered questions.</DialogPrimitive.Description>
                      </div>
                      <DialogPrimitive.Close asChild>
                        <button
                          type='button'
                          className='inline-flex size-[34rem] items-center justify-center rounded-full border border-[#CFE7D5] bg-white text-[#1E5A45] transition hover:bg-[#EAF8F0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2F8F68] focus-visible:ring-offset-2'
                          aria-label='Close review mistakes'
                        >
                          <X className='size-[18rem]' aria-hidden='true' />
                        </button>
                      </DialogPrimitive.Close>
                    </header>

                    <div className='relative max-h-[70vh] overflow-hidden'>
                      <div className='pointer-events-none absolute inset-x-0 top-0 h-[28rem] bg-gradient-to-b from-white via-white/80 to-transparent' aria-hidden='true' />
                      <div className='pointer-events-none absolute inset-x-0 bottom-0 h-[28rem] bg-gradient-to-t from-white via-white/80 to-transparent' aria-hidden='true' />
                      <div className='max-h-[70vh] overflow-y-auto px-[24rem] py-[24rem] scrollbar-thin scrollbar-thumb-[#CFE7D5]'>
                        {filtered.length === 0 ? (
                          <p className='rounded-[24rem] border border-dashed border-[#CFE7D5] bg-[#EAF8F0] px-[20rem] py-[32rem] text-center text-[14rem] text-[#1E5A45]/80'>
                            No mistakes to review. Complete a test to populate this space.
                          </p>
                        ) : (
                          <ul className='flex flex-col gap-[14rem]'>
                            {filtered.map(question => {
                              const visuals = cardVisuals[question.status];
                              return (
                                <li key={question.number}>
                                  <motion.button
                                    type='button'
                                    onClick={() => handleSelect(question.number)}
                                    className={cn(
                                      'flex w-full flex-col gap-[10rem] rounded-[24rem] border px-[18rem] py-[16rem] text-left text-[13rem] text-[#0F3A2E] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2F8F68] focus-visible:ring-offset-2',
                                      visuals.border,
                                      visuals.background,
                                      visuals.hover,
                                      visuals.shadow
                                    )}
                                    whileHover={shouldReduceMotion ? undefined : { y: -2 }}
                                    whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
                                  >
                                    <div className='flex items-center justify-between gap-[12rem]'>
                                      <div className='flex items-center gap-[12rem]'>
                                        <span className='rounded-[999rem] bg-[#EAF8F0] px-[10rem] py-[4rem] text-[12rem] font-semibold text-[#2F8F68]'>
                                          Q{question.number}
                                        </span>
                                        <span className={cn('rounded-[999rem] px-[10rem] py-[4rem] text-[12rem] font-semibold', statusTone[question.status].badge)}>
                                          {statusLabel[question.status]}
                                        </span>
                                      </div>
                                      <span className='text-[12rem] font-medium text-[#1E5A45]/70'>Press Enter to open</span>
                                    </div>
                                    <p className='font-semibold text-[#0F3A2E]'>Correct answer: {question.correctAnswer ?? '—'}</p>
                                    <p className='text-[#1E5A45]/80'>Your answer: {question.answer ?? (question.status === 'unanswered' ? 'No answer provided' : '—')}</p>
                                  </motion.button>
                                </li>
                              );
                            })}
                          </ul>
                        )}
                      </div>
                    </div>
                  </motion.div>
                </div>
              </DialogPrimitive.Content>
            </DialogPrimitive.Portal>
          ) : null}
        </AnimatePresence>
      </DialogPrimitive.Root>
    );
  }

  return (
    <BottomSheet open={open} onOpenChange={onOpenChange}>
      <BottomSheetContent className='flex max-h-[90dvh] flex-col border-none bg-transparent px-0 pb-0'>
        <div className='flex min-h-0 flex-1 flex-col overflow-hidden rounded-t-[28rem] bg-white/95 pb-[calc(16rem+env(safe-area-inset-bottom))] shadow-[0_-18rem_36rem_-28rem_rgba(15,23,42,0.22)] backdrop-blur-lg'>
          <header className='sticky top-0 z-[2] flex items-center justify-between gap-[12rem] border-b border-[#CFE7D5] bg-white/95 px-[20rem] py-[18rem]'>
            <div className='flex flex-col gap-[2rem] text-left'>
              <span className='text-[12rem] font-semibold uppercase tracking-[0.18em] text-[#2F8F68]/80'>Review</span>
              <h2 className='text-[18rem] font-semibold text-[#0F3A2E]'>Review mistakes</h2>
              <p className='text-[13rem] text-[#1E5A45]/70'>Focus on incorrect and unanswered questions.</p>
            </div>
            <BottomSheetClose asChild>
              <button
                type='button'
                className='inline-flex size-[32rem] min-w-[32rem] items-center justify-center rounded-full border border-[#CFE7D5] bg-white text-[#2F8F68] transition hover:bg-[#EAF8F0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2F8F68] focus-visible:ring-offset-2'
                aria-label='Close review mistakes'
              >
                <X className='size-[18rem]' aria-hidden='true' />
              </button>
            </BottomSheetClose>
          </header>

          <div className='relative flex min-h-0 flex-1 flex-col overflow-hidden'>
            <div className='pointer-events-none absolute inset-x-0 top-0 z-[1] h-[24rem] bg-gradient-to-b from-white via-white/80 to-transparent' aria-hidden='true' />
            <div className='pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-[24rem] bg-gradient-to-t from-white via-white/80 to-transparent' aria-hidden='true' />
            <div className='flex-1 overflow-y-auto px-[20rem] py-[24rem] scrollbar-thin scrollbar-thumb-[#CFE7D5]'>
              {filtered.length === 0 ? (
                <p className='rounded-[20rem] border border-dashed border-[#CFE7D5] bg-[#EAF8F0] px-[18rem] py-[28rem] text-center text-[14rem] text-[#1E5A45]/80'>
                  No mistakes to review. Complete a test to populate this space.
                </p>
              ) : (
                <ul className='flex flex-col gap-[12rem]'>
                  {filtered.map(question => {
                    const visuals = cardVisuals[question.status];
                    return (
                      <li key={question.number}>
                        <motion.button
                          type='button'
                          onClick={() => handleSelect(question.number)}
                          className={cn(
                            'flex w-full flex-col gap-[10rem] rounded-[20rem] border px-[16rem] py-[14rem] text-left text-[13rem] text-[#0F3A2E] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2F8F68] focus-visible:ring-offset-2',
                            visuals.border,
                            visuals.background,
                            visuals.hover,
                            visuals.shadow
                          )}
                          whileHover={shouldReduceMotion ? undefined : { y: -2 }}
                          whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
                        >
                          <div className='flex items-center justify-between gap-[10rem]'>
                            <div className='flex items-center gap-[10rem]'>
                              <span className='rounded-[999rem] bg-[#EAF8F0] px-[10rem] py-[4rem] text-[12rem] font-semibold text-[#2F8F68]'>
                                Q{question.number}
                              </span>
                              <span className={cn('rounded-[999rem] px-[10rem] py-[4rem] text-[12rem] font-semibold', statusTone[question.status].badge)}>
                                {statusLabel[question.status]}
                              </span>
                            </div>
                            <span className='text-[11rem] font-medium text-[#1E5A45]/70'>Tap to open</span>
                          </div>
                          <p className='font-semibold text-[#0F3A2E]'>Correct answer: {question.correctAnswer ?? '—'}</p>
                          <p className='text-[#1E5A45]/80'>Your answer: {question.answer ?? (question.status === 'unanswered' ? 'No answer provided' : '—')}</p>
                        </motion.button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </div>
      </BottomSheetContent>
    </BottomSheet>
  );
}
