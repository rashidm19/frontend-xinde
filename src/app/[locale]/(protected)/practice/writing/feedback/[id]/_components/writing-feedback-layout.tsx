'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { motion, useReducedMotion } from 'framer-motion';
import { ChevronRight, Menu, X } from 'lucide-react';

import { cn } from '@/lib/utils';

import type { CriterionKey, WritingFeedbackV2Normalized } from '@/lib/writing-feedback-v2';
import { WritingFeedbackHeader } from '@/components/practice/WritingFeedbackHeader';
import { MobileHeader } from '@/components/practice/reading/mobile/MobileHeader';

import { BackToTopButton } from './back-to-top-button';
import { CriterionTabs } from './criterion-tabs';
import { FeedbackSummaryGrid } from './feedback-summary-grid';
import { HighlightedText } from './highlighted-text';
import { OverallBandCard } from './overall-band-card';
import { StickySectionNav } from './sticky-section-nav';
import { UserResponseCard } from './user-response-card';
import { WritingTaskModal } from './writing-task-modal';
import { BottomSheet, BottomSheetClose, BottomSheetContent } from '@/components/ui/bottom-sheet';

const SECTION_CONFIG = [
  { id: 'response', label: 'Response & highlights' },
  { id: 'summary', label: 'Summary' },
  { id: 'details', label: 'Detailed feedback' },
] as const;

type SectionId = (typeof SECTION_CONFIG)[number]['id'];

const SECTION_ORDER = SECTION_CONFIG.map(section => section.id) as SectionId[];

const isDivElement = (node: HTMLDivElement | null): node is HTMLDivElement => node !== null;

interface WritingFeedbackLayoutProps {
  data: WritingFeedbackV2Normalized;
}

export function WritingFeedbackLayout({ data }: WritingFeedbackLayoutProps) {
  const responseRef = useRef<HTMLDivElement | null>(null);
  const summaryRef = useRef<HTMLDivElement | null>(null);
  const detailsRef = useRef<HTMLDivElement | null>(null);
  const headerSentinelRef = useRef<HTMLDivElement | null>(null);
  const [activeSectionId, setActiveSectionId] = useState<SectionId>('response');
  const [activeCriterion, setActiveCriterion] = useState<CriterionKey>(data.criteria[0]?.key ?? 'task');
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [headerVisible, setHeaderVisible] = useState(true);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const visibilityMapRef = useRef<Map<SectionId, number>>(new Map());
  const activeSectionRef = useRef<SectionId>('response');

  const handleViewTask = useCallback(() => {
    setIsTaskModalOpen(true);
  }, []);

  const sectionRefs: Record<SectionId, typeof summaryRef> = useMemo(
    () => ({
      response: responseRef,
      summary: summaryRef,
      details: detailsRef,
    }),
    []
  );

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 280);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const sentinel = headerSentinelRef.current;
    if (!sentinel) {
      return;
    }

    const observer = new IntersectionObserver(([entry]) => {
      setHeaderVisible(entry.isIntersecting);
    });

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  const sectionsForNav = useMemo(() => SECTION_CONFIG.map(section => ({ key: section.id, label: section.label })), []);

  const getScrollOffset = useCallback(() => {
    if (typeof window === 'undefined') {
      return 132;
    }
    return window.innerWidth < 768 ? 96 : 164;
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        const visibility = visibilityMapRef.current;

        entries.forEach(entry => {
          const id = entry.target.getAttribute('data-section-key') as SectionId | null;
          if (!id) {
            return;
          }
          if (entry.isIntersecting) {
            visibility.set(id, entry.intersectionRatio);
          } else {
            visibility.delete(id);
          }
        });

        let nextActive: SectionId | null = null;

        if (visibility.size > 0) {
          const sorted = Array.from(visibility.entries()).sort((a, b) => {
            if (b[1] === a[1]) {
              return SECTION_ORDER.indexOf(a[0]) - SECTION_ORDER.indexOf(b[0]);
            }
            return b[1] - a[1];
          });
          nextActive = sorted[0][0];
        } else {
          const offset = getScrollOffset();
          const distances = SECTION_ORDER.map(id => {
            const node = sectionRefs[id]?.current;
            if (!node) {
              return { id, distance: Number.POSITIVE_INFINITY };
            }
            const rect = node.getBoundingClientRect();
            const adjustedTop = rect.top - offset;
            return { id, distance: Math.abs(adjustedTop) };
          }).sort((a, b) => a.distance - b.distance);

          nextActive = distances[0]?.id ?? activeSectionRef.current;
        }

        if (nextActive && nextActive !== activeSectionRef.current) {
          activeSectionRef.current = nextActive;
          setActiveSectionId(nextActive);
        }
      },
      { rootMargin: '-140px 0px -55% 0px', threshold: [0, 0.15, 0.35, 0.55, 0.75, 0.95] }
    );

    const elements = SECTION_ORDER.map(id => sectionRefs[id]?.current).filter(isDivElement);
    elements.forEach(node => observer.observe(node));

    return () => {
      elements.forEach(node => observer.unobserve(node));
      visibilityMapRef.current.clear();
      observer.disconnect();
    };
  }, [getScrollOffset, sectionRefs]);

  const scrollToSection = useCallback((id: SectionId) => {
    const target = sectionRefs[id]?.current;
    if (target && typeof window !== 'undefined') {
      const offset = getScrollOffset();
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      activeSectionRef.current = id;
      // setActiveSectionId(id);
      window.scrollTo({ top: Math.max(top, 0), behavior: 'smooth' });
    }
  }, [getScrollOffset, sectionRefs]);

  const handleSummarySelect = useCallback((key: CriterionKey) => {
    setActiveCriterion(key);
    scrollToSection('details');
  }, [scrollToSection]);

  const handleMobileNavSelect = useCallback((id: SectionId) => {
    setIsMobileNavOpen(false);
    window.setTimeout(() => {
      scrollToSection(id);
    }, 180);
  }, [scrollToSection]);

  const handleMobileViewTask = useCallback(() => {
    setIsMobileNavOpen(false);
    window.setTimeout(() => {
      handleViewTask();
    }, 200);
  }, [handleViewTask]);

  const highlightedUserAnswer = useMemo(() => {
    if (!data.rewrite?.hasHighlights || !data.userAnswer.trim()) {
      return null;
    }
    return <HighlightedText rewrite={data.rewrite} mode='original' sourceText={data.userAnswer} />;
  }, [data.rewrite, data.userAnswer]);

  const improvedAnswer = useMemo(() => {
    if (!data.rewrite?.segments?.length) {
      return null;
    }
    return <HighlightedText rewrite={data.rewrite} mode='improved' />;
  }, [data.rewrite]);

  return (
    <div className='relative min-h-[100dvh] bg-[#EAF7FF]'>
      <div className='hidden tablet:block'>
        <WritingFeedbackHeader title='Writing Feedback' exitHref='/profile' />
      </div>
      <MobileHeader title='Writing Practice' tag='Feedback' exitLabel='Exit' closeAs='link' closeHref='/profile' variant='writing' />

      <div ref={headerSentinelRef} aria-hidden='true' className='h-[1px]' />

      <main className='bg-[#EAF7FF]'>
        <div className='container w-full px-[16rem] pb-[88rem] pt-[24rem] tablet:max-w-[1600rem] tablet:px-[40rem] tablet:pb-[64rem] tablet:pt-[32rem] '>
          <div className='flex flex-col gap-[18rem] tablet:gap-[32rem]'>
            <motion.section
              initial={{ opacity: shouldReduceMotion ? 1 : 0, y: shouldReduceMotion ? 0 : 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.32, ease: 'easeOut' }}
            >
              <div className='tablet:hidden'>
                <OverallBandCard
                  score={data.overallBand}
                  summary={data.bandSummary ?? ''}
                  pillLabel={data.partTitle}
                  className='w-full'
                />
              </div>
              <section
                ref={responseRef}
                id='response-section'
                data-section-key='response'
                className='mt-[16rem] scroll-mt-[150rem] tablet:mt-0 tablet:scroll-mt-[180rem]'
              >
                <UserResponseCard
                  title={`Your response — ${data.partTitle}`}
                  words={data.wordCount}
                  statusMessage={data.metadataMessage}
                  answer={data.userAnswer}
                  originalContent={highlightedUserAnswer ?? data.userAnswer}
                  improvedContent={improvedAnswer ?? data.rewrite?.plainText ?? undefined}
                  improvedHelpText='This version includes AI-suggested corrections and enhanced phrasing.'
                  bandScore={data.overallBand}
                  bandSummary={data.bandSummary}
                  bandLabel={data.partTitle}
                  highlightsEnabled={Boolean(data.rewrite?.hasHighlights)}
                  onViewTask={handleViewTask}
                  className='h-full'
                />
              </section>
            </motion.section>

            <section ref={summaryRef} id='summary-section' data-section-key='summary' className='space-y-[20rem] scroll-mt-[150rem] tablet:space-y-[28rem] tablet:scroll-mt-[180rem]'>
              <FeedbackSummaryGrid criteria={data.criteria} onSelect={handleSummarySelect} />
              {data.generalFeedback?.feedback ? (
                <div className='rounded-[20rem] border border-white/70 bg-white px-[18rem] py-[18rem] text-[14rem] leading-[1.7] text-slate-700 shadow-[0_26rem_88rem_-72rem_rgba(18,37,68,0.24)] tablet:rounded-[28rem] tablet:px-[28rem] tablet:py-[24rem] tablet:text-[15rem]'>
                  <p className='text-[12.5rem] font-semibold uppercase tracking-[0.18em] text-slate-400 tablet:text-[13rem]'>Overall impression</p>
                  <p className='mt-[8rem] whitespace-pre-line tablet:mt-[10rem]'>{data.generalFeedback.feedback}</p>
                </div>
              ) : null}
            </section>

            <section ref={detailsRef} id='detailed-feedback-section' data-section-key='details' className='space-y-[18rem] scroll-mt-[150rem] tablet:space-y-[20rem] tablet:scroll-mt-[180rem]'>
              <header className='space-y-[6rem] tablet:space-y-[8rem]'>
                <h2 className='text-[19rem] font-semibold text-slate-900 tablet:text-[28rem]'>Detailed feedback by band</h2>
                <p className='text-[13.5rem] text-slate-600 tablet:text-[14rem]'>Explore each criterion to see breakdowns, targeted recommendations, and sub-scores.</p>
              </header>
              <CriterionTabs criteria={data.criteria} activeKey={activeCriterion} onChange={setActiveCriterion} />
            </section>
          </div>
        </div>
      </main>

      <StickySectionNav
        visible={!headerVisible}
        sections={sectionsForNav}
        active={activeSectionId}
        onSelect={key => scrollToSection(key as SectionId)}
        onViewTask={handleViewTask}
        className='hidden tablet:block'
      />

      <button
        type='button'
        aria-label='Open navigation menu'
        aria-haspopup='dialog'
        onClick={() => setIsMobileNavOpen(true)}
        className={cn(
          'fixed bottom-[32rem] right-[24rem] z-[45] flex size-[54rem] items-center justify-center rounded-full border border-white/80 bg-white text-slate-700 shadow-[0_24rem_48rem_-32rem_rgba(15,23,42,0.35)] transition hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2 tablet:hidden',
          isMobileNavOpen && 'pointer-events-none opacity-0'
        )}
      >
        <Menu className='size-[22rem]' aria-hidden='true' />
        <span className='sr-only'>Open navigation menu</span>
      </button>

      <BottomSheet open={isMobileNavOpen} onOpenChange={setIsMobileNavOpen}>
        <BottomSheetContent className='px-[18rem] pb-[28rem]' aria-label='Writing feedback navigation'>
          <header className='flex items-center justify-between gap-[12rem] px-[2rem] pb-[16rem]'>
            <div className='space-y-[4rem]'>
              <p className='text-[12rem] font-semibold uppercase tracking-[0.24em] text-slate-400'>Navigate</p>
              <h2 className='text-[18rem] font-semibold text-slate-900 leading-[1.4]'>Go to section</h2>
            </div>
            <BottomSheetClose
              className='inline-flex size-[36rem] items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500'
              aria-label='Close navigation menu'
            >
              <X className='size-[18rem]' aria-hidden='true' />
            </BottomSheetClose>
          </header>

          <div className='flex flex-col gap-[10rem]'>
            {SECTION_CONFIG.map(section => {
              const isActive = activeSectionId === section.id;
              return (
                <button
                  key={section.id}
                  type='button'
                  onClick={() => handleMobileNavSelect(section.id)}
                  className={cn(
                    'flex w-full items-center justify-between rounded-[18rem] border border-slate-200 px-[16rem] py-[14rem] text-left text-[15rem] font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2',
                    isActive && 'border-sky-700 bg-sky-700 text-white shadow-[0_18rem_44rem_-28rem_rgba(45,78,168,0.4)] hover:bg-[#2743B2]'
                  )}
                >
                  <span>{section.label}</span>
                  <ChevronRight className={cn('size-[18rem]', isActive ? 'text-white/80' : 'text-slate-400')} aria-hidden='true' />
                </button>
              );
            })}

            <button
              type='button'
              onClick={handleMobileViewTask}
              className='flex w-full items-center justify-between rounded-[18rem] border border-sky-200 bg-sky-50 px-[16rem] py-[14rem] text-left text-[15rem] font-semibold text-sky-700 shadow-[0_16rem_40rem_-28rem_rgba(29,78,216,0.35)] transition hover:border-sky-300 hover:bg-sky-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2'
            >
              <span>View task</span>
              <ChevronRight className='size-[18rem] text-sky-500' aria-hidden='true' />
            </button>
          </div>
        </BottomSheetContent>
      </BottomSheet>

      <BackToTopButton visible={showBackToTop} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} />

      <WritingTaskModal
        open={isTaskModalOpen}
        onOpenChange={setIsTaskModalOpen}
        title={data.partTitle}
        prompt={data.taskPrompt}
        question={data.taskQuestion}
        description={data.taskText}
        picture={data.taskPicture}
      />
    </div>
  );
}
