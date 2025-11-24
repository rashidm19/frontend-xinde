'use client';

import Link from 'next/link';
import { type MouseEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { motion, useReducedMotion } from 'framer-motion';
import { CircleHelp, Table } from 'lucide-react';
import { useMediaQuery } from 'usehooks-ts';
import { withHydrationGuard } from '@/hooks/useHasMounted';

import type { BandMappingEntry } from '@/components/answer-sheets';
import { DEFAULT_BAND_MAPPING } from '@/components/answer-sheets';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { PracticeReadingResult } from '@/types/PracticeReading';
import { BackToTopButton } from '@/app/[locale]/(protected)/practice/writing/feedback/[id]/_components/back-to-top-button';

import { AnswerTilesGrid } from './answers-overview-grid';
import { FilterPillsBar } from './filter-bar';
import { ReadingBandMappingModal } from './reading-band-mapping-modal';
import { ReadingFiltersSheet } from './reading-filters-sheet';
import { ReadingCtaCard } from './reading-cta-card';
import { ReadingDetailedReview, type ReadingDetailedReviewHandle } from './detailed-review';
import { ReadingMistakesModal } from './reading-mistakes-modal';
import type { NormalizedReadingQuestion, ReadingFilterKey } from './question-types';
import { ReadingSummaryCard } from './reading-summary-card';
import { WritingFeedbackHeader } from '@/components/practice/WritingFeedbackHeader';
import { MobileHeader } from '@/components/practice/reading/mobile/MobileHeader';

interface ReadingMeta {
  testName?: string | null;
  takenAt?: string | null;
  elapsedMinutes?: number | null;
}

interface ReadingAnswerSheetProps {
  data: PracticeReadingResult;
  locale: string;
  meta?: ReadingMeta | null;
  bandMapping?: BandMappingEntry[];
  onRetry?: () => void;
}

const MOBILE_FILTER_LABELS: Record<ReadingFilterKey, string> = {
  all: 'All',
  correct: 'Correct',
  incorrect: 'Incorrect',
  unanswered: 'Unanswered',
};

function ReadingAnswerSheetComponent({ data, locale, meta, bandMapping, onRetry }: ReadingAnswerSheetProps) {
  const shouldReduceMotion = useReducedMotion() ?? false;
  const isMobile = useMediaQuery('(max-width: 767px)');

  const [activeFilter, setActiveFilter] = useState<ReadingFilterKey>('all');
  const [activeMobileTab, setActiveMobileTab] = useState<'overview' | 'detailed'>('overview');
  const [mistakesOpen, setMistakesOpen] = useState(false);
  const [bandModalOpen, setBandModalOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [pendingFocus, setPendingFocus] = useState<number | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const mobileTabIndex = activeMobileTab === 'overview' ? 0 : 1;

  const detailedRef = useRef<ReadingDetailedReviewHandle>(null);

  const total = data.questions.length;

  const normalizedQuestions = useMemo<NormalizedReadingQuestion[]>(() => {
    return data.questions.map((question, index) => {
      const answer = typeof question.answer === 'string' && question.answer.trim().length > 0 ? question.answer.trim() : null;
      const status: NormalizedReadingQuestion['status'] = answer ? (question.correct ? 'correct' : 'incorrect') : 'unanswered';
      return {
        number: index + 1,
        status,
        answer,
        correctAnswer: question.correct_answer ?? null,
        detailHint: null,
      } satisfies NormalizedReadingQuestion;
    });
  }, [data.questions]);

  const filterCounts = useMemo(() => {
    return {
      all: normalizedQuestions.length,
      correct: normalizedQuestions.filter(question => question.status === 'correct').length,
      incorrect: normalizedQuestions.filter(question => question.status === 'incorrect').length,
      unanswered: normalizedQuestions.filter(question => question.status === 'unanswered').length,
    } satisfies Record<ReadingFilterKey, number>;
  }, [normalizedQuestions]);

  const correctCount = useMemo(() => {
    if (typeof data.correct_answers_count === 'number') {
      return data.correct_answers_count;
    }
    return filterCounts.correct;
  }, [data.correct_answers_count, filterCounts.correct]);

  const hasAnyAnswers = filterCounts.correct + filterCounts.incorrect > 0;

  const mistakeQuestions = useMemo(() => normalizedQuestions.filter(question => question.status !== 'correct'), [normalizedQuestions]);

  const effectiveBandMapping = useMemo(() => (bandMapping?.length ? bandMapping : DEFAULT_BAND_MAPPING), [bandMapping]);

  const activeFilterLabel = useMemo(() => MOBILE_FILTER_LABELS[activeFilter], [activeFilter]);

  useEffect(() => {
    if (!isMobile) {
      setActiveMobileTab('overview');
    }
  }, [isMobile]);

  useEffect(() => {
    if (pendingFocus === null) {
      return;
    }

    if (isMobile && activeMobileTab !== 'detailed') {
      return;
    }

    const questionNumber = pendingFocus;
    setPendingFocus(null);

    requestAnimationFrame(() => {
      detailedRef.current?.focusQuestion(questionNumber);
    });
  }, [pendingFocus, activeMobileTab, isMobile]);

  useEffect(() => {
    const handleScroll = () => {
      if (typeof window === 'undefined') {
        return;
      }
      setShowScrollTop(window.scrollY > 300);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const focusQuestion = useCallback(
    (questionNumber: number) => {
      if (isMobile) {
        setActiveMobileTab('detailed');
        setPendingFocus(questionNumber);
        return;
      }
      detailedRef.current?.focusQuestion(questionNumber);
    },
    [isMobile]
  );

  const completedAt = useMemo(() => meta?.takenAt ?? data.completed_at ?? null, [data.completed_at, meta?.takenAt]);
  const testTitle = useMemo(() => data.title ?? meta?.testName ?? null, [data.title, meta?.testName]);

  const startNewHref = `/${locale}/practice/reading/rules`;

  const handleStartNew = useCallback(
    (event?: MouseEvent<HTMLAnchorElement>) => {
      if (!onRetry) {
        return;
      }
      if (event) {
        event.preventDefault();
      }
      onRetry();
    },
    [onRetry]
  );

  const handleMobileTabChange = useCallback((value: 'overview' | 'detailed') => {
    setActiveMobileTab(value);
  }, []);

  const closeAllSheets = useCallback(() => {
    setMistakesOpen(false);
    setBandModalOpen(false);
    setFiltersOpen(false);
  }, []);

  const handleFilterSelect = useCallback((value: ReadingFilterKey, closeSheet = false) => {
    setActiveFilter(value);
    if (closeSheet) {
      setFiltersOpen(false);
    }
  }, []);

  const handleScrollTop = useCallback(() => {
    if (typeof window === 'undefined') {
      return;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className='relative min-h-screen bg-[#FFFDF0]'>
      <div className='hidden tablet:block'>
        <WritingFeedbackHeader title='Reading Answer Sheet' />
      </div>
      <MobileHeader title='Reading Practice' tag='Answer Sheet' exitLabel='Exit' closeAs='link' closeHref='/profile' variant='reading' />

      <main className='mx-auto w-full max-w-[1180rem] space-y-[28rem] px-[20rem] pb-[96rem] pt-[24rem] tablet:space-y-[40rem] tablet:px-[48rem] tablet:pt-[48rem] desktop:px-[64rem] desktop:pt-[56rem]'>
        <ReadingSummaryCard correctCount={correctCount} totalCount={total} testTitle={testTitle} completedAt={completedAt} shouldReduceMotion={shouldReduceMotion} />

        <section className='space-y-[24rem] rounded-[32rem] border border-[#E1D6B4] bg-white px-[24rem] py-[28rem] shadow-[0_18rem_48rem_-30rem_rgba(56,56,56,0.18)]'>
          <header className='flex flex-col gap-[6rem] text-d-black tablet:flex-row tablet:items-center tablet:justify-between'>
            <div className='flex flex-col gap-[4rem]'>
              <span className='text-[12rem] font-semibold uppercase tracking-[0.24em] text-[#85784A]'>Answers overview</span>
              <h2 className='text-[18rem] font-semibold'>Quick scan</h2>
            </div>
            <p className='text-[13rem] text-d-black/70'>Tap a tile to jump into the detailed review below.</p>
          </header>

          {isMobile ? (
            <Tabs value={activeMobileTab} onValueChange={value => handleMobileTabChange(value as 'overview' | 'detailed')}>
              <div className='flex items-center justify-between gap-[12rem]'>
                <div className='relative flex w-full max-w-[260rem] items-center justify-between rounded-[999rem] bg-d-yellow-secondary/70 p-[4rem]'>
                  <motion.span
                    initial={false}
                    animate={{ x: `${mobileTabIndex * 100}%` }}
                    transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.22, ease: 'easeOut' }}
                    className='absolute bottom-[4rem] top-[4rem] w-1/2 rounded-[999rem] bg-white shadow-[0_6rem_18rem_rgba(0,0,0,0.08)]'
                  />
                  <TabsList className='relative z-[1] flex w-full items-center justify-between rounded-[999rem] bg-transparent'>
                    <TabsTrigger
                      value='overview'
                      className='w-1/2 rounded-[999rem] px-[16rem] py-[8rem] text-[13rem] font-semibold text-[#4B4628] transition data-[state=active]:text-d-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8E7B45] focus-visible:ring-offset-1'
                    >
                      Overview
                    </TabsTrigger>
                    <TabsTrigger
                      value='detailed'
                      className='w-1/2 rounded-[999rem] px-[16rem] py-[8rem] text-[13rem] font-semibold text-[#4B4628] transition data-[state=active]:text-d-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8E7B45] focus-visible:ring-offset-1'
                    >
                      Detailed
                    </TabsTrigger>
                  </TabsList>
                </div>
                <button
                  type='button'
                  onClick={() => {
                    closeAllSheets();
                    setFiltersOpen(true);
                  }}
                  aria-haspopup='dialog'
                  aria-expanded={filtersOpen}
                  className='inline-flex shrink-0 items-center gap-[6rem] rounded-[999rem] border border-[#E1D6B4] px-[14rem] py-[8rem] text-[12rem] font-semibold text-[#4B4628] transition hover:bg-d-yellow-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8E7B45] focus-visible:ring-offset-2 tablet:hidden'
                >
                  Filters
                  <span className='rounded-[999rem] bg-[#F5ECCC] px-[8rem] py-[2rem] text-[11rem] font-semibold text-[#6F6335]'>{filterCounts?.[activeFilter] || 0}</span>
                </button>
              </div>

              <div className='mt-[16rem] rounded-[24rem] border border-[#E1D6B4]/60 bg-d-yellow-secondary/20 px-[12rem] py-[16rem]'>
                {activeMobileTab === 'overview' ? (
                  <div className='flex flex-col gap-[12rem]'>
                    <span className='inline-flex w-fit items-center gap-[6rem] rounded-[999rem] bg-white px-[12rem] py-[6rem] text-[12rem] font-semibold uppercase tracking-[0.18em] text-[#6F6335]'>
                      Showing {activeFilterLabel}
                    </span>
                    <AnswerTilesGrid
                      questions={normalizedQuestions}
                      activeFilter={activeFilter}
                      onQuestionSelect={focusQuestion}
                      shouldReduceMotion={shouldReduceMotion}
                    />
                  </div>
                ) : (
                  <div className='flex flex-col gap-[12rem]'>
                    <ReadingDetailedReview
                      ref={detailedRef}
                      questions={normalizedQuestions}
                      activeFilter={activeFilter}
                      shouldReduceMotion={shouldReduceMotion}
                      singleOpen
                    />
                  </div>
                )}
              </div>
            </Tabs>
          ) : (
            <AnswerTilesGrid questions={normalizedQuestions} activeFilter={activeFilter} onQuestionSelect={focusQuestion} shouldReduceMotion={shouldReduceMotion} />
          )}
        </section>

        {!isMobile ? <FilterPillsBar counts={filterCounts} activeFilter={activeFilter} onChange={handleFilterSelect} shouldReduceMotion={shouldReduceMotion} /> : null}

        {!isMobile ? (
          <section className='space-y-[24rem] rounded-[32rem] border border-[#E1D6B4] bg-white px-[24rem] py-[28rem] shadow-[0_18rem_48rem_-30rem_rgba(56,56,56,0.16)]'>
            <header className='flex flex-col gap-[4rem] text-d-black tablet:flex-row tablet:items-center tablet:justify-between'>
              <div className='flex flex-col gap-[4rem]'>
                <span className='text-[12rem] font-semibold uppercase tracking-[0.24em] text-[#85784A]'>Detailed review</span>
                <h2 className='text-[18rem] font-semibold'>Tap a question to see both answers</h2>
              </div>
              <p className='text-[13rem] text-d-black/70'>Filters above control which questions appear here.</p>
            </header>
            <ReadingDetailedReview
              ref={detailedRef}
              questions={normalizedQuestions}
              activeFilter={activeFilter}
              shouldReduceMotion={shouldReduceMotion}
              singleOpen={false}
            />
          </section>
        ) : null}

        <section className='grid gap-[16rem] tablet:grid-cols-2 tablet:gap-[20rem]'>
          <div className='flex flex-col gap-[10rem] rounded-[24rem] border border-[#F3B3B1] bg-[#FFF6F5] px-[16rem] py-[18rem] text-d-black shadow-[0_14rem_32rem_-24rem_rgba(209,47,58,0.25)] tablet:gap-[12rem] tablet:rounded-[30rem] tablet:px-[24rem] tablet:py-[24rem] tablet:shadow-[0_18rem_42rem_-28rem_rgba(209,47,58,0.25)]'>
            <div className='flex items-start gap-[12rem]'>
              <span className='mt-[2rem] inline-flex size-[24rem] min-w-[24rem] items-center justify-center rounded-full bg-[#FCE0DF] text-[#D12F3A]'>
                <CircleHelp className='size-[14rem]' aria-hidden='true' />
              </span>
              <div className='flex flex-col gap-[4rem]'>
                <h3 className='text-[15rem] font-semibold'>Review mistakes only</h3>
                <p className='text-[12rem] text-d-black/70 tablet:text-[13rem]'>Open a focused view of incorrect and unanswered questions.</p>
              </div>
            </div>
            <button
              type='button'
              onClick={() => {
                closeAllSheets();
                setMistakesOpen(true);
              }}
              className='w-full rounded-[999rem] bg-[#4C7A3A] px-[16rem] py-[8rem] text-[12rem] font-semibold text-white shadow-[0_10rem_26rem_-20rem_rgba(76,122,58,0.4)] transition hover:bg-[#3C612E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2F5E25] focus-visible:ring-offset-2 tablet:w-auto tablet:px-[18rem] tablet:py-[10rem] tablet:text-[13rem] tablet:shadow-[0_12rem_30rem_-20rem_rgba(76,122,58,0.45)]'
            >
              Open mistake review
            </button>
          </div>

          <div className='flex flex-col gap-[10rem] rounded-[24rem] border border-[#E1D6B4] bg-white px-[16rem] py-[18rem] text-d-black shadow-[0_12rem_28rem_-24rem_rgba(56,56,56,0.14)] tablet:gap-[12rem] tablet:rounded-[30rem] tablet:px-[24rem] tablet:py-[24rem] tablet:shadow-[0_12rem_32rem_-28rem_rgba(56,56,56,0.14)]'>
            <div className='flex items-start gap-[12rem]'>
              <span className='mt-[2rem] inline-flex size-[24rem] min-w-[24rem] items-center justify-center rounded-full bg-[#F3EDD3] text-[#8A7E56]'>
                <Table className='size-[14rem]' aria-hidden='true' />
              </span>
              <div className='flex flex-col gap-[4rem]'>
                <h3 className='text-[15rem] font-semibold'>View band mapping</h3>
                <p className='text-[12rem] text-d-black/70 tablet:text-[13rem]'>See how your score aligns with IELTS band estimates.</p>
              </div>
            </div>
            <button
              type='button'
              onClick={() => {
                closeAllSheets();
                setBandModalOpen(true);
              }}
              className='w-full rounded-[999rem] border border-[#D9CDA9] px-[16rem] py-[8rem] text-[12rem] font-semibold text-d-black transition hover:bg-d-yellow-secondary/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8E7B45] focus-visible:ring-offset-2 tablet:w-auto tablet:px-[18rem] tablet:py-[10rem] tablet:text-[13rem]'
            >
              Open band mapping
            </button>
          </div>

          <div className='tablet:col-span-2'>
            <ReadingCtaCard startNewHref={startNewHref} onStartNew={handleStartNew} shouldReduceMotion={shouldReduceMotion} />
          </div>
        </section>

        {!hasAnyAnswers ? (
          <section className='rounded-[32rem] border border-dashed border-[#E1D6B4] bg-white px-[28rem] py-[32rem] text-center text-[14rem] text-d-black/70'>
            You have not submitted answers yet. Jump back into the practice test when ready.
            <div className='mt-[16rem] flex justify-center'>
              <Link
                href={startNewHref}
                onClick={event => handleStartNew(event)}
                className='rounded-[999rem] bg-[#4C7A3A] px-[20rem] py-[10rem] text-[13rem] font-semibold text-white transition hover:bg-[#3C612E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2F5E25] focus-visible:ring-offset-2'
              >
                Resume practice
              </Link>
            </div>
          </section>
        ) : null}
      </main>

      <BackToTopButton visible={showScrollTop} onClick={handleScrollTop} variant='reading' display='all' />

      <ReadingMistakesModal
        open={mistakesOpen}
        onOpenChange={value => {
          if (!value) {
            setMistakesOpen(false);
            return;
          }
          closeAllSheets();
          setMistakesOpen(true);
        }}
        questions={mistakeQuestions}
        shouldReduceMotion={shouldReduceMotion}
        onSelectQuestion={focusQuestion}
      />

      <ReadingBandMappingModal
        open={bandModalOpen}
        onOpenChange={value => {
          if (!value) {
            setBandModalOpen(false);
            return;
          }
          closeAllSheets();
          setBandModalOpen(true);
        }}
        bandMapping={effectiveBandMapping}
        correctCount={correctCount}
        shouldReduceMotion={shouldReduceMotion}
      />

      {isMobile ? (
        <ReadingFiltersSheet
          open={filtersOpen}
          onOpenChange={value => {
            if (!value) {
              setFiltersOpen(false);
              return;
            }
            closeAllSheets();
            setFiltersOpen(true);
          }}
          counts={filterCounts}
          activeFilter={activeFilter}
          onSelect={value => handleFilterSelect(value, true)}
        />
      ) : null}
    </div>
  );
}

export function ReadingAnswerSheetSkeleton() {
  return (
    <section className='flex h-[100dvh] w-full flex-col items-center justify-center gap-[18rem] overflow-hidden bg-[#FFFDF0] px-[24rem] text-center'>
      <div className='flex items-center gap-[12rem] text-[#85784A]'>
        <span className='size-[12rem] animate-pulse rounded-full bg-[#4C7A3A]' aria-hidden='true' />
        <span className='text-[13rem] font-semibold uppercase tracking-[0.24em]'>Reading practice</span>
      </div>
      <div className='space-y-[12rem]'>
        <p className='text-[20rem] font-semibold text-d-black'>Loading your reading results…</p>
        <p className='text-[14rem] text-d-black/70'>We’re crunching the answers and preparing insights for you.</p>
      </div>
      <motion.span
        aria-hidden='true'
        className='h-[4px] w-[200rem] rounded-full bg-[#E1D6B4]/70'
        initial={{ scaleX: 0 }}
        animate={{ scaleX: [0, 0.85, 0.4, 1] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
      />
    </section>
  );
}

export function ReadingAnswerSheetError({ onRetry }: { onRetry?: () => void }) {
  return (
    <div className='flex flex-col items-center justify-center gap-[16rem] rounded-[32rem] border border-rose-200 bg-rose-50 px-[32rem] py-[40rem] text-center text-[14rem] text-rose-800'>
      Something went wrong while loading your reading results.
      {onRetry ? (
        <button
          type='button'
          onClick={onRetry}
          className='rounded-[999rem] border border-rose-200 px-[20rem] py-[10rem] text-[13rem] font-semibold text-rose-700 transition hover:bg-rose-100'
        >
          Retry
        </button>
      ) : null}
    </div>
  );
}

export const ReadingAnswerSheet = withHydrationGuard(ReadingAnswerSheetComponent);
