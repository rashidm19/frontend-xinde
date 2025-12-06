'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { motion, useReducedMotion } from 'framer-motion';
import { Menu } from 'lucide-react';
import { useMediaQuery } from 'usehooks-ts';

import { withHydrationGuard } from '@/hooks/useHasMounted';
import type { PracticeListeningResultV2 } from '@/types/PracticeListeningResultV2';
import { WritingFeedbackHeader } from '@/components/practice/WritingFeedbackHeader';
import { MobileHeader } from '@/components/practice/reading/mobile/MobileHeader';
import { BackToTopButton } from '@/app/[locale]/(protected)/practice/writing/feedback/[id]/_components/back-to-top-button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

import { ScoreSummaryCard } from './score-summary-card';
import { AudioPlayer } from './audio-player';
import { PartTabs } from './part-tabs';
import { PartContent } from './part-content';
import { type FilterKey, MobileAnswerGrid, type MobileQuestion } from './mobile-answer-grid';
import { MobileFiltersSheet } from './mobile-filters-sheet';
import { MobileNavSheet } from './mobile-nav-sheet';

interface ListeningAnswerSheetV2Props {
  data: PracticeListeningResultV2;
  locale: string;
}

type PartKey = 'part_1' | 'part_2' | 'part_3' | 'part_4';

type ListeningBlockFeedback = PracticeListeningResultV2['listening']['part_1']['blocks'][number];

function getQuestionsFromBlock(block: ListeningBlockFeedback): Array<{ number: number; user_answer: string | null; correct: boolean }> {
  switch (block.kind) {
    case 'checkboxes':
      return block.answers.map(a => ({ number: a.number, user_answer: a.user_answer, correct: a.correct }));
    case 'titles':
    case 'matching':
      return block.answers.map(a => ({ number: a.number, user_answer: a.user_answer, correct: a.correct }));
    case 'table':
      return block.questions.map(q => ({ number: q.number, user_answer: q.user_answer, correct: q.correct }));
    default:
      if ('questions' in block) {
        return block.questions.map(q => ({ number: q.number, user_answer: q.user_answer, correct: q.correct }));
      }
      return [];
  }
}

function ListeningAnswerSheetV2Component({ data }: ListeningAnswerSheetV2Props) {
  const shouldReduceMotion = useReducedMotion() ?? false;
  const isMobile = useMediaQuery('(max-width: 767px)');

  const [activePart, setActivePart] = useState<PartKey>('part_1');
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Mobile-specific state
  const [activeMobileTab, setActiveMobileTab] = useState<'overview' | 'detailed'>('overview');
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [pendingFocus, setPendingFocus] = useState<number | null>(null);
  const [expandedQuestionId, setExpandedQuestionId] = useState<number | null>(null);

  const mobileTabIndex = activeMobileTab === 'overview' ? 0 : 1;

  const partCounts = useMemo(
    () => ({
      part_1: data.listening.part_1.questions_count,
      part_2: data.listening.part_2.questions_count,
      part_3: data.listening.part_3.questions_count,
      part_4: data.listening.part_4.questions_count,
    }),
    [data.listening]
  );

  const totalQuestions = data.listening.questions_count;
  const correctCount = data.correct_answers_count;

  // Normalize all questions for the mobile grid
  const allQuestions = useMemo<MobileQuestion[]>(() => {
    const questions: MobileQuestion[] = [];

    (['part_1', 'part_2', 'part_3', 'part_4'] as const).forEach(partKey => {
      const part = data.listening[partKey];
      part.blocks.forEach((block, blockIndex) => {
        const blockQuestions = getQuestionsFromBlock(block);
        blockQuestions.forEach(q => {
          const status = q.user_answer === null || q.user_answer.trim() === '' ? 'unanswered' : q.correct ? 'correct' : 'incorrect';
          questions.push({
            number: q.number,
            status,
            partKey,
            blockIndex,
          });
        });
      });
    });

    return questions.sort((a, b) => a.number - b.number);
  }, [data.listening]);

  // Filter counts for the filter sheet
  const filterCounts = useMemo(
    () => ({
      all: allQuestions.length,
      correct: allQuestions.filter(q => q.status === 'correct').length,
      incorrect: allQuestions.filter(q => q.status === 'incorrect').length,
      unanswered: allQuestions.filter(q => q.status === 'unanswered').length,
    }),
    [allQuestions]
  );

  const handleScrollTop = useCallback(() => {
    if (typeof window === 'undefined') return;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Scroll listener
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Reset mobile tab when switching to desktop
  useEffect(() => {
    if (!isMobile) {
      setActiveMobileTab('overview');
    }
  }, [isMobile]);

  // Handle pending focus after tab switch
  useEffect(() => {
    if (pendingFocus === null) return;
    if (isMobile && activeMobileTab !== 'detailed') return;

    const questionNumber = pendingFocus;
    setPendingFocus(null);

    // Find which part the question belongs to
    const question = allQuestions.find(q => q.number === questionNumber);
    if (question && question.partKey !== activePart) {
      setActivePart(question.partKey);
    }

    // Set expanded question
    setExpandedQuestionId(questionNumber);

    // Scroll to question after a delay to let the DOM update
    requestAnimationFrame(() => {
      setTimeout(() => {
        const element = document.getElementById(`question-${questionNumber}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    });
  }, [pendingFocus, activeMobileTab, isMobile, allQuestions, activePart]);

  const focusQuestion = useCallback(
    (questionNumber: number) => {
      if (isMobile) {
        setActiveMobileTab('detailed');
        setPendingFocus(questionNumber);
        return;
      }
      // Desktop behavior - just scroll to and expand
      const question = allQuestions.find(q => q.number === questionNumber);
      if (question && question.partKey !== activePart) {
        setActivePart(question.partKey);
      }
      setExpandedQuestionId(questionNumber);
      requestAnimationFrame(() => {
        setTimeout(() => {
          const element = document.getElementById(`question-${questionNumber}`);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 100);
      });
    },
    [isMobile, allQuestions, activePart]
  );

  const handleMobileTabChange = useCallback((value: 'overview' | 'detailed') => {
    setActiveMobileTab(value);
  }, []);

  const handleFilterSelect = useCallback((value: FilterKey) => {
    setActiveFilter(value);
    setFiltersOpen(false);
  }, []);

  const closeAllSheets = useCallback(() => {
    setFiltersOpen(false);
    setNavOpen(false);
  }, []);

  const handleOpenFilters = useCallback(() => {
    closeAllSheets();
    setFiltersOpen(true);
  }, [closeAllSheets]);

  return (
    <div className='relative min-h-screen bg-[#FFFDF0]'>
      <div className='hidden tablet:block'>
        <WritingFeedbackHeader title='Listening Answer Sheet' showFullscreen />
      </div>
      <MobileHeader title='Listening Practice' tag='Answer Sheet V2' exitLabel='Exit' closeAs='link' closeHref='/profile' variant='reading' />

      <main className='mx-auto w-full max-w-[1180rem] space-y-[28rem] px-[20rem] pb-[96rem] pt-[24rem] tablet:space-y-[40rem] tablet:px-[48rem] tablet:pt-[48rem] desktop:px-[64rem] desktop:pt-[56rem]'>
        <ScoreSummaryCard
          correctCount={correctCount}
          totalCount={totalQuestions}
          score={data.score}
          testTitle={data.title}
          completedAt={data.completed_at}
          shouldReduceMotion={shouldReduceMotion}
        />

        {data.listening.audio_url && <AudioPlayer src={data.listening.audio_url} shouldReduceMotion={shouldReduceMotion} />}

        <section
          className={cn(
            'space-y-[24rem] rounded-[32rem] border border-[#E1D6B4] bg-white shadow-[0_18rem_48rem_-30rem_rgba(56,56,56,0.18)]',
            isMobile ? 'px-[20rem] py-[24rem]' : 'px-[24rem] py-[28rem]'
          )}
        >
          <header className='flex flex-col gap-[6rem] text-d-black'>
            <span className='text-[12rem] font-semibold uppercase tracking-[0.24em] text-[#85784A]'>Detailed Review</span>
            <h2 className='text-[18rem] font-semibold'>Question-by-Question Breakdown</h2>
          </header>

          {isMobile ? (
            <Tabs value={activeMobileTab} onValueChange={value => handleMobileTabChange(value as 'overview' | 'detailed')}>
              <div className='flex items-center justify-between gap-[12rem]'>
                <div className='relative flex w-full max-w-[260rem] items-center justify-between rounded-[999rem] bg-d-yellow-secondary/70 p-[4rem]'>
                  <motion.span
                    initial={false}
                    animate={{ x: `${mobileTabIndex * 100}%` }}
                    transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.22, ease: 'easeOut' }}
                    className='absolute bottom-[4rem] top-[4rem] w-[calc(50%-4rem)] rounded-[999rem] bg-white shadow-[0_6rem_18rem_rgba(0,0,0,0.08)]'
                  />
                  <TabsList className='relative z-[1] flex w-full items-center justify-between rounded-[999rem] bg-transparent'>
                    <TabsTrigger
                      value='overview'
                      className='w-1/2 rounded-[999rem] px-[16rem] py-[8rem] text-[13rem] font-semibold text-[#4B4628] transition data-[state=active]:bg-transparent data-[state=active]:text-d-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8E7B45] focus-visible:ring-offset-1'
                    >
                      Overview
                    </TabsTrigger>
                    <TabsTrigger
                      value='detailed'
                      className='w-1/2 rounded-[999rem] px-[16rem] py-[8rem] text-[13rem] font-semibold text-[#4B4628] transition data-[state=active]:bg-transparent data-[state=active]:text-d-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8E7B45] focus-visible:ring-offset-1'
                    >
                      Detailed
                    </TabsTrigger>
                  </TabsList>
                </div>
                <button
                  type='button'
                  onClick={handleOpenFilters}
                  aria-haspopup='dialog'
                  aria-expanded={filtersOpen}
                  className='inline-flex shrink-0 items-center gap-[6rem] rounded-[999rem] border border-[#E1D6B4] px-[14rem] py-[8rem] text-[12rem] font-semibold text-[#4B4628] transition hover:bg-d-yellow-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8E7B45] focus-visible:ring-offset-2'
                >
                  Filters
                  <span className='rounded-[999rem] bg-[#F5ECCC] px-[8rem] py-[2rem] text-[11rem] font-semibold text-[#6F6335]'>{filterCounts[activeFilter]}</span>
                </button>
              </div>

              <div className='mt-[16rem]'>
                {activeMobileTab === 'overview' ? (
                  <MobileAnswerGrid questions={allQuestions} activeFilter={activeFilter} onQuestionSelect={focusQuestion} shouldReduceMotion={shouldReduceMotion} />
                ) : (
                  <div className='flex flex-col gap-[16rem]'>
                    <PartTabs activePart={activePart} onPartChange={setActivePart} partCounts={partCounts} shouldReduceMotion={shouldReduceMotion} />
                    <motion.div
                      key={activePart}
                      initial={shouldReduceMotion ? undefined : { opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={shouldReduceMotion ? undefined : { duration: 0.25, ease: 'easeOut' }}
                    >
                      <PartContent
                        part={data.listening[activePart]}
                        partKey={activePart}
                        shouldReduceMotion={shouldReduceMotion}
                        singleOpen
                        expandedQuestionId={expandedQuestionId}
                        onQuestionToggle={setExpandedQuestionId}
                      />
                    </motion.div>
                  </div>
                )}
              </div>
            </Tabs>
          ) : (
            <>
              <PartTabs activePart={activePart} onPartChange={setActivePart} partCounts={partCounts} shouldReduceMotion={shouldReduceMotion} />

              <motion.div
                key={activePart}
                initial={shouldReduceMotion ? undefined : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={shouldReduceMotion ? undefined : { duration: 0.25, ease: 'easeOut' }}
              >
                <PartContent
                  part={data.listening[activePart]}
                  partKey={activePart}
                  shouldReduceMotion={shouldReduceMotion}
                  singleOpen={false}
                  expandedQuestionId={expandedQuestionId}
                  onQuestionToggle={setExpandedQuestionId}
                />
              </motion.div>
            </>
          )}
        </section>
      </main>

      {!isMobile && <BackToTopButton visible={showScrollTop} onClick={handleScrollTop} variant='reading' display='all' />}

      {/* Floating navigation button (mobile only) */}
      {isMobile && (
        <button
          type='button'
          onClick={() => {
            closeAllSheets();
            setNavOpen(true);
          }}
          className={cn(
            'fixed bottom-[32rem] right-[24rem] z-[45] flex size-[52rem] items-center justify-center rounded-full bg-[#4C7A3A] text-white shadow-[0_8rem_24rem_-8rem_rgba(76,122,58,0.5),0_4rem_12rem_-4rem_rgba(0,0,0,0.15)] transition',
            'hover:bg-[#3C612E] active:scale-95',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2F5E25] focus-visible:ring-offset-2'
          )}
          aria-label='Open navigation menu'
        >
          <Menu className='size-[22rem]' />
        </button>
      )}

      {/* Mobile bottom sheets */}
      {isMobile && (
        <>
          <MobileFiltersSheet open={filtersOpen} onOpenChange={setFiltersOpen} counts={filterCounts} activeFilter={activeFilter} onSelect={handleFilterSelect} />

          <MobileNavSheet
            open={navOpen}
            onOpenChange={setNavOpen}
            activePart={activePart}
            onPartChange={setActivePart}
            partCounts={partCounts}
            onOpenFilters={handleOpenFilters}
          />
        </>
      )}
    </div>
  );
}

export function ListeningAnswerSheetV2Skeleton() {
  return (
    <section className='flex h-[100dvh] w-full flex-col items-center justify-center gap-[18rem] overflow-hidden bg-[#FFFDF0] px-[24rem] text-center'>
      <div className='flex items-center gap-[12rem] text-[#85784A]'>
        <span className='size-[12rem] animate-pulse rounded-full bg-[#4C7A3A]' aria-hidden='true' />
        <span className='text-[13rem] font-semibold uppercase tracking-[0.24em]'>Listening practice</span>
      </div>
      <div className='space-y-[12rem]'>
        <p className='text-[20rem] font-semibold text-d-black'>Loading your detailed results...</p>
        <p className='text-[14rem] text-d-black/70'>Preparing question-by-question breakdown for you.</p>
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

export function ListeningAnswerSheetV2Error({ onRetry }: { onRetry?: () => void }) {
  return (
    <div className='flex min-h-[60vh] flex-col items-center justify-center gap-[16rem] rounded-[32rem] border border-rose-200 bg-rose-50 px-[32rem] py-[40rem] text-center text-[14rem] text-rose-800'>
      Something went wrong while loading your detailed listening results.
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

export const ListeningAnswerSheetV2 = withHydrationGuard(ListeningAnswerSheetV2Component);
