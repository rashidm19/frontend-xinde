'use client';

import { type KeyboardEvent, type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { animate, AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { ArrowRight, BookOpenCheck, CheckCircle2, ChevronRight, FileText, Lightbulb, Sparkles, X } from 'lucide-react';
import * as DialogPrimitive from '@radix-ui/react-dialog';

import { cn } from '@/lib/utils';
import type { WritingFeedbackPartKey } from '@/types/WritingFeedback';

type ModalKey = 'criteria' | 'summary' | 'task' | 'ideal';

export type CriteriaKey = 'task' | 'coherence' | 'lexical' | 'grammar';

export interface TaskMediaItem {
  url: string;
  alt?: string;
}

export interface TaskInfo {
  title: string;
  prompt: string;
  instruction?: string | null;
  media?: TaskMediaItem[];
}

export interface CriterionBreakdownItem {
  name: string;
  score: number | null;
  feedback: string;
  recommendation?: string;
}

export interface NormalizedCriterion {
  key: CriteriaKey;
  title: string;
  description: string;
  score: number | null;
  feedback?: string;
  recommendation?: string;
  breakdown: CriterionBreakdownItem[];
}

export interface GeneralFeedbackSummary {
  overall?: string | null;
  recommendation?: string | null;
  strengths: string[];
  weaknesses: string[];
}

export interface NormalizedWritingFeedback {
  sectionTitle: string;
  essayText: string;
  essayWordCount: number;
  bandScore: number;
  bandStatus: string;
  criteria: NormalizedCriterion[];
  generalFeedback?: GeneralFeedbackSummary | null;
  idealResponse?: { text: string | null } | null;
  task: TaskInfo;
  targetBand?: number | null;
  goalCompletionPercent?: number | null;
  cefrLevel?: string | null;
}

interface PartOption {
  key: WritingFeedbackPartKey;
  label: string;
}

interface WritingFeedbackViewProps {
  data: NormalizedWritingFeedback;
  activePart: WritingFeedbackPartKey;
  partOptions: PartOption[];
  onPartChange: (key: WritingFeedbackPartKey) => void;
}

const scoreVisuals = [
  { threshold: 7.5, gradient: 'from-[#7EEAD5] via-[#70C5F8] to-[#5A7DE4]', text: 'text-white' },
  { threshold: 6.5, gradient: 'from-[#FFE6A5] via-[#FFC87D] to-[#FF9F7A]', text: 'text-slate-900' },
  { threshold: 0, gradient: 'from-[#FFB5B5] via-[#FF8D9A] to-[#F3646E]', text: 'text-white' },
];

const formatBandScore = (score: number | null | undefined) => {
  if (score === null || score === undefined || Number.isNaN(score)) {
    return '—';
  }
  return Number(score).toFixed(1);
};

const badgeByScore = (score: number | null) => {
  if (score === null || Number.isNaN(score)) {
    return 'bg-slate-200 text-slate-600';
  }

  if (score >= 7) {
    return 'bg-d-green-secondary text-slate-900';
  }

  if (score >= 6) {
    return 'bg-[#FFE9B2] text-slate-900';
  }

  return 'bg-[#FECACA] text-[#7F1D1D]';
};

export function WritingFeedbackView({ data, activePart, partOptions, onPartChange }: WritingFeedbackViewProps) {
  const shouldReduceMotion = useReducedMotion();
  const [openModal, setOpenModal] = useState<ModalKey | null>(null);
  const [activeCriterionIndex, setActiveCriterionIndex] = useState(0);
  const [displayScore, setDisplayScore] = useState(() => formatBandScore(data.bandScore));
  const essayScrollRef = useRef<HTMLDivElement | null>(null);
  const [showScrollHint, setShowScrollHint] = useState(false);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const availability = useMemo(
    () => ({
      criteria: data.criteria.length > 0,
      summary:
        !!data.generalFeedback?.overall ||
        !!data.generalFeedback?.recommendation ||
        (data.generalFeedback?.strengths?.length ?? 0) > 0 ||
        (data.generalFeedback?.weaknesses?.length ?? 0) > 0,
      ideal: !!data.idealResponse?.text,
    }),
    [data]
  );

  useEffect(() => {
    if (openModal !== 'criteria') {
      setActiveCriterionIndex(0);
    }
  }, [openModal]);

  useEffect(() => {
    setActiveCriterionIndex(0);
  }, [data.criteria, activePart]);

  useEffect(() => {
    if (data.bandScore === null || Number.isNaN(data.bandScore)) {
      setDisplayScore('—');
      return;
    }

    if (shouldReduceMotion) {
      setDisplayScore(formatBandScore(data.bandScore));
      return;
    }

    const controls = animate(0, data.bandScore, {
      duration: 0.8,
      ease: 'easeOut',
      onUpdate: value => {
        setDisplayScore(formatBandScore(value));
      },
    });

    return () => {
      controls.stop();
    };
  }, [data.bandScore, shouldReduceMotion]);

  const updateScrollHint = useCallback(() => {
    const node = essayScrollRef.current;
    if (!node) {
      setShowScrollHint(false);
      return;
    }

    const hasOverflow = node.scrollHeight - node.clientHeight > 12;
    if (!hasOverflow) {
      setShowScrollHint(false);
      return;
    }

    const reachedBottom = node.scrollTop + node.clientHeight >= node.scrollHeight - 16;
    setShowScrollHint(!reachedBottom);
  }, []);

  useEffect(() => {
    updateScrollHint();
    const node = essayScrollRef.current;
    if (!node) return;

    node.addEventListener('scroll', updateScrollHint);
    const handleResize = () => updateScrollHint();
    window.addEventListener('resize', handleResize);

    let observer: ResizeObserver | undefined;
    if (typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(() => updateScrollHint());
      observer.observe(node);
    }

    return () => {
      node.removeEventListener('scroll', updateScrollHint);
      window.removeEventListener('resize', handleResize);
      observer?.disconnect();
    };
  }, [updateScrollHint]);

  const bandVisual = useMemo(() => {
    if (data.bandScore === null || Number.isNaN(data.bandScore)) {
      return { gradient: 'from-slate-200 to-slate-100', text: 'text-slate-500' };
    }

    const found = scoreVisuals.find(visual => data.bandScore >= visual.threshold);
    return found ?? scoreVisuals[scoreVisuals.length - 1];
  }, [data.bandScore]);

  const paragraphs = useMemo(() => {
    const trimmed = data.essayText.trim();
    if (!trimmed) return [];
    return trimmed.split(/\n{2,}/g).map(paragraph => paragraph.trim());
  }, [data.essayText]);

  useEffect(() => {
    updateScrollHint();
  }, [paragraphs, updateScrollHint]);
  console.log(paragraphs);
  const goalLine = useMemo(() => {
    if (!data.targetBand || data.targetBand <= 0 || data.bandScore === null || Number.isNaN(data.bandScore)) {
      return null;
    }

    const percent = data.goalCompletionPercent ?? Math.round((data.bandScore / data.targetBand) * 100);
    if (!Number.isFinite(percent)) {
      return null;
    }

    const bounded = Math.min(100, Math.max(0, Math.round(percent)));
    return `You're ${bounded}% towards goal ${formatBandScore(data.targetBand)}`;
  }, [data.bandScore, data.goalCompletionPercent, data.targetBand]);

  const cefrLine = useMemo(() => {
    if (!data.cefrLevel) return null;
    return `CEFR level ${data.cefrLevel}`;
  }, [data.cefrLevel]);

  const activeCriterion = data.criteria[activeCriterionIndex] ?? null;

  const nextSteps = useMemo(
    () => [
      {
        key: 'criteria' as const,
        label: 'View detailed feedback',
        description: 'Band-by-band breakdown with targeted advice.',
        icon: BookOpenCheck,
        variant: 'primary' as const,
        disabled: !availability.criteria,
        action: () => setOpenModal('criteria'),
      },
      {
        key: 'ideal' as const,
        label: 'Check ideal response',
        description: 'Compare your answer with a high-scoring sample.',
        icon: Sparkles,
        variant: 'secondary' as const,
        disabled: !availability.ideal,
        action: () => setOpenModal('ideal'),
      },
      {
        key: 'summary' as const,
        label: 'View feedback summary',
        description: 'Review strengths, key issues, and recommendations.',
        icon: Lightbulb,
        variant: 'tertiary' as const,
        disabled: !availability.summary,
        action: () => setOpenModal('summary'),
      },
    ],
    [availability.criteria, availability.ideal, availability.summary]
  );

  const handleCriterionTabsKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') {
        return;
      }

      event.preventDefault();
      const direction = event.key === 'ArrowRight' ? 1 : -1;
      const nextIndex = (activeCriterionIndex + direction + data.criteria.length) % data.criteria.length;
      setActiveCriterionIndex(nextIndex);
      tabRefs.current[nextIndex]?.focus();
    },
    [activeCriterionIndex, data.criteria.length]
  );

  return (
    <div className='relative bg-[#EEF5FE]'>
      <div className='mx-auto flex w-full max-w-[1440rem] gap-[24rem] px-[40rem] pb-[32rem] pt-[24rem] tablet:px-[32rem]' style={{ height: 'calc(100dvh - 93rem)' }}>
        <section className='flex h-full flex-1 flex-col overflow-hidden rounded-[28rem] bg-white shadow-[0_40rem_120rem_-48rem_rgba(64,75,172,0.35)]'>
          <header className='flex flex-wrap items-center justify-between gap-[16rem] border-b border-slate-100 px-[36rem] py-[28rem]'>
            <div className='flex flex-col gap-[6rem]'>
              <span className='text-[14rem] font-semibold uppercase tracking-[0.18em] text-slate-400'>Response</span>
              <h2 className='text-[26rem] font-semibold text-slate-900'>{data.sectionTitle}</h2>
              <div className='flex items-center gap-[12rem] text-[13rem] font-medium text-slate-500'>
                <span>{data.essayWordCount} words</span>
                <span className='size-[6rem] rounded-full bg-slate-200' />
                <span>{data.bandStatus}</span>
              </div>
            </div>
            <div className='flex items-center gap-[12rem]'>
              {partOptions.length > 1 && (
                <nav className='flex items-center gap-[8rem] rounded-[999rem] border border-slate-200 bg-slate-50 p-[6rem]'>
                  {partOptions.map(option => (
                    <button
                      key={option.key}
                      type='button'
                      onClick={() => onPartChange(option.key)}
                      className={cn(
                        'rounded-[999rem] px-[18rem] py-[10rem] text-[13rem] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2',
                        option.key === activePart ? 'bg-slate-900 text-white shadow-[0_8rem_20rem_-12rem_rgba(15,23,42,0.45)]' : 'text-slate-600 hover:bg-white'
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </nav>
              )}
              <button
                type='button'
                onClick={() => setOpenModal('task')}
                className='inline-flex items-center gap-[10rem] rounded-[16rem] bg-slate-900 px-[22rem] py-[12rem] text-[14rem] font-semibold text-white shadow-[0_18rem_32rem_-20rem_rgba(15,23,42,0.5)] transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2'
              >
                View task
                <ArrowRight className='size-[16rem]' />
              </button>
            </div>
          </header>
          <div className='relative flex flex-1 flex-col overflow-hidden px-[36rem] pb-[36rem] pt-[28rem]'>
            <div
              ref={essayScrollRef}
              className='relative h-full overflow-y-auto px-[12rem] pr-[24rem] scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-200 hover:scrollbar-thumb-slate-300'
              onScroll={updateScrollHint}
            >
              {paragraphs.length === 0 ? (
                <div className='flex h-full items-center justify-center rounded-[20rem] border border-slate-100 bg-[#F8FAFF] text-[15rem] font-medium text-slate-500'>
                  Your essay will appear here as soon as it is available.
                </div>
              ) : (
                <article className='mx-auto flex max-w-[680rem] flex-col gap-[20rem] px-[8rem] py-[4rem] text-[15rem] leading-[1.68] tracking-[-0.12rem] text-slate-700'>
                  {paragraphs.map((paragraph, index) => (
                    <p key={index} className='whitespace-pre-wrap'>
                      {paragraph}
                    </p>
                  ))}
                </article>
              )}
            </div>
            <div
              aria-hidden='true'
              className={cn(
                'pointer-events-none absolute bottom-[36rem] left-[36rem] right-[36rem] h-[96rem] rounded-b-[24rem] bg-gradient-to-t from-white via-white/75 to-transparent transition-opacity duration-300',
                showScrollHint ? 'opacity-100' : 'opacity-0'
              )}
            />
          </div>
        </section>

        <aside className='flex h-full w-[360rem] shrink-0 flex-col gap-[24rem]'>
          <motion.section
            initial={{ opacity: shouldReduceMotion ? 1 : 0, y: shouldReduceMotion ? 0 : 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.5, ease: 'easeOut' }}
            className={cn(
              'relative overflow-hidden rounded-[28rem] px-[32rem] py-[28rem] shadow-[0_30rem_80rem_-48rem_rgba(62,104,221,0.35)]',
              'bg-gradient-to-br',
              bandVisual.gradient,
              bandVisual.text
            )}
          >
            <div className='flex flex-col gap-[12rem]'>
              <span className='text-[13rem] font-semibold uppercase tracking-[0.2em] opacity-80'>Overall band</span>
              <div className='flex items-end gap-[12rem]'>
                <span className='text-[62rem] font-semibold leading-none'>{displayScore}</span>
                <span className='pb-[8rem] text-[14rem] font-medium opacity-80'>IELTS (AI assessed)</span>
              </div>
              {goalLine && <p className='text-[14rem] font-medium opacity-85'>{goalLine}</p>}
              {cefrLine && <p className='text-[13rem] font-medium opacity-75'>{cefrLine}</p>}
              <p className='text-[13rem] font-medium opacity-75'>Band score generated against official IELTS criteria.</p>
            </div>
          </motion.section>

          <section className='flex flex-1 flex-col rounded-[28rem] border border-slate-100 bg-white px-[32rem] py-[28rem] shadow-[0_24rem_64rem_-48rem_rgba(46,67,139,0.25)]'>
            <header className='flex flex-col gap-[6rem]'>
              <span className='text-[13rem] font-semibold uppercase tracking-[0.2em] text-slate-400'>Next steps</span>
              <p className='text-[14rem] font-medium text-slate-500'>Choose what to explore next.</p>
            </header>
            <nav className='mt-[24rem] flex flex-1 flex-col gap-[12rem]'>
              {nextSteps.map(step => (
                <StepButton
                  key={step.key}
                  icon={step.icon}
                  label={step.label}
                  description={step.description}
                  variant={step.variant}
                  disabled={step.disabled}
                  onClick={step.action}
                />
              ))}
            </nav>
          </section>
        </aside>
      </div>

      <UnifiedModal title='Detailed feedback by band' open={openModal === 'criteria'} onOpenChange={open => setOpenModal(open ? 'criteria' : null)} size='lg'>
        {availability.criteria && activeCriterion ? (
          <div className='flex flex-col gap-[28rem]'>
            <div
              role='tablist'
              aria-label='Detailed feedback criteria'
              className='flex flex-wrap gap-[12rem] rounded-[22rem] border border-slate-100 bg-[#F4F6FF] p-[10rem]'
              onKeyDown={handleCriterionTabsKeyDown}
            >
              {data.criteria.map((criterion, index) => {
                const isActive = index === activeCriterionIndex;
                return (
                  <button
                    key={criterion.key}
                    ref={element => {
                      tabRefs.current[index] = element;
                    }}
                    type='button'
                    role='tab'
                    aria-selected={isActive}
                    tabIndex={isActive ? 0 : -1}
                    onClick={() => setActiveCriterionIndex(index)}
                    className={cn(
                      'relative inline-flex items-center justify-center rounded-[18rem] px-[18rem] py-[12rem] text-[13rem] font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2',
                      isActive ? 'text-slate-900' : 'text-slate-500 hover:text-slate-700'
                    )}
                  >
                    {isActive && (
                      <motion.span
                        layoutId='criterion-tab-indicator'
                        className='absolute inset-0 rounded-[18rem] bg-white shadow-[0_12rem_36rem_-20rem_rgba(46,67,139,0.3)]'
                        transition={{ duration: shouldReduceMotion ? 0 : 0.24, ease: 'easeOut' }}
                      />
                    )}
                    <span className='relative z-[1]'>{criterion.title}</span>
                  </button>
                );
              })}
            </div>

            <AnimatePresence mode='wait'>
              <motion.div
                key={activeCriterion.key}
                initial={{ opacity: shouldReduceMotion ? 1 : 0, y: shouldReduceMotion ? 0 : 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: shouldReduceMotion ? 1 : 0, y: shouldReduceMotion ? 0 : -18 }}
                transition={{ duration: shouldReduceMotion ? 0 : 0.32, ease: 'easeOut' }}
                className='flex flex-col gap-[24rem]'
              >
                <div className='rounded-[24rem] border border-slate-100 bg-[#F8FAFF] p-[24rem]'>
                  <div className='flex flex-wrap items-center justify-between gap-[18rem]'>
                    <div className='max-w-[520rem]'>
                      <p className='text-[13rem] font-semibold uppercase tracking-[0.18em] text-slate-500'>Criterion</p>
                      <h3 className='mt-[6rem] text-[22rem] font-semibold text-slate-900'>{activeCriterion.title}</h3>
                      <p className='mt-[6rem] text-[14rem] text-slate-500'>{activeCriterion.description}</p>
                    </div>
                    <span className={cn('rounded-[999rem] px-[20rem] py-[10rem] text-[16rem] font-semibold', badgeByScore(activeCriterion.score))}>
                      {formatBandScore(activeCriterion.score)}
                    </span>
                  </div>
                  {activeCriterion.feedback && <p className='mt-[16rem] text-[15rem] leading-[1.7] text-slate-700'>{activeCriterion.feedback}</p>}
                </div>

                <div className='rounded-[24rem] border border-d-blue/25 bg-d-blue-secondary/70 px-[24rem] py-[20rem] text-[15rem] leading-[1.65] text-d-black/80'>
                  <p className='text-[13rem] font-semibold uppercase tracking-[0.18em] text-d-black/60'>Focus next</p>
                  <p className='mt-[10rem]'>{activeCriterion.recommendation || 'We will highlight the next priority action as soon as it becomes available.'}</p>
                </div>

                <div className='flex flex-col gap-[18rem]'>
                  <div className='flex items-center gap-[10rem]'>
                    <CheckCircle2 className='size-[16rem] text-slate-500' />
                    <p className='text-[14rem] font-semibold uppercase tracking-[0.18em] text-slate-500'>Sub-criteria insights</p>
                  </div>
                  {activeCriterion.breakdown.length > 0 ? (
                    <div className='flex flex-col gap-[14rem]'>
                      {activeCriterion.breakdown.map(item => (
                        <article
                          key={`${activeCriterion.key}-${item.name}`}
                          className='space-y-[10rem] rounded-[22rem] border border-slate-100 bg-white px-[24rem] py-[18rem] shadow-[0_16rem_48rem_-32rem_rgba(15,23,42,0.28)]'
                        >
                          <div className='flex flex-wrap items-center justify-between gap-[12rem]'>
                            <div>
                              <h4 className='text-[15rem] font-semibold text-slate-900'>{item.name}</h4>
                              <p className='text-[13rem] text-slate-500'>Weighted within this band descriptor.</p>
                            </div>
                            <span className={cn('rounded-[999rem] px-[16rem] py-[6rem] text-[13rem] font-semibold', badgeByScore(item.score))}>
                              {formatBandScore(item.score)}
                            </span>
                          </div>
                          <p className='text-[14rem] leading-[1.6] text-slate-700'>{item.feedback}</p>
                          {item.recommendation && <p className='text-[13rem] font-medium text-slate-600'>Action: {item.recommendation}</p>}
                        </article>
                      ))}
                    </div>
                  ) : (
                    <p className='text-[14rem] text-slate-500'>Sub-criteria insights will appear here once they are generated.</p>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        ) : (
          <EmptyModalState description='Detailed feedback is not available yet. Check back once evaluation is complete.' />
        )}
      </UnifiedModal>

      <UnifiedModal title='Feedback summary' open={openModal === 'summary'} onOpenChange={open => setOpenModal(open ? 'summary' : null)}>
        <div className='flex flex-col gap-[24rem] text-[15rem] leading-[1.68] text-slate-700'>
          <SummarySection title='Overall impression'>
            {data.generalFeedback?.overall ? (
              <p className='whitespace-pre-wrap'>{data.generalFeedback.overall}</p>
            ) : (
              <p className='text-[14rem] text-slate-500'>Overall feedback will appear here once the evaluation is complete.</p>
            )}
          </SummarySection>

          <SummarySection title='Main issues'>
            {data.generalFeedback?.weaknesses && data.generalFeedback.weaknesses.length > 0 ? (
              <ul className='flex list-disc flex-col gap-[8rem] pl-[20rem]'>
                {data.generalFeedback.weaknesses.map((item, index) => (
                  <li key={`weakness-${index}`} className='text-[14rem]'>
                    {item}
                  </li>
                ))}
              </ul>
            ) : (
              <p className='text-[14rem] text-slate-500'>Main issues will be listed as soon as they are available.</p>
            )}
          </SummarySection>

          {data.generalFeedback?.strengths && data.generalFeedback.strengths.length > 0 && (
            <SummarySection title='Notable strengths'>
              <ul className='flex list-disc flex-col gap-[8rem] pl-[20rem]'>
                {data.generalFeedback.strengths.map((item, index) => (
                  <li key={`strength-${index}`} className='text-[14rem]'>
                    {item}
                  </li>
                ))}
              </ul>
            </SummarySection>
          )}

          {data.generalFeedback?.recommendation && (
            <SummarySection title='Recommendations'>
              <p className='whitespace-pre-wrap'>{data.generalFeedback.recommendation}</p>
            </SummarySection>
          )}
        </div>
      </UnifiedModal>

      <UnifiedModal
        title='Original IELTS Task'
        open={openModal === 'task'}
        onOpenChange={open => setOpenModal(open ? 'task' : null)}
        renderFooter={({ close }) => (
          <div className='flex flex-wrap items-center justify-between gap-[12rem]'>
            <button
              type='button'
              onClick={close}
              className='rounded-[16rem] border border-slate-200 px-[22rem] py-[12rem] text-[14rem] font-semibold text-slate-600 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2'
            >
              Close
            </button>
            <button
              type='button'
              onClick={() => setOpenModal('ideal')}
              disabled={!availability.ideal}
              className={cn(
                'inline-flex items-center gap-[8rem] rounded-[16rem] bg-slate-900 px-[24rem] py-[12rem] text-[14rem] font-semibold text-white transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2',
                !availability.ideal && 'cursor-not-allowed bg-slate-300 text-slate-500 focus-visible:ring-0'
              )}
            >
              Open ideal response
              <ArrowRight className='size-[16rem]' />
            </button>
          </div>
        )}
      >
        <div className='flex flex-col gap-[24rem] text-[15rem] leading-[1.65] text-slate-700'>
          {data.task.instruction && (
            <SummarySection title='Instructions'>
              <p className='whitespace-pre-wrap'>{data.task.instruction}</p>
            </SummarySection>
          )}
          <SummarySection title='Prompt'>
            <p className='whitespace-pre-wrap'>{data.task.prompt}</p>
          </SummarySection>
          {data.task.media && data.task.media.length > 0 && (
            <div className='flex flex-col gap-[16rem]'>
              <div className='flex items-center gap-[10rem] text-[14rem] font-semibold text-slate-500'>
                <FileText className='size-[16rem]' /> Task visuals
              </div>
              <div className='grid gap-[16rem]'>
                {data.task.media.map((mediaItem, index) => (
                  <figure key={`${mediaItem.url}-${index}`} className='overflow-hidden rounded-[22rem] border border-slate-100 bg-slate-50'>
                    <img src={mediaItem.url} alt={mediaItem.alt ?? 'Task reference'} className='h-auto w-full object-contain' />
                    {mediaItem.alt && <figcaption className='px-[18rem] py-[12rem] text-[13rem] text-slate-500'>{mediaItem.alt}</figcaption>}
                  </figure>
                ))}
              </div>
            </div>
          )}
        </div>
      </UnifiedModal>

      <UnifiedModal title='Ideal response example' open={openModal === 'ideal'} onOpenChange={open => setOpenModal(open ? 'ideal' : null)}>
        {availability.ideal && data.idealResponse?.text ? (
          <div className='flex flex-col gap-[20rem]'>
            <p className='text-[14rem] font-medium text-slate-500'>Use this sample for inspiration—tailor your own response rather than copying it.</p>
            <article className='space-y-[16rem] rounded-[24rem] border border-slate-100 bg-[#F8FAFF] px-[24rem] py-[24rem] text-[15rem] leading-[1.7] text-slate-700'>
              {data.idealResponse.text.split(/\n{2,}/g).map((paragraph, index) => (
                <p key={index} className='whitespace-pre-wrap'>
                  {paragraph.trim()}
                </p>
              ))}
            </article>
          </div>
        ) : (
          <EmptyModalState description='The exemplar response is on its way. Please check again soon.' />
        )}
      </UnifiedModal>
    </div>
  );
}

interface StepButtonProps {
  icon: LucideIcon;
  label: string;
  description: string;
  variant: 'primary' | 'secondary' | 'tertiary';
  disabled?: boolean;
  onClick: () => void;
}

function StepButton({ icon: Icon, label, description, variant, disabled, onClick }: StepButtonProps) {
  const baseClasses =
    'flex min-h-[78rem] items-center justify-between gap-[16rem] rounded-[24rem] border px-[24rem] py-[18rem] text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2';
  const variantClasses: Record<StepButtonProps['variant'], string> = {
    primary: 'border-transparent bg-gradient-to-r from-[#4F86F7] to-[#7C5CFF] text-white shadow-[0_20rem_40rem_-28rem_rgba(72,85,190,0.65)] hover:brightness-[1.05]',
    secondary: 'border-slate-200 bg-white text-slate-800 hover:bg-slate-50',
    tertiary: 'border-slate-100 bg-[#F6F8FF] text-slate-700 hover:bg-white',
  };

  return (
    <button
      type='button'
      onClick={onClick}
      disabled={disabled}
      className={cn(
        baseClasses,
        variantClasses[variant],
        disabled && 'cursor-not-allowed border-slate-100 bg-slate-50 text-slate-300 hover:bg-slate-50 focus-visible:ring-0'
      )}
    >
      <span className='flex items-center gap-[16rem]'>
        <span className={cn('mt-[2rem] rounded-[16rem] bg-white/70 p-[10rem]', variant === 'primary' ? 'text-white' : 'text-slate-600', disabled && 'text-slate-300')}>
          <Icon className='size-[18rem]' aria-hidden='true' />
        </span>
        <span className='text-[15rem] font-semibold leading-tight'>{label}</span>
      </span>
      <ChevronRight
        className={cn('size-[18rem] transition', disabled ? 'text-slate-300' : variant === 'primary' ? 'text-white/80' : 'text-slate-500')}
        aria-hidden='true'
      />
    </button>
  );
}

interface UnifiedModalProps {
  title: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  size?: 'md' | 'lg';
  children: ReactNode;
  renderFooter?: (helpers: { close: () => void }) => ReactNode;
}

function UnifiedModal({ title, open, onOpenChange, size = 'md', children, renderFooter }: UnifiedModalProps) {
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <DialogPrimitive.Portal forceMount>
            <DialogPrimitive.Overlay asChild>
              <motion.div
                initial={{ opacity: shouldReduceMotion ? 1 : 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: shouldReduceMotion ? 1 : 0 }}
                transition={{ duration: shouldReduceMotion ? 0 : 0.2, ease: 'easeOut' }}
                className='fixed inset-0 z-[2000] bg-slate-900/40 backdrop-blur-sm'
              />
            </DialogPrimitive.Overlay>
            <DialogPrimitive.Content asChild>
              <div className='fixed inset-0 z-[2001] flex items-center justify-center px-[24rem] py-[40rem] focus:outline-none'>
                <motion.div
                  initial={{ opacity: shouldReduceMotion ? 1 : 0, y: shouldReduceMotion ? 0 : 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: shouldReduceMotion ? 1 : 0, y: shouldReduceMotion ? 0 : 12 }}
                  transition={{ duration: shouldReduceMotion ? 0 : 0.28, ease: 'easeOut' }}
                  className={cn('relative w-[min(92vw,820rem)] max-w-full', size === 'lg' && 'w-[min(92vw,960rem)]')}
                >
                  <div className='flex max-h-[85vh] flex-col overflow-hidden rounded-[28rem] border border-slate-100 bg-white shadow-[0_60rem_140rem_-80rem_rgba(32,64,171,0.35)]'>
                    <header className='sticky top-0 z-[1] flex items-start justify-between gap-[16rem] border-b border-slate-100 bg-white/95 px-[32rem] py-[24rem] backdrop-blur'>
                      <DialogPrimitive.Title className='text-[22rem] font-semibold text-slate-900'>{title}</DialogPrimitive.Title>
                      <DialogPrimitive.Close asChild>
                        <button
                          type='button'
                          aria-label='Close modal'
                          className='rounded-full border border-slate-200 bg-white p-[10rem] text-slate-500 transition hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2'
                        >
                          <X className='size-[18rem]' />
                        </button>
                      </DialogPrimitive.Close>
                    </header>
                    <div className='flex-1 overflow-y-auto px-[32rem] py-[28rem] scrollbar-thin scrollbar-thumb-slate-200 hover:scrollbar-thumb-slate-300'>
                      {children}
                    </div>
                    {renderFooter && (
                      <footer className='sticky bottom-0 border-t border-slate-100 bg-white/95 px-[32rem] py-[20rem] backdrop-blur'>
                        {renderFooter({ close: () => onOpenChange(false) })}
                      </footer>
                    )}
                  </div>
                </motion.div>
              </div>
            </DialogPrimitive.Content>
          </DialogPrimitive.Portal>
        )}
      </AnimatePresence>
    </DialogPrimitive.Root>
  );
}

interface SummarySectionProps {
  title: string;
  children: ReactNode;
}

function SummarySection({ title, children }: SummarySectionProps) {
  return (
    <section className='flex flex-col gap-[10rem] rounded-[20rem] border border-slate-100 bg-[#F8FAFF] px-[22rem] py-[18rem]'>
      <h4 className='text-[16rem] font-semibold text-slate-900'>{title}</h4>
      <div className='text-[14rem] leading-[1.7] text-slate-700'>{children}</div>
    </section>
  );
}

interface EmptyModalStateProps {
  description: string;
}

function EmptyModalState({ description }: EmptyModalStateProps) {
  return (
    <div className='flex h-full flex-col items-center justify-center gap-[12rem] rounded-[24rem] border border-dashed border-slate-200 bg-slate-50 px-[32rem] py-[40rem] text-center'>
      <span className='text-[15rem] font-semibold text-slate-600'>Content is not ready yet</span>
      <p className='text-[13rem] text-slate-500'>{description}</p>
    </div>
  );
}
