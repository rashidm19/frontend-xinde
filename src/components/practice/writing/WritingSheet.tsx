'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { AnimatePresence, motion } from 'framer-motion';
import { BottomSheet, BottomSheetClose, BottomSheetContent } from '@/components/ui/bottom-sheet';
import { SubscriptionAccessLabel } from '@/components/SubscriptionAccessLabel';
import { useCustomTranslations } from '@/hooks/useCustomTranslations';
import { useSubscriptionGate } from '@/hooks/useSubscriptionGate';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/lib/axiosInstance';
import type { PracticeWritingListResponse } from '@/types/PracticeWriting';
import { cn } from '@/lib/utils';
import nProgress from 'nprogress';
import { useRouter } from 'next/navigation';

type WritingSheetStep = 'customize' | 'rules';

interface WritingSheetProps {
  open: boolean;
  step: WritingSheetStep;
  onRequestClose: () => void;
  onRequestStep: (step: WritingSheetStep, options?: { history?: 'push' | 'replace' }) => void;
}

interface WritingCategoryTag {
  id: string;
  name: string;
}

interface WritingCategory {
  name: string;
  tags: WritingCategoryTag[];
}

interface WritingCategoriesResponse {
  data: WritingCategory[];
}

interface MobileSelectSheetOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface MobileSelectSheetProps {
  open: boolean;
  title: string;
  options: MobileSelectSheetOption[];
  selected: string;
  onSelect: (value: string) => void;
  onClose: () => void;
  emptyLabel?: string;
}

const INTERACTIVE_TAP = { scale: 0.97 };

const MobileSelectSheet = ({ open, title, options, selected, onSelect, onClose, emptyLabel }: MobileSelectSheetProps) => (
  <BottomSheet
    open={open}
    onOpenChange={nextOpen => {
      if (!nextOpen) {
        onClose();
      }
    }}
  >
    <BottomSheetContent aria-labelledby='writing-type-sheet-title' className='max-h-[70dvh] border-none bg-transparent px-0 pb-0'>
      <div className='flex min-h-0 flex-1 flex-col overflow-hidden'>
        <header className='sticky top-0 z-[2] border-b border-slate-200 bg-white/95 px-[20rem] pb-[14rem] pt-[calc(16rem+env(safe-area-inset-top))] backdrop-blur-md'>
          <div className='flex items-center justify-between'>
            <h2 id='writing-type-sheet-title' className='text-[16rem] font-semibold leading-[120%] text-slate-900'>
              {title}
            </h2>
            <BottomSheetClose asChild>
              <button
                type='button'
                onClick={onClose}
                className='flex size-[32rem] items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-d-violet/40'
                aria-label='Close'
              >
                <img src='/images/icon_close--black.svg' alt='' className='size-[16rem]' />
              </button>
            </BottomSheetClose>
          </div>
        </header>

        <div className='flex-1 overflow-y-auto bg-white/95 px-[16rem] py-[16rem]'>
          <div className='flex flex-col gap-[10rem]'>
            {options.length === 0 ? (
              <div className='rounded-[16rem] border border-d-light-gray px-[18rem] py-[14rem] text-[14rem] font-medium text-slate-400'>{emptyLabel ?? 'No options'}</div>
            ) : (
              options.map(option => {
                const isSelected = option.value === selected;
                return (
                  <motion.button
                    key={option.value}
                    type='button'
                    disabled={option.disabled}
                    whileTap={!option.disabled ? INTERACTIVE_TAP : undefined}
                    onClick={() => {
                      if (!option.disabled) {
                        onSelect(option.value);
                      }
                    }}
                    className={cn(
                      'flex items-center justify-between rounded-[16rem] border border-slate-200 bg-white px-[18rem] py-[14rem] text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-d-violet/40',
                      option.disabled ? 'cursor-not-allowed opacity-60' : 'hover:border-slate-300 hover:bg-slate-50',
                      isSelected ? 'border-d-violet bg-d-violet-secondary/20 text-slate-900' : 'text-slate-700'
                    )}
                    aria-pressed={isSelected}
                  >
                    <span className='text-[15rem] font-medium leading-[140%]'>{option.label}</span>
                    <span
                      className={cn(
                        'flex size-[20rem] items-center justify-center rounded-full border border-slate-300 transition-colors',
                        isSelected ? 'border-d-violet bg-d-violet text-white' : 'bg-transparent'
                      )}
                      aria-hidden='true'
                    >
                      {isSelected ? <span className='size-[6rem] rounded-full bg-white' /> : null}
                    </span>
                  </motion.button>
                );
              })
            )}
          </div>
        </div>
      </div>
    </BottomSheetContent>
  </BottomSheet>
);

const LoadingSkeleton = () => (
  <div className='space-y-[12rem]'>
    <div className='h-[18rem] w-[180rem] animate-pulse rounded-[12rem] bg-slate-200/70' />
    <div className='h-[56rem] w-full animate-pulse rounded-[18rem] bg-slate-200/70' />
  </div>
);

export function WritingSheet({ open, step, onRequestClose, onRequestStep }: WritingSheetProps) {
  const router = useRouter();
  const { t: tCustomize, tImgAlts, tCommon, tActions } = useCustomTranslations('practice.writing.customize');
  const { t: tRules } = useCustomTranslations('practice.writing.rules');
  const { requireSubscription, isCheckingAccess } = useSubscriptionGate();

  const [selectedPart, setSelectedPart] = useState<1 | 2>(1);
  const [selectedType, setSelectedType] = useState<string>('random');
  const [typeSheetOpen, setTypeSheetOpen] = useState(false);
  const [isStarting, setIsStarting] = useState(false);

  useEffect(() => {
    if (!open) {
      setSelectedPart(1);
      setSelectedType('random');
      setTypeSheetOpen(false);
      setIsStarting(false);
    }
  }, [open]);

  const { data, isLoading, isError } = useQuery<WritingCategoriesResponse>({
    queryKey: ['practice-writing-categories'],
    queryFn: () => axiosInstance.get<WritingCategoriesResponse>('/practice/writing/categories').then(res => res.data),
    enabled: open,
    staleTime: 1000 * 60 * 5,
  });

  const categoriesByPart = useMemo(() => {
    if (!data) {
      return [] as WritingCategoryTag[];
    }

    return data.data.find(category => category.name === `writing_part_${selectedPart}`)?.tags ?? [];
  }, [data, selectedPart]);

  const randomType = useCallback(() => {
    if (categoriesByPart.length === 0) {
      return null;
    }

    const randomIndex = Math.floor(Math.random() * categoriesByPart.length);
    return categoriesByPart[randomIndex]?.id ?? null;
  }, [categoriesByPart]);

  const selectedTypeLabel = useMemo(() => {
    if (selectedType === 'random') {
      return tCommon('random');
    }

    const match = categoriesByPart.find(tag => String(tag.id) === selectedType);
    return match?.name ?? tCommon('random');
  }, [selectedType, categoriesByPart, tCommon]);

  const continueDisabled = isStarting || isCheckingAccess || isLoading || isError;
  const typeRowDisabled = isLoading || isError;

  const writingHeader = `${tCommon('writing')} • ${tCommon('minCount', { count: 60 })} • ${tCommon('partsCount', { count: 2 })}`;

  const handlePartSelect = useCallback((part: 1 | 2) => {
    setSelectedPart(prev => {
      if (prev !== part) {
        setSelectedType('random');
      }
      return part;
    });
  }, []);

  const handleTypePick = useCallback((value: string) => {
    setSelectedType(value);
    setTypeSheetOpen(false);
  }, []);

  const startPractice = useCallback(async () => {
    if (isStarting || isCheckingAccess || isLoading || isError) {
      return;
    }

    setIsStarting(true);

    try {
      const canStart = await requireSubscription();

      if (!canStart) {
        return;
      }

      const typeParam = selectedType === 'random' ? randomType() : selectedType;
      const params: Record<string, string | number> = {
        part: selectedPart,
      };

      if (typeParam) {
        params.tag_id = typeParam;
      }

      const response = await axiosInstance.get<PracticeWritingListResponse>('/practice/writing', {
        params,
        validateStatus: () => true,
      });

      if (response.status >= 200 && response.status < 300) {
        const payload = response.data;
        if (Array.isArray(payload.data) && payload.data.length > 0) {
          const randomIndex = Math.floor(Math.random() * payload.data.length);
          const randomWritingId = payload.data[randomIndex].writing_id;
          if (typeof window !== 'undefined') {
            window.localStorage.setItem('practiceWritingId', String(randomWritingId));
          }
          nProgress.start();
          onRequestClose();
          router.push('/practice/writing/test');
        } else {
          console.error('No available writing tasks');
        }
      }
    } finally {
      setIsStarting(false);
    }
  }, [isStarting, isCheckingAccess, isLoading, isError, requireSubscription, selectedType, randomType, selectedPart, onRequestClose, router]);

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen) {
        onRequestClose();
      }
    },
    [onRequestClose]
  );

  useEffect(() => {
    if (!open) {
      return;
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [open]);

  const stepAnnouncement = step === 'rules' ? tRules('title') : tCustomize('subtitle');

  const aboutSectionTitle = 'About the test';

  return (
    <>
      <BottomSheet open={open} onOpenChange={handleOpenChange}>
        <BottomSheetContent className='max-h-[90dvh] border-none bg-transparent px-0 pb-0'>
          <div className='flex min-h-0 flex-1 flex-col overflow-hidden rounded-t-[32rem] bg-white/95 pb-[calc(20rem+env(safe-area-inset-bottom))] shadow-[0_-18rem_36rem_-28rem_rgba(15,23,42,0.28)] backdrop-blur-lg'>
            <span className='sr-only' aria-live='polite'>
              {stepAnnouncement}
            </span>
            <header className='sticky top-0 z-[2] flex items-center justify-between gap-[12rem] border-b border-slate-200 bg-white/95 px-[20rem] pb-[16rem] pt-[calc(20rem+env(safe-area-inset-top))]'>
              <div className='flex items-center gap-[12rem]'>
                {step === 'rules' ? (
                  <button
                    type='button'
                    onClick={() => onRequestStep('customize', { history: 'replace' })}
                    className='flex size-[36rem] items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-d-violet/40'
                    aria-label='Back'
                  >
                    <img src='/images/icon_chevron--back.svg' alt='' className='size-[16rem]' />
                  </button>
                ) : null}
                <span className='flex size-[36rem] items-center justify-center rounded-full bg-d-blue-secondary/15'>
                  <img src='/images/icon_writingSection.svg' alt={tImgAlts('writing')} className='size-[20rem]' />
                </span>
                <span className='text-[15rem] font-semibold leading-[120%] text-slate-900'>{writingHeader}</span>
              </div>
              <button
                type='button'
                onClick={onRequestClose}
                className='flex size-[36rem] items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-d-violet/40'
                aria-label='Close'
              >
                <img src='/images/icon_close--black.svg' alt='' className='size-[18rem]' />
              </button>
            </header>

            <div className='flex-1 overflow-y-auto px-[20rem] py-[20rem]'>
              {step === 'customize' ? (
                <div className='flex flex-col gap-[24rem]'>
                  <div className='flex flex-col gap-[8rem]'>
                    <h1 className='text-[22rem] font-semibold leading-[120%] text-slate-900'>{tCommon('tasksSelection')}</h1>
                    <p className='text-[14rem] leading-[150%] text-slate-500'>{tCustomize('subtitle')}</p>
                  </div>

                  <section className='flex flex-col gap-[12rem]'>
                    <span className='text-[13rem] font-semibold uppercase tracking-wide text-slate-500'>{tCommon('parts')}</span>
                    <div className='grid grid-cols-2 gap-[12rem]'>
                      {[1, 2].map(part => {
                        const isSelected = selectedPart === part;
                        return (
                          <motion.button
                            key={part}
                            type='button'
                            whileTap={INTERACTIVE_TAP}
                            onClick={() => handlePartSelect(part as 1 | 2)}
                            className={cn(
                              'flex h-[52rem] items-center justify-center rounded-[18rem] border border-slate-200 text-[16rem] font-semibold transition-all',
                              isSelected
                                ? 'border-d-violet bg-d-violet-secondary/25 text-slate-900 shadow-[0_12rem_24rem_-22rem_rgba(99,106,251,0.8)]'
                                : 'bg-white text-slate-500 hover:border-slate-300 hover:text-slate-900'
                            )}
                            aria-pressed={isSelected}
                          >
                            {tCommon('partNumber', { number: part })}
                          </motion.button>
                        );
                      })}
                    </div>
                  </section>

                  <section className='flex flex-col gap-[12rem]'>
                    <span className='text-[13rem] font-semibold uppercase tracking-wide text-slate-500'>{tCommon('pleaseSelectType')}</span>
                    {isLoading ? (
                      <LoadingSkeleton />
                    ) : isError ? (
                      <div className='rounded-[16rem] border border-red-200 bg-red-50/80 px-[16rem] py-[14rem] text-[13rem] font-medium text-red-600'>
                        Failed to load types. Please try again.
                      </div>
                    ) : (
                      <motion.button
                        type='button'
                        whileTap={!typeRowDisabled ? INTERACTIVE_TAP : undefined}
                        disabled={typeRowDisabled}
                        onClick={() => {
                          if (!typeRowDisabled) {
                            setTypeSheetOpen(true);
                          }
                        }}
                        className={cn(
                          'flex items-center justify-between rounded-[18rem] border border-slate-200 bg-white px-[18rem] py-[16rem] text-left text-[16rem] font-semibold text-slate-900 transition disabled:cursor-not-allowed disabled:opacity-60',
                          typeRowDisabled ? '' : 'hover:border-slate-300 hover:bg-slate-50'
                        )}
                        aria-haspopup='dialog'
                        aria-expanded={typeSheetOpen}
                        aria-controls='writing-type-sheet-title'
                      >
                        <span>{selectedTypeLabel}</span>
                        <img src='/images/icon_chevron--down.svg' alt='' className='ml-[12rem] size-[14rem]' />
                      </motion.button>
                    )}
                  </section>
                </div>
              ) : (
                <div className='flex flex-col gap-[20rem]'>
                  <h1 className='text-[22rem] font-semibold leading-[120%] text-slate-900'>{tRules('title')}</h1>
                  <div className='flex flex-col gap-[12rem]'>
                    <CollapsibleSection id='writing-about' title={aboutSectionTitle} defaultOpen>
                      {tRules('text')}
                    </CollapsibleSection>
                    <CollapsibleSection id='writing-marking' title={tCommon('marking')}>
                      {tRules('marking')}
                    </CollapsibleSection>
                  </div>
                </div>
              )}
            </div>

            <footer className='sticky bottom-0 z-[1] border-t border-slate-200 bg-white/95 px-[20rem] pb-[calc(20rem+env(safe-area-inset-bottom))] pt-[16rem] shadow-[0_-18rem_36rem_-28rem_rgba(15,23,42,0.18)]'>
              <div className='space-y-[8rem]'>
                <motion.button
                  type='button'
                  whileTap={!continueDisabled ? INTERACTIVE_TAP : undefined}
                  disabled={continueDisabled}
                  onClick={step === 'rules' ? startPractice : () => onRequestStep('rules', { history: 'push' })}
                  className='flex h-[52rem] w-full items-center justify-center rounded-[28rem] bg-d-green text-[16rem] font-semibold transition hover:bg-d-green/90 disabled:cursor-not-allowed disabled:bg-d-gray/60 disabled:text-d-black/60'
                >
                  {isCheckingAccess || isStarting ? '...' : tActions('continue')}
                </motion.button>
                <SubscriptionAccessLabel className='text-center text-[12rem]' />
              </div>
            </footer>
          </div>
        </BottomSheetContent>
      </BottomSheet>

      <MobileSelectSheet
        open={typeSheetOpen}
        title={tCommon('pleaseSelectType')}
        options={[{ value: 'random', label: tCommon('random') }, ...categoriesByPart.map(tag => ({ value: String(tag.id), label: tag.name }))]}
        selected={selectedType}
        onSelect={handleTypePick}
        onClose={() => setTypeSheetOpen(false)}
        emptyLabel='No types available'
      />
    </>
  );
}

interface CollapsibleSectionProps {
  id: string;
  title: string;
  children: string;
  defaultOpen?: boolean;
}

const CollapsibleSection = ({ id, title, children, defaultOpen = false }: CollapsibleSectionProps) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className='rounded-[20rem] border border-slate-200 bg-white/95 shadow-[0_12rem_32rem_-28rem_rgba(15,23,42,0.28)]'>
      <motion.button
        type='button'
        aria-expanded={open}
        aria-controls={`${id}-content`}
        onClick={() => setOpen(prev => !prev)}
        whileTap={INTERACTIVE_TAP}
        className='flex w-full items-center justify-between gap-[12rem] px-[18rem] py-[16rem] text-left'
      >
        <span className='text-[16rem] font-semibold leading-[120%] text-slate-900'>{title}</span>
        <img src='/images/icon_chevron--down.svg' alt='' className={cn('size-[16rem] transition-transform duration-200', open ? 'rotate-180' : '')} />
      </motion.button>
      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            key='content'
            id={`${id}-content`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className='overflow-hidden'
          >
            <div className='px-[18rem] pb-[18rem] pr-[6rem]'>
              <p className='max-w-[520rem] whitespace-pre-line text-[14rem] leading-[160%] text-slate-600'>{children}</p>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
};
