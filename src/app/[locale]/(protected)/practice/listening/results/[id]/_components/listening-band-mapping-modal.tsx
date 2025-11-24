'use client';

import { useMemo } from 'react';

import { AnimatePresence, motion } from 'framer-motion';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { useMediaQuery } from 'usehooks-ts';
import { withHydrationGuard } from '@/hooks/useHasMounted';

import { cn } from '@/lib/utils';

import { BottomSheet, BottomSheetClose, BottomSheetContent } from '@/components/ui/bottom-sheet';

import type { BandMappingEntry } from '@/components/answer-sheets';

interface ListeningBandMappingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bandMapping: BandMappingEntry[];
  correctCount: number;
  shouldReduceMotion: boolean;
}

function ListeningBandMappingModalComponent({ open, onOpenChange, bandMapping, correctCount, shouldReduceMotion }: ListeningBandMappingModalProps) {
  const highlightedRange = useMemo(() => bandMapping.find(entry => correctCount >= entry.minCorrect && correctCount <= entry.maxCorrect) ?? null, [bandMapping, correctCount]);
  const isMobile = useMediaQuery('(max-width: 767px)');

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
                    initial={shouldReduceMotion ? undefined : { y: 40, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={shouldReduceMotion ? undefined : { y: 40, opacity: 0 }}
                    transition={shouldReduceMotion ? undefined : { duration: 0.3, ease: 'easeOut' }}
                    className='relative w-full max-w-[720rem] overflow-hidden rounded-t-[32rem] border border-[#CFE7D5] bg-white shadow-[0_32rem_80rem_-42rem_rgba(15,23,42,0.22)] tablet:max-w-[880rem] tablet:rounded-[32rem]'
                  >
                    <header className='flex items-center justify-between gap-[12rem] border-b border-[#CFE7D5] bg-[#EAF8F0] px-[24rem] py-[18rem]'>
                      <div className='flex flex-col gap-[4rem]'>
                        <DialogPrimitive.Title className='text-[18rem] font-semibold text-[#0F3A2E]'>Listening band mapping</DialogPrimitive.Title>
                        <DialogPrimitive.Description className='text-[13rem] text-[#1E5A45]/80'>Understand how your correct answers translate into an estimated IELTS band.</DialogPrimitive.Description>
                      </div>
                      <DialogPrimitive.Close asChild>
                        <button
                          type='button'
                          className='inline-flex size-[34rem] items-center justify-center rounded-full border border-[#CFE7D5] bg-white text-[#2F8F68] transition hover:bg-[#EAF8F0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2F8F68] focus-visible:ring-offset-2'
                          aria-label='Close band mapping'
                        >
                          <X className='size-[18rem]' aria-hidden='true' />
                        </button>
                      </DialogPrimitive.Close>
                    </header>

                    <div className='relative max-h-[70vh] overflow-hidden'>
                      <div className='pointer-events-none absolute inset-x-0 top-0 h-[28rem] bg-gradient-to-b from-white via-white/80 to-transparent' aria-hidden='true' />
                      <div className='pointer-events-none absolute inset-x-0 bottom-0 h-[28rem] bg-gradient-to-t from-white via-white/80 to-transparent' aria-hidden='true' />
                      <div className='max-h-[70vh] overflow-y-auto px-[24rem] py-[24rem] scrollbar-thin scrollbar-thumb-[#CFE7D5]'>
                        <table className='w-full table-auto border-separate border-spacing-y-[8rem] text-left'>
                          <thead>
                            <tr className='text-[13rem] font-semibold uppercase tracking-[0.16em] text-[#2F8F68]'>
                              <th scope='col' className='rounded-l-[18rem] bg-[#EAF8F0] px-[18rem] py-[12rem]'>Correct answers</th>
                              <th scope='col' className='rounded-r-[18rem] bg-[#EAF8F0] px-[18rem] py-[12rem]'>Estimated band</th>
                            </tr>
                          </thead>
                          <tbody className='text-[14rem] text-[#0F3A2E]'>
                            {bandMapping.map(entry => {
                              const isActive = highlightedRange === entry;
                              const rangeLabel = entry.minCorrect === entry.maxCorrect ? `${entry.minCorrect}` : `${entry.minCorrect} – ${entry.maxCorrect}`;

                              return (
                                <tr
                                  key={`${entry.minCorrect}-${entry.maxCorrect}-${entry.estimatedBand}`}
                                  className={cn(
                                    'overflow-hidden rounded-[18rem] border border-transparent transition-all',
                                    isActive ? 'border-[#C3E8D2] bg-[#E1F7EB] shadow-[0_16rem_32rem_-28rem_rgba(47,143,104,0.28)]' : 'bg-white'
                                  )}
                                >
                                  <td className='rounded-l-[18rem] px-[18rem] py-[12rem] font-semibold'>{rangeLabel}</td>
                                  <td className='rounded-r-[18rem] px-[18rem] py-[12rem] text-[15rem] font-semibold text-[#0F3A2E]'>{entry.estimatedBand}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
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
              <span className='text-[12rem] font-semibold uppercase tracking-[0.18em] text-[#2F8F68]/80'>Performance</span>
              <h2 className='text-[18rem] font-semibold text-[#0F3A2E]'>Listening band mapping</h2>
              <p className='text-[13rem] text-[#1E5A45]/70'>Understand how your correct answers translate into an estimated IELTS band.</p>
            </div>
            <BottomSheetClose asChild>
              <button
                type='button'
                className='inline-flex size-[32rem] min-w-[32rem] items-center justify-center rounded-full border border-[#CFE7D5] bg-white text-[#2F8F68] transition hover:bg-[#EAF8F0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2F8F68] focus-visible:ring-offset-2'
                aria-label='Close band mapping'
              >
                <X className='size-[18rem]' aria-hidden='true' />
              </button>
            </BottomSheetClose>
          </header>

          <div className='relative flex min-h-0 flex-1 flex-col overflow-hidden'>
            <div className='pointer-events-none absolute inset-x-0 top-0 z-[1] h-[24rem] bg-gradient-to-b from-white via-white/80 to-transparent' aria-hidden='true' />
            <div className='pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-[24rem] bg-gradient-to-t from-white via-white/80 to-transparent' aria-hidden='true' />
            <div className='flex-1 overflow-y-auto px-[20rem] py-[24rem] scrollbar-thin scrollbar-thumb-[#CFE7D5]'>
              <table className='w-full table-auto border-separate border-spacing-y-[8rem] text-left'>
                <thead>
                  <tr className='text-[13rem] font-semibold uppercase tracking-[0.16em] text-[#2F8F68]'>
                    <th scope='col' className='rounded-l-[18rem] bg-[#EAF8F0] px-[18rem] py-[12rem]'>Correct answers</th>
                    <th scope='col' className='rounded-r-[18rem] bg-[#EAF8F0] px-[18rem] py-[12rem]'>Estimated band</th>
                  </tr>
                </thead>
                <tbody className='text-[14rem] text-[#0F3A2E]'>
                  {bandMapping.map(entry => {
                    const isActive = highlightedRange === entry;
                    const rangeLabel = entry.minCorrect === entry.maxCorrect ? `${entry.minCorrect}` : `${entry.minCorrect} – ${entry.maxCorrect}`;

                    return (
                      <tr
                        key={`${entry.minCorrect}-${entry.maxCorrect}-${entry.estimatedBand}`}
                        className={cn(
                          'overflow-hidden rounded-[18rem] border border-transparent transition-all',
                          isActive ? 'border-[#C3E8D2] bg-[#E1F7EB] shadow-[0_16rem_32rem_-28rem_rgba(47,143,104,0.28)]' : 'bg-white'
                        )}
                      >
                        <td className='rounded-l-[18rem] px-[18rem] py-[12rem] font-semibold'>{rangeLabel}</td>
                        <td className='rounded-r-[18rem] px-[18rem] py-[12rem] text-[15rem] font-semibold text-[#0F3A2E]'>{entry.estimatedBand}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </BottomSheetContent>
    </BottomSheet>
  );
}

export const ListeningBandMappingModal = withHydrationGuard(ListeningBandMappingModalComponent);
