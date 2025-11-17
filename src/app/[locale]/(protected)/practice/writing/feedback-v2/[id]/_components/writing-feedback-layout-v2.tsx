'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { motion, useReducedMotion } from 'framer-motion';

import type { CriterionKey, WritingFeedbackV2Normalized } from '@/lib/writing-feedback-v2';
import { WritingFeedbackHeader } from '@/components/practice/WritingFeedbackHeader';
import { MobileHeader } from '@/components/practice/reading/mobile/MobileHeader';

import { BackToTopButton } from './back-to-top-button';
import { CriterionTabs } from './criterion-tabs';
import { FeedbackSummaryGrid } from './feedback-summary-grid';
import { HighlightedText } from './highlighted-text';
import { StickySectionNav } from './sticky-section-nav';
import { UserResponseCard } from './user-response-card';
import { WritingTaskModal } from './writing-task-modal';

const SECTION_CONFIG = [
  { id: 'response', label: 'Response & highlights' },
  { id: 'summary', label: 'Summary' },
  { id: 'details', label: 'Detailed feedback' },
] as const;

type SectionId = (typeof SECTION_CONFIG)[number]['id'];

const SECTION_ORDER = SECTION_CONFIG.map(section => section.id) as SectionId[];

const isDivElement = (node: HTMLDivElement | null): node is HTMLDivElement => node !== null;

interface WritingFeedbackLayoutV2Props {
  data: WritingFeedbackV2Normalized;
}

export function WritingFeedbackLayoutV2({ data }: WritingFeedbackLayoutV2Props) {
  const responseRef = useRef<HTMLDivElement | null>(null);
  const summaryRef = useRef<HTMLDivElement | null>(null);
  const detailsRef = useRef<HTMLDivElement | null>(null);
  const headerSentinelRef = useRef<HTMLDivElement | null>(null);
  const [activeSectionId, setActiveSectionId] = useState<SectionId>('response');
  const [activeCriterion, setActiveCriterion] = useState<CriterionKey>(data.criteria[0]?.key ?? 'task');
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [headerVisible, setHeaderVisible] = useState(true);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
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
    return window.innerWidth < 768 ? 112 : 164;
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
      <MobileHeader title='Writing Feedback' tag='Writing' exitLabel='Exit' closeAs='link' closeHref='/profile' variant='writing' />

      <div ref={headerSentinelRef} aria-hidden='true' className='h-[1px]' />

      <main className='bg-[#EAF7FF]'>
        <div className='container w-full px-[18rem] pb-[60rem] pt-[28rem] tablet:max-w-[1600rem] tablet:px-[40rem] tablet:pb-[64rem] tablet:pt-[32rem]'>
          <div className='flex flex-col gap-[32rem]'>
            <motion.section
              initial={{ opacity: shouldReduceMotion ? 1 : 0, y: shouldReduceMotion ? 0 : 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.32, ease: 'easeOut' }}
            >
              <section ref={responseRef} id='response-section' data-section-key='response' className='scroll-mt-[180rem]'>
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

            <section ref={summaryRef} id='summary-section' data-section-key='summary' className='space-y-[28rem] scroll-mt-[180rem]'>
              <FeedbackSummaryGrid criteria={data.criteria} onSelect={handleSummarySelect} />
              {data.generalFeedback?.feedback ? (
                <div className='rounded-[28rem] border border-white/70 bg-white px-[28rem] py-[24rem] text-[15rem] leading-[1.7] text-slate-700 shadow-[0_32rem_96rem_-80rem_rgba(18,37,68,0.24)]'>
                  <p className='text-[13rem] font-semibold uppercase tracking-[0.18em] text-slate-400'>Overall impression</p>
                  <p className='mt-[10rem]'>{data.generalFeedback.feedback}</p>
                </div>
              ) : null}
            </section>

            <section ref={detailsRef} id='detailed-feedback-section' data-section-key='details' className='space-y-[20rem] scroll-mt-[180rem]'>
              <header className='space-y-[8rem]'>
                <h2 className='text-[24rem] font-semibold text-slate-900 tablet:text-[28rem]'>Detailed feedback by band</h2>
                <p className='text-[14rem] text-slate-600'>Explore each criterion to see breakdowns, targeted recommendations, and sub-scores.</p>
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
      />

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
