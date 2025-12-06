'use client';

import { MutableRefObject, type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ChevronRight, Menu, X } from 'lucide-react';

import { cn } from '@/lib/utils';
import type { SpeakingCriterionKey, SpeakingFeedbackNormalized, SpeakingResponsePart, SpeakingResponseQuestion } from '@/lib/speaking-feedback';
import type { CriterionKey, NormalizedCriterionData } from '@/lib/writing-feedback-v2';
import type { WritingBreakdownItem, WritingCriterion } from '@/types/WritingFeedback';
import { WritingFeedbackHeader } from '@/components/practice/WritingFeedbackHeader';
import { MobileHeader } from '@/components/practice/reading/mobile/MobileHeader';
import { OverallBandCard } from '@/app/[locale]/(protected)/practice/writing/feedback/[id]/_components/overall-band-card';
import { StickySectionNav } from '@/app/[locale]/(protected)/practice/writing/feedback/[id]/_components/sticky-section-nav';
import { BackToTopButton } from '@/app/[locale]/(protected)/practice/writing/feedback/[id]/_components/back-to-top-button';
import { BottomSheet, BottomSheetClose, BottomSheetContent } from '@/components/ui/bottom-sheet';
import { SpeakingTaskModal } from './speaking-task-modal';
import { FeedbackSummaryGrid } from '@/app/[locale]/(protected)/practice/writing/feedback/[id]/_components/feedback-summary-grid';
import { CriterionTabs } from '@/app/[locale]/(protected)/practice/writing/feedback/[id]/_components/criterion-tabs';
import { UserResponseCard } from '@/app/[locale]/(protected)/practice/writing/feedback/[id]/_components/user-response-card';

const SECTION_CONFIG = [
  { id: 'responses', label: 'Responses' },
  { id: 'summary', label: 'Summary' },
  { id: 'details', label: 'Detailed feedback' },
] as const;

type SectionId = (typeof SECTION_CONFIG)[number]['id'];

const SECTION_ORDER = SECTION_CONFIG.map(section => section.id) as SectionId[];

const SPEAKING_TO_WRITING_KEY: Partial<Record<SpeakingCriterionKey, CriterionKey>> = {
  fluency: 'coherence',
  lexical: 'lexical',
  grammar: 'grammar',
};

const SPEAKING_CRITERIA_ORDER: SpeakingCriterionKey[] = ['fluency', 'lexical', 'grammar'];

const isDivElement = (node: HTMLDivElement | null): node is HTMLDivElement => node !== null;

interface SpeakingFeedbackLayoutProps {
  data: SpeakingFeedbackNormalized;
}

export function SpeakingFeedbackLayout({ data }: SpeakingFeedbackLayoutProps) {
  const responseRef = useRef<HTMLDivElement | null>(null);
  const summaryRef = useRef<HTMLDivElement | null>(null);
  const detailsRef = useRef<HTMLDivElement | null>(null);
  const headerSentinelRef = useRef<HTMLDivElement | null>(null);
  const [activeSectionId, setActiveSectionId] = useState<SectionId>('responses');
  const [activeCriterion, setActiveCriterion] = useState<CriterionKey>('coherence');
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [headerVisible, setHeaderVisible] = useState(true);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const visibilityMapRef = useRef<Map<SectionId, number>>(new Map());
  const activeSectionRef = useRef<SectionId>('responses');

  const sectionRefs: Record<SectionId, MutableRefObject<HTMLDivElement | null>> = useMemo(
    () => ({
      responses: responseRef,
      summary: summaryRef,
      details: detailsRef,
    }),
    []
  );

  const hasTasks = useMemo(() => data.tasks.some(section => section.questions.length > 0), [data.tasks]);

  useEffect(() => {
    const handleScroll = () => {
      if (typeof window === 'undefined') {
        return;
      }
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

  const writingCriteria = useMemo<NormalizedCriterionData[]>(() => {
    const normalized: NormalizedCriterionData[] = [];

    SPEAKING_CRITERIA_ORDER.forEach(speakingKey => {
      const source = data.criteria.find(criterion => criterion.key === speakingKey);
      const mappedKey = SPEAKING_TO_WRITING_KEY[speakingKey];
      if (!source || !mappedKey) {
        return;
      }

      const breakdown: WritingBreakdownItem[] = source.breakdown.map(item => ({
        name: item.name,
        feedback: item.feedback ?? '',
        recommendation: item.recommendation ?? '',
        score: toScore(item.score) ?? 0,
      }));

      const writingCriterion: WritingCriterion = {
        feedback: source.feedback ?? '',
        recommendation: source.recommendation ?? '',
        breakdown,
        score: toScore(source.score) ?? 0,
      };

      normalized.push({
        key: mappedKey,
        label: source.label,
        score: toScore(source.score),
        summary: source.summary,
        data: writingCriterion,
      });
    });

    return normalized;
  }, [data.criteria]);

  useEffect(() => {
    if (writingCriteria.length === 0) {
      return;
    }
    if (!writingCriteria.some(criterion => criterion.key === activeCriterion)) {
      setActiveCriterion(writingCriteria[0].key);
    }
  }, [writingCriteria, activeCriterion]);

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

  const scrollToSection = useCallback(
    (id: SectionId) => {
      const target = sectionRefs[id]?.current;
      if (target && typeof window !== 'undefined') {
        const offset = getScrollOffset();
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        activeSectionRef.current = id;
        window.scrollTo({ top: Math.max(top, 0), behavior: 'smooth' });
      }
    },
    [getScrollOffset, sectionRefs]
  );

  const handleSummarySelect = useCallback(
    (key: CriterionKey) => {
      setActiveCriterion(key);
      scrollToSection('details');
    },
    [scrollToSection]
  );

  const handleViewTask = useCallback(() => {
    if (!hasTasks) {
      return;
    }
    setIsTaskModalOpen(true);
  }, [hasTasks]);

  const handleMobileNavSelect = useCallback(
    (id: SectionId) => {
      setIsMobileNavOpen(false);
      window.setTimeout(() => {
        scrollToSection(id);
      }, 180);
    },
    [scrollToSection]
  );

  const handleMobileViewTask = useCallback(() => {
    setIsMobileNavOpen(false);
    window.setTimeout(() => {
      handleViewTask();
    }, 200);
  }, [handleViewTask]);

  return (
    <div className='relative min-h-[100dvh] bg-[#EAF7FF]'>
      <div className='hidden tablet:block'>
        <WritingFeedbackHeader title='Speaking Feedback' exitHref='/profile' showFullscreen />
      </div>
      <MobileHeader title='Speaking Practice' tag='Feedback' exitLabel='Exit' closeAs='link' closeHref='/profile' variant='writing' />

      <div ref={headerSentinelRef} aria-hidden='true' className='h-[1px]' />

      <main className='bg-[#EAF7FF]'>
        <div className='container w-full px-[16rem] pb-[88rem] pt-[24rem] tablet:max-w-[1600rem] tablet:px-[40rem] tablet:pb-[64rem] tablet:pt-[32rem]'>
          <div className='flex flex-col gap-[18rem] tablet:gap-[32rem]'>
            <motion.section
              initial={{ opacity: shouldReduceMotion ? 1 : 0, y: shouldReduceMotion ? 0 : 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.32, ease: 'easeOut' }}
            >
              <div className='tablet:hidden'>
                <OverallBandCard score={data.overallScore} summary={data.overallSummary} pillLabel='IELTS Speaking' className='w-full' />
              </div>

              <section ref={responseRef} id='responses' data-section-key='responses' className='mt-[16rem] scroll-mt-[150rem] tablet:mt-0 tablet:scroll-mt-[180rem]'>
                <div className='flex flex-col gap-[20rem]'>
                  {data.responses.map(part => {
                    const transcriptText = buildTranscriptText(part);
                    const words = countWords(transcriptText);
                    return (
                      <UserResponseCard
                        bandScore={data.overallScore}
                        bandSummary={data.overallSummary}
                        bandLabel={part.title}
                        key={part.id}
                        title={`Your responses — ${part.title}`}
                        words={words}
                        statusMessage={buildStatusMessage(part)}
                        answer={transcriptText || 'Your responses will appear once the recordings are processed.'}
                        originalContent={<SpeakingResponseContent questions={part.questions} />}
                        highlightsEnabled={false}
                        onViewTask={hasTasks ? handleViewTask : undefined}
                        className='h-full'
                      />
                    );
                  })}
                </div>
              </section>
            </motion.section>

            <section
              ref={summaryRef}
              id='summary-section'
              data-section-key='summary'
              className='scroll-mt-[150rem] space-y-[20rem] tablet:scroll-mt-[180rem] tablet:space-y-[28rem]'
            >
              <FeedbackSummaryGrid criteria={writingCriteria} onSelect={handleSummarySelect} />
              {data.summary?.mainSummary ? (
                <div className='rounded-[20rem] border border-white/70 bg-white px-[18rem] py-[18rem] text-[14rem] leading-[1.7] text-slate-700 shadow-[0_26rem_88rem_-72rem_rgba(18,37,68,0.24)] tablet:rounded-[28rem] tablet:px-[28rem] tablet:py-[24rem] tablet:text-[15rem]'>
                  <p className='text-[12.5rem] font-semibold uppercase tracking-[0.18em] text-slate-400 tablet:text-[13rem]'>Overall impression</p>
                  <p className='mt-[8rem] whitespace-pre-line tablet:mt-[10rem]'>{data.summary?.mainSummary}</p>
                </div>
              ) : null}
            </section>

            <section
              ref={detailsRef}
              id='detailed-feedback-section'
              data-section-key='details'
              className='scroll-mt-[150rem] space-y-[18rem] tablet:scroll-mt-[180rem] tablet:space-y-[20rem]'
            >
              <header className='space-y-[6rem] tablet:space-y-[8rem]'>
                <h2 className='text-[19rem] font-semibold text-slate-900 tablet:text-[28rem]'>Detailed feedback by band</h2>
                <p className='text-[13.5rem] text-slate-600 tablet:text-[14rem]'>Explore each criterion to see breakdowns, targeted recommendations, and sub-scores.</p>
              </header>
              <CriterionTabs criteria={writingCriteria} activeKey={activeCriterion} onChange={setActiveCriterion} />
            </section>
          </div>
        </div>
      </main>

      <StickySectionNav
        visible={!headerVisible}
        sections={sectionsForNav}
        active={activeSectionId}
        onSelect={key => scrollToSection(key as SectionId)}
        onViewTask={hasTasks ? handleViewTask : undefined}
        className='hidden tablet:block'
      />

      <button
        type='button'
        aria-label='Open navigation menu'
        aria-haspopup='dialog'
        onClick={() => setIsMobileNavOpen(true)}
        className={cn(
          'fixed bottom-[32rem] right-[24rem] z-[45] flex size-[54rem] items-center justify-center rounded-full border border-white/80 bg-white text-slate-700 shadow-[0_24rem_48rem_-32rem_rgba(88,28,15,0.35)] transition hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2 tablet:hidden',
          isMobileNavOpen && 'pointer-events-none opacity-0'
        )}
      >
        <Menu className='size-[22rem]' aria-hidden='true' />
        <span className='sr-only'>Open navigation menu</span>
      </button>

      <BottomSheet open={isMobileNavOpen} onOpenChange={setIsMobileNavOpen}>
        <BottomSheetContent className='px-[18rem] pb-[28rem]' aria-label='Speaking feedback navigation'>
          <header className='flex items-center justify-between gap-[12rem] px-[2rem] pb-[16rem]'>
            <div className='space-y-[4rem]'>
              <p className='text-[12rem] font-semibold uppercase tracking-[0.24em] text-slate-400'>Navigate</p>
              <h2 className='text-[18rem] font-semibold leading-[1.4] text-slate-900'>Go to section</h2>
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
                    'flex w-full items-center justify-between rounded-[18rem] border border-slate-200 px-[16rem] py-[14rem] text-left text-[15rem] font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2',
                    isActive && 'border-sky-700 bg-sky-700 text-white shadow-[0_18rem_44rem_-28rem_rgba(15,23,42,0.45)] hover:bg-sky-700'
                  )}
                >
                  <span>{section.label}</span>
                  <ChevronRight className={cn('size-[18rem]', isActive ? 'text-white/80' : 'text-slate-400')} aria-hidden='true' />
                </button>
              );
            })}

            {hasTasks ? (
              <button
                type='button'
                onClick={handleMobileViewTask}
                className='flex w-full items-center justify-between rounded-[18rem] border border-sky-200 bg-sky-50 px-[16rem] py-[14rem] text-left text-[15rem] font-semibold text-sky-700 shadow-[0_16rem_40rem_-28rem_rgba(29,78,216,0.35)] transition hover:border-sky-300 hover:bg-sky-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2'
              >
                <span>View task</span>
                <ChevronRight className='size-[18rem] text-sky-500' aria-hidden='true' />
              </button>
            ) : null}
          </div>
        </BottomSheetContent>
      </BottomSheet>

      <BackToTopButton visible={showBackToTop} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} />

      <SpeakingTaskModal open={isTaskModalOpen} onOpenChange={setIsTaskModalOpen} sections={data.tasks} />
    </div>
  );
}

function toScore(value: number | null | undefined): number | null {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return null;
  }
  return Number(value.toFixed(1));
}

function buildTranscriptText(part: SpeakingResponsePart): string {
  return part.questions
    .map(question => question.transcript?.trim())
    .filter((value): value is string => {
      if (!value) {
        return false;
      }
      return value.length > 0;
    })
    .join('\n\n');
}

function countWords(text: string): number {
  if (!text.trim()) {
    return 0;
  }
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function formatQuestionSubtitle(count: number): string {
  if (count === 0) {
    return 'No questions';
  }
  return `${count} question${count === 1 ? '' : 's'}`;
}

function buildStatusMessage(part: SpeakingResponsePart): string {
  const total = part.questions.length;

  return `${formatQuestionSubtitle(total)}`;
}

function SpeakingResponseContent({ questions }: { questions: SpeakingResponseQuestion[] }): ReactNode {
  if (questions.length === 0) {
    return <p className='text-[14rem] text-slate-500'>Responses will appear here once recordings are complete.</p>;
  }

  return (
    <div className='flex flex-col gap-[16rem] tablet:gap-[18rem]'>
      {questions.map((question, index) => {
        const transcript = question.transcript?.trim();
        const hasAudio = Boolean(question.audioUrl);

        return (
          <article
            key={question.id}
            className='space-y-[12rem] rounded-[20rem] border border-slate-100 bg-white px-[16rem] py-[16rem] tablet:rounded-[24rem] tablet:px-[20rem] tablet:py-[18rem]'
          >
            <div className='flex items-start gap-[12rem]'>
              <span className='mt-[2rem] inline-flex size-[22rem] flex-shrink-0 items-center justify-center rounded-full bg-sky-700 text-[11.5rem] font-semibold text-white tablet:mt-0 tablet:size-[26rem] tablet:text-[12rem]'>
                {index + 1}
              </span>
              <p className='text-[15rem] font-medium leading-[1.5] text-slate-800 tablet:text-[15.5rem]'>{question.question}</p>
            </div>

            {hasAudio ? (
              <audio controls preload='none' className='w-full rounded-[14rem] bg-white text-slate-700' aria-label={`Audio response for ${question.question}`}>
                <source src={question.audioUrl} />
                Your browser does not support the audio element.
              </audio>
            ) : (
              <div className='rounded-[14rem] border border-dashed border-slate-300 bg-slate-50 px-[14rem] py-[12rem] text-[13rem] text-slate-500'>
                Audio response unavailable.
              </div>
            )}

            <div className='rounded-[16rem] border border-slate-100 bg-slate-50/70 px-[16rem] py-[14rem] text-[13.5rem] leading-[1.6] text-slate-700 tablet:text-[14rem]'>
              <p className='text-[12rem] font-semibold uppercase tracking-[0.18em] text-slate-400 tablet:text-[12.5rem]'>Transcript</p>
              <p className='mt-[8rem] whitespace-pre-line'>{transcript ?? 'Transcription not available.'}</p>
            </div>
          </article>
        );
      })}
    </div>
  );
}
