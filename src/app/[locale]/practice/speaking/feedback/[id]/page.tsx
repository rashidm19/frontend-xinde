'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useQuery } from '@tanstack/react-query';
import { animate, AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { BookOpenCheck, CheckCircle2, ChevronRight, Lightbulb, Sparkles } from 'lucide-react';

import { GET_practice_speaking_feedback_id } from '@/api/GET_practice_speaking_feedback_id';
import { EmptyModalState, ModalScrollProgress, ModalShell } from '@/components/modals/UnifiedModalShell';
import { WritingFeedbackHeader } from '@/components/practice/WritingFeedbackHeader';
import { cn } from '@/lib/utils';
import axiosInstance from '@/lib/axiosInstance';
import { ISpeakingPracticeFeedback, PracticeSpeakingPassed } from '@/types/SpeakingFeedback';

type SpeakingFeedbackError = Error & { status?: number };

const scoreVisuals = [
  { threshold: 7.5, gradient: 'from-[#7EEAD5] via-[#70C5F8] to-[#5A7DE4]', text: 'text-white' },
  { threshold: 6.5, gradient: 'from-[#FFE6A5] via-[#FFC87D] to-[#FF9F7A]', text: 'text-slate-900' },
  { threshold: 0, gradient: 'from-[#FFB5B5] via-[#FF8D9A] to-[#F3646E]', text: 'text-white' },
];

type ModalKey = 'summary' | 'criteria' | 'ideal';

type DescriptorKey = 'Fluency & Coherence' | 'Lexical Resource' | 'Grammatical Range & Accuracy';

const MOCK_IDEAL_RESPONSE = `Sample ideal speaking response paragraph one highlighting structure and fluent delivery.

Sample paragraph two emphasising vocabulary variety and coherence.`;

export default function Page({ params }: { params: { id: string } }) {
  const {
    data: passedData,
    status: passedStatus,
    error: passedError,
    refetch: refetchPassed,
  } = useQuery<PracticeSpeakingPassed, SpeakingFeedbackError>({
    queryKey: ['practice-speaking-feedbacks'],
    queryFn: async () => {
      const response = await axiosInstance.get('/practice/speaking/passed');
      return response.data as PracticeSpeakingPassed;
    },
    refetchInterval: query => {
      const found = query?.state.data?.data.find(item => String(item.id) === params.id);
      return found?.feedback_ready ? false : 3000;
    },
    retry: false,
    enabled: !!params.id,
  });

  const isFeedbackReady = passedData?.data.some(item => String(item.id) === params.id && item.feedback_ready) ?? false;

  const {
    data: feedbackData,
    status: feedbackStatus,
    error: feedbackError,
    refetch: refetchFeedback,
  } = useQuery<ISpeakingPracticeFeedback, SpeakingFeedbackError>({
    queryKey: ['practice-speaking-feedback', params.id],
    queryFn: async () => await GET_practice_speaking_feedback_id(params.id),
    enabled: isFeedbackReady,
    retry: false,
  });

  if (passedStatus === 'error') {
    return (
      <StateContainer
        tone='error'
        title='We could not confirm your speaking attempt.'
        description={passedError?.message ?? 'Please retry loading this page.'}
        actionLabel='Try again'
        onAction={refetchPassed}
      />
    );
  }

  if (!isFeedbackReady) {
    return <StateContainer tone='info' title='Evaluating your answer' description='We will notify you as soon as your speaking band score is ready.' />;
  }

  if (feedbackStatus === 'error') {
    return (
      <StateContainer
        tone='error'
        title='We were unable to load your feedback.'
        description={feedbackError?.message ?? 'Please check your connection and try again.'}
        actionLabel='Try again'
        onAction={refetchFeedback}
      />
    );
  }

  if (feedbackStatus === 'pending' || !feedbackData) {
    return <StateContainer tone='info' title='Fetching feedback details' description='Just a moment while we prepare your speaking feedback.' />;
  }

  if (feedbackData.parts.length === 0) {
    return (
      <StateContainer tone='info' title='Feedback is not ready yet' description='Your speaking responses are still being evaluated. Please give it a little more time.' />
    );
  }

  return <SpeakingFeedbackView data={feedbackData} />;
}

interface SpeakingFeedbackViewProps {
  data: ISpeakingPracticeFeedback;
}

interface CriterionBreakdownInfo {
  name: string;
  score: number | null;
  feedback?: string;
  recommendation?: string;
}

interface CriterionInfo {
  key: string;
  title: string;
  description: string;
  score: number | null;
  feedback?: string;
  recommendation?: string;
  breakdown: CriterionBreakdownInfo[];
}

const DESCRIPTOR_META: Record<DescriptorKey, { key: CriterionInfo['key']; title: string; description: string }> = {
  'Fluency & Coherence': {
    key: 'fluency',
    title: 'Fluency & Coherence',
    description: 'Flow, coherence, and ability to develop ideas clearly.',
  },
  'Lexical Resource': {
    key: 'lexical',
    title: 'Lexical Resource',
    description: 'Vocabulary range, precision, and collocations.',
  },
  'Grammatical Range & Accuracy': {
    key: 'grammar',
    title: 'Grammatical Range & Accuracy',
    description: 'Control of grammar structures and sentence accuracy.',
  },
};

function mapDescriptorBreakdown(
  items: Array<{ name: string; score: number | null | undefined; feedback: string; recommendation: string }> | undefined
): CriterionBreakdownInfo[] {
  return (items ?? []).map(item => ({
    name: item.name,
    score: toScore(item.score),
    feedback: item.feedback,
    recommendation: item.recommendation,
  }));
}

function SpeakingFeedbackView({ data }: SpeakingFeedbackViewProps) {
  const shouldReduceMotion = useReducedMotion();
  const [activePartIndex, setActivePartIndex] = useState(0);
  const [openModal, setOpenModal] = useState<ModalKey | null>(null);
  const [activeCriterionIndex, setActiveCriterionIndex] = useState(0);
  const [displayScore, setDisplayScore] = useState(() => formatBandScore(data.score));
  const [topBarElevated, setTopBarElevated] = useState(false);
  const [showScrollHint, setShowScrollHint] = useState(false);
  const [criteriaScrollProgress, setCriteriaScrollProgress] = useState(0);
  const responseScrollRef = useRef<HTMLDivElement | null>(null);
  const criteriaContentRef = useRef<HTMLDivElement | null>(null);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const partOptions = useMemo(() => data.parts.map((_, index) => ({ key: index, label: `Part ${index + 1}` })), [data.parts]);

  const activePart = data.parts[activePartIndex] ?? data.parts[0];
  const generalFeedback = activePart.ml_output['General Feedback'];

  useEffect(() => {
    if (activePartIndex >= data.parts.length) {
      setActivePartIndex(0);
    }
  }, [activePartIndex, data.parts.length]);

  useEffect(() => {
    setActiveCriterionIndex(0);
  }, [activePartIndex]);

  const updateScrollIndicators = useCallback(() => {
    const node = responseScrollRef.current;
    if (!node) {
      setShowScrollHint(false);
      setTopBarElevated(false);
      return;
    }

    const hasOverflow = node.scrollHeight - node.clientHeight > 12;
    if (!hasOverflow) {
      setShowScrollHint(false);
      setTopBarElevated(false);
      return;
    }

    const reachedBottom = node.scrollTop + node.clientHeight >= node.scrollHeight - 16;
    setShowScrollHint(!reachedBottom);
    setTopBarElevated(node.scrollTop > 8);
  }, []);

  useEffect(() => {
    updateScrollIndicators();
    const node = responseScrollRef.current;
    if (!node) return;

    node.addEventListener('scroll', updateScrollIndicators);
    const handleResize = () => updateScrollIndicators();
    window.addEventListener('resize', handleResize);

    let observer: ResizeObserver | undefined;
    if (typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(() => updateScrollIndicators());
      observer.observe(node);
    }

    return () => {
      node.removeEventListener('scroll', updateScrollIndicators);
      window.removeEventListener('resize', handleResize);
      observer?.disconnect();
    };
  }, [updateScrollIndicators, activePart]);

  useEffect(() => {
    if (data.score === null || Number.isNaN(data.score)) {
      setDisplayScore('—');
      return;
    }

    if (shouldReduceMotion) {
      setDisplayScore(formatBandScore(data.score));
      return;
    }

    const controls = animate(0, data.score, {
      duration: 0.8,
      ease: 'easeOut',
      onUpdate: value => {
        setDisplayScore(formatBandScore(value));
      },
    });

    return () => {
      controls.stop();
    };
  }, [data.score, shouldReduceMotion]);

  const criteria = useMemo<CriterionInfo[]>(() => {
    if (!activePart) return [];

    const descriptorSources: DescriptorKey[] = ['Fluency & Coherence', 'Lexical Resource', 'Grammatical Range & Accuracy'];
    const result: CriterionInfo[] = [];

    descriptorSources.forEach(source => {
      const descriptor = activePart.ml_output[source];
      if (!descriptor) {
        return;
      }

      const meta = DESCRIPTOR_META[source];
      const breakdownItems = mapDescriptorBreakdown(
        (descriptor.breakdown ?? []) as Array<{ name: string; score: number | null | undefined; feedback: string; recommendation: string }>
      );

      result.push({
        key: meta.key,
        title: meta.title,
        description: meta.description,
        score: toScore(descriptor.score),
        feedback: descriptor.feedback,
        recommendation: descriptor.recommendation,
        breakdown: breakdownItems,
      });
    });

    return result;
  }, [activePart]);

  const availability = useMemo(
    () => ({
      summary: Boolean(generalFeedback.feedback || generalFeedback.recommendation || data.feedback),
      criteria: criteria.length > 0,
      ideal: true,
    }),
    [criteria.length, data.feedback, generalFeedback.feedback, generalFeedback.recommendation]
  );

  const bandVisual = useMemo(() => {
    if (data.score === null || Number.isNaN(data.score)) {
      return { gradient: 'from-slate-200 to-slate-100', text: 'text-slate-500' };
    }

    const found = scoreVisuals.find(visual => data.score >= visual.threshold);
    return found ?? scoreVisuals[scoreVisuals.length - 1];
  }, [data.score]);

  const nextSteps = useMemo(
    () => [
      {
        key: 'summary' as const,
        label: 'View feedback summary',
        icon: BookOpenCheck,
        variant: 'primary' as const,
        disabled: !availability.summary,
        action: () => setOpenModal('summary'),
      },
      {
        key: 'criteria' as const,
        label: 'View detailed feedback',
        icon: Lightbulb,
        variant: 'secondary' as const,
        disabled: !availability.criteria,
        action: () => setOpenModal('criteria'),
      },
      {
        key: 'ideal' as const,
        label: 'Check ideal response',
        icon: Sparkles,
        variant: 'tertiary' as const,
        disabled: !availability.ideal,
        action: () => setOpenModal('ideal'),
      },
    ],
    [availability.criteria, availability.summary, availability.ideal]
  );

  const handleCriterionTabsKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') {
        return;
      }

      event.preventDefault();
      const direction = event.key === 'ArrowRight' ? 1 : -1;
      const nextIndex = (activeCriterionIndex + direction + criteria.length) % criteria.length;
      setActiveCriterionIndex(nextIndex);
      tabRefs.current[nextIndex]?.focus();
    },
    [activeCriterionIndex, criteria.length]
  );

  const handleCriteriaContentScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    const target = event.currentTarget;
    const maxScroll = target.scrollHeight - target.clientHeight;
    if (maxScroll <= 0) {
      setCriteriaScrollProgress(1);
      return;
    }

    const progress = Math.min(1, Math.max(0, target.scrollTop / maxScroll));
    setCriteriaScrollProgress(progress);
  }, []);

  useEffect(() => {
    const node = criteriaContentRef.current;
    if (!node) return;
    const maxScroll = node.scrollHeight - node.clientHeight;
    if (maxScroll <= 0) {
      setCriteriaScrollProgress(1);
    } else {
      setCriteriaScrollProgress(Math.min(1, Math.max(0, node.scrollTop / maxScroll)));
    }
  }, [activeCriterionIndex, openModal]);

  const activeCriterion = criteria[activeCriterionIndex] ?? null;
  const transcripts = generalFeedback.transcription ?? [];

  return (
    <div className='relative flex min-h-[100dvh] flex-col bg-d-red-secondary'>
      <WritingFeedbackHeader topBarElevated={topBarElevated} title='Speaking Feedback' />

      <div className='flex-1'>
        <div
          className='mx-auto flex h-full w-full max-w-[1440rem] gap-[28rem] px-[40rem] pb-[28rem] pt-[24rem] tablet:px-[32rem]'
          style={{ height: 'calc(100dvh - 64rem)' }}
        >
          <section className='flex h-full flex-[0.68] flex-col overflow-hidden rounded-[28rem] bg-white shadow-[0_40rem_120rem_-60rem_rgba(64,75,172,0.35)]'>
            <header className='flex flex-wrap items-center justify-between gap-[16rem] border-b border-slate-100 px-[32rem] py-[24rem]'>
              <div className='flex flex-col gap-[6rem]'>
                <span className='text-[13rem] font-semibold uppercase tracking-[0.18em] text-slate-400'>Responses</span>
                <h2 className='text-[24rem] font-semibold text-slate-900'>Speaking feedback</h2>
                <div className='flex items-center gap-[12rem] text-[13rem] font-medium text-slate-500'>
                  <span>{formatBandScore(data.score)} overall band</span>
                  <span className='size-[6rem] rounded-full bg-slate-200' />
                  <span>{criteria.length} evaluated descriptors</span>
                </div>
              </div>
              {partOptions.length > 1 && (
                <nav className='flex items-center gap-[8rem] rounded-[999rem] border border-slate-200 bg-slate-50 p-[6rem]' aria-label='Speaking part selection'>
                  {partOptions.map(option => (
                    <button
                      key={option.key}
                      type='button'
                      onClick={() => setActivePartIndex(option.key)}
                      className={cn(
                        'rounded-[999rem] px-[18rem] py-[10rem] text-[13rem] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2',
                        option.key === activePartIndex ? 'bg-slate-900 text-white shadow-[0_8rem_20rem_-12rem_rgba(15,23,42,0.45)]' : 'text-slate-600 hover:bg-white'
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </nav>
              )}
            </header>

            <div className='relative flex flex-1 flex-col overflow-hidden px-[28rem] pb-[28rem] pt-[24rem]'>
              <div
                ref={responseScrollRef}
                className='relative h-full overflow-y-auto px-[12rem] pr-[24rem] scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-200 hover:scrollbar-thumb-slate-300'
                onScroll={updateScrollIndicators}
              >
                <div className='mx-auto flex w-full max-w-[90%] flex-col gap-[24rem] px-[12rem] py-[4rem] tablet:max-w-[92%]'>
                  <section className='flex flex-col gap-[20rem]'>
                    <div className='flex flex-col gap-[18rem]'>
                      {activePart.questions.map((question, index) => {
                        const transcriptLine = transcripts[index] ?? (index === 0 && transcripts.length > 0 ? transcripts.join('\n') : null);
                        return (
                          <article
                            key={`${question.question}-${index}`}
                            className='space-y-[14rem] rounded-[20rem] border border-slate-100 bg-[#F8FAFF] px-[24rem] py-[22rem]'
                          >
                            <p className='text-[16rem] font-medium leading-[1.45] text-slate-800'>{question.question}</p>
                            <audio controls className='w-full rounded-[12rem] bg-white'>
                              <source src={question.answer_audio} type='audio/webm' />
                              Your browser does not support the audio element.
                            </audio>
                            {transcriptLine && (
                              <div className='rounded-[16rem] border border-slate-100 bg-white px-[20rem] py-[16rem] text-[14rem] leading-[1.6] text-slate-700'>
                                <p className='text-[13rem] font-semibold uppercase tracking-[0.18em] text-slate-400'>Transcript</p>
                                <p className='mt-[8rem] whitespace-pre-wrap'>{transcriptLine}</p>
                              </div>
                            )}
                          </article>
                        );
                      })}
                    </div>
                  </section>
                </div>
              </div>
              <div
                aria-hidden='true'
                className={cn(
                  'pointer-events-none absolute bottom-[24rem] left-[28rem] right-[28rem] h-[88rem] rounded-b-[24rem] bg-gradient-to-t from-white via-white/75 to-transparent transition-opacity duration-300',
                  showScrollHint ? 'opacity-100' : 'opacity-0'
                )}
              />
            </div>
          </section>

          <aside className='flex h-full min-w-[340rem] flex-[0.32] flex-col gap-[24rem]'>
            <motion.section
              initial={{ opacity: shouldReduceMotion ? 1 : 0, y: shouldReduceMotion ? 0 : 16, backgroundPosition: '0% 50%' }}
              animate={{
                opacity: 1,
                y: 0,
                backgroundPosition: shouldReduceMotion ? '50% 50%' : ['0% 50%', '100% 50%', '0% 50%'],
              }}
              transition={{
                duration: shouldReduceMotion ? 0 : 0.5,
                ease: 'easeOut',
                backgroundPosition: {
                  duration: shouldReduceMotion ? 0 : 12,
                  ease: 'linear',
                  repeat: shouldReduceMotion ? 0 : Infinity,
                },
              }}
              className={cn(
                'relative overflow-hidden rounded-[28rem] px-[32rem] py-[28rem] text-white shadow-[0_30rem_80rem_-48rem_rgba(62,104,221,0.35)]',
                'bg-gradient-to-br',
                bandVisual.gradient,
                bandVisual.text
              )}
              style={{ backgroundSize: shouldReduceMotion ? undefined : '200% 200%' }}
            >
              <div className='flex flex-col gap-[12rem]'>
                <span className='text-[13rem] font-semibold uppercase tracking-[0.2em] opacity-80'>Overall band</span>
                <div className='flex items-end gap-[12rem]'>
                  <span className='text-[62rem] font-semibold leading-none'>{displayScore}</span>
                  <span className='pb-[8rem] text-[14rem] font-medium opacity-80'>IELTS estimate</span>
                </div>
                <p className='text-[13rem] font-medium opacity-75'>Band score generated against official IELTS speaking descriptors.</p>
              </div>
            </motion.section>

            <section className='flex flex-1 flex-col rounded-[28rem] border border-slate-100 bg-white px-[32rem] py-[28rem] shadow-[0_24rem_64rem_-48rem_rgba(46,67,139,0.25)]'>
              <header className='flex flex-col gap-[6rem]'>
                <span className='text-[13rem] font-semibold uppercase tracking-[0.2em] text-slate-400'>Next steps</span>
              </header>
              <nav className='mt-[24rem] flex flex-1 flex-col gap-[14rem]' aria-label='Next steps options'>
                {nextSteps.map(step => (
                  <StepButton key={step.key} icon={step.icon} label={step.label} variant={step.variant} disabled={step.disabled} onClick={step.action} />
                ))}
              </nav>
            </section>
          </aside>
        </div>
      </div>

      <ModalShell
        title='Detailed feedback by band'
        open={openModal === 'criteria'}
        onOpenChange={open => setOpenModal(open ? 'criteria' : null)}
        size='lg'
        contentRef={node => {
          criteriaContentRef.current = node;
          if (!node) {
            setCriteriaScrollProgress(0);
            return;
          }
          const maxScroll = node.scrollHeight - node.clientHeight;
          if (maxScroll <= 0) {
            setCriteriaScrollProgress(1);
          } else {
            setCriteriaScrollProgress(Math.min(1, Math.max(0, node.scrollTop / maxScroll)));
          }
        }}
        onContentScroll={handleCriteriaContentScroll}
        progressSlot={<ModalScrollProgress value={criteriaScrollProgress} label='Scroll progress' />}
      >
        {availability.criteria && activeCriterion ? (
          <div className='flex flex-col gap-[28rem]'>
            <div
              role='tablist'
              aria-label='Detailed feedback criteria'
              className='flex flex-wrap gap-[12rem] rounded-[22rem] border border-slate-100 bg-[#F4F6FF] p-[10rem]'
              onKeyDown={handleCriterionTabsKeyDown}
            >
              {criteria.map((criterion, index) => {
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
                        layoutId='speaking-criterion-tab-indicator'
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

                <div className='rounded-[24rem] border border-d-blue/25 bg-d-red-secondary/70 px-[24rem] py-[20rem] text-[15rem] leading-[1.65] text-d-black/80'>
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
                          {item.feedback && <p className='text-[14rem] leading-[1.6] text-slate-700'>{item.feedback}</p>}
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
      </ModalShell>

      <ModalShell title='Feedback summary' open={openModal === 'summary'} onOpenChange={open => setOpenModal(open ? 'summary' : null)}>
        <div className='flex flex-col gap-[24rem] text-[15rem] leading-[1.68] text-slate-700'>
          <SummarySection title='Overall impression'>
            {generalFeedback.feedback ? (
              <p className='whitespace-pre-wrap'>{generalFeedback.feedback}</p>
            ) : (
              <p className='text-[14rem] text-slate-500'>Overall feedback will appear here once the evaluation is complete.</p>
            )}
          </SummarySection>

          <SummarySection title='Recommendations'>
            {generalFeedback.recommendation ? (
              <p className='whitespace-pre-wrap'>{generalFeedback.recommendation}</p>
            ) : (
              <p className='text-[14rem] text-slate-500'>Recommendations will appear once this section is generated.</p>
            )}
          </SummarySection>

          <SummarySection title='Coach notes'>
            {data.feedback ? (
              <p className='whitespace-pre-wrap'>{data.feedback}</p>
            ) : (
              <p className='text-[14rem] text-slate-500'>Notes will appear once they are available.</p>
            )}
          </SummarySection>
        </div>
      </ModalShell>

      <ModalShell title='Ideal response example' open={openModal === 'ideal'} onOpenChange={open => setOpenModal(open ? 'ideal' : null)}>
        <div className='flex flex-col gap-[20rem]'>
          <p className='text-[14rem] font-medium text-slate-500'>Use this sample for inspiration—tailor your own response rather than copying it.</p>
          <article className='space-y-[16rem] rounded-[24rem] border border-slate-100 bg-[#F8FAFF] px-[24rem] py-[24rem] text-[15rem] leading-[1.7] text-slate-700'>
            {MOCK_IDEAL_RESPONSE.split(/\n{2,}/g).map((paragraph, index) => (
              <p key={index} className='whitespace-pre-wrap'>
                {paragraph.trim()}
              </p>
            ))}
          </article>
        </div>
      </ModalShell>
    </div>
  );
}

interface StepButtonProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  variant: 'primary' | 'secondary' | 'tertiary';
  disabled?: boolean;
  onClick: () => void;
}

function StepButton({ icon: Icon, label, variant, disabled, onClick }: StepButtonProps) {
  const baseClasses =
    'group flex min-h-[82rem] items-center justify-between gap-[16rem] rounded-[24rem] border px-[24rem] py-[20rem] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2';
  const variantClasses: Record<StepButtonProps['variant'], string> = {
    primary: 'border-transparent bg-gradient-to-r from-[#4F86F7] to-[#7C5CFF] text-white shadow-[0_24rem_48rem_-32rem_rgba(72,85,190,0.65)] hover:brightness-[1.04]',
    secondary: 'border-slate-200 bg-white text-slate-800 hover:bg-slate-50',
    tertiary: 'border-slate-100 bg-d-red-secondary text-slate-700 hover:bg-white',
  };
  const iconWrapperClasses: Record<StepButtonProps['variant'], string> = {
    primary: 'bg-white/20 text-white',
    secondary: 'bg-slate-100 text-slate-600',
    tertiary: 'bg-white text-slate-600',
  };

  return (
    <motion.button
      type='button'
      onClick={onClick}
      disabled={disabled}
      className={cn(
        baseClasses,
        disabled ? 'cursor-not-allowed border-slate-100 bg-slate-50 text-slate-300 hover:bg-slate-50 focus-visible:ring-0' : variantClasses[variant]
      )}
      whileHover={
        disabled
          ? undefined
          : {
              y: -4,
              scale: 1.01,
              boxShadow: variant === 'primary' ? '0 24px 56px -30px rgba(72,85,190,0.75)' : '0 18px 40px -32px rgba(15,23,42,0.35)',
            }
      }
      whileTap={disabled ? undefined : { scale: 0.99 }}
    >
      <span className='flex items-center gap-[16rem] text-left'>
        <span className={cn('mt-[2rem] rounded-[16rem] p-[10rem]', disabled ? 'bg-slate-100 text-slate-300' : iconWrapperClasses[variant])}>
          <Icon className='size-[18rem]' aria-hidden='true' />
        </span>
        <span className='text-[15rem] font-semibold leading-tight'>{label}</span>
      </span>
      <ChevronRight
        className={cn(
          'size-[18rem] transition-transform',
          disabled ? 'text-slate-300' : 'group-hover:translate-x-[4rem]',
          !disabled && variant === 'primary' ? 'text-white/80' : !disabled ? 'text-slate-500' : ''
        )}
        aria-hidden='true'
      />
    </motion.button>
  );
}

interface SummarySectionProps {
  title: string;
  children: React.ReactNode;
}

function SummarySection({ title, children }: SummarySectionProps) {
  return (
    <section className='flex flex-col gap-[14rem] rounded-[24rem] border border-slate-100 bg-white px-[26rem] py-[22rem] shadow-[0_18rem_40rem_-34rem_rgba(15,23,42,0.18)]'>
      <div className='flex flex-col gap-[8rem]'>
        <h4 className='text-[13rem] font-semibold uppercase tracking-[0.18em] text-slate-500'>{title}</h4>
        <div className='h-[1px] w-full bg-slate-100' />
      </div>
      <div className='text-[14rem] leading-[1.68] text-slate-700'>{children}</div>
    </section>
  );
}

type StateTone = 'info' | 'error';

interface StateContainerProps {
  tone: StateTone;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

function StateContainer({ tone, title, description, actionLabel, onAction }: StateContainerProps) {
  const iconStyles = tone === 'info' ? 'bg-slate-100 text-slate-500' : 'bg-[#FECACA] text-[#7F1D1D]';
  const iconSymbol = tone === 'info' ? 'i' : '!';

  return (
    <div className='flex min-h-[100dvh] items-center justify-center bg-d-red-secondary px-[24rem]'>
      <div className='flex max-w-[480rem] flex-col items-center gap-[16rem] rounded-[28rem] border border-dashed border-slate-200 bg-white px-[40rem] py-[48rem] text-center shadow-[0_24rem_80rem_-64rem_rgba(46,67,139,0.35)]'>
        <div className={'flex size-[56rem] items-center justify-center rounded-full text-[20rem] font-semibold ' + iconStyles}>{iconSymbol}</div>
        <h2 className='text-[22rem] font-semibold text-slate-900'>{title}</h2>
        <p className='text-[14rem] leading-[1.6] text-slate-500'>{description}</p>
        {actionLabel && onAction && (
          <button
            type='button'
            onClick={onAction}
            className='rounded-[14rem] bg-slate-900 px-[24rem] py-[12rem] text-[13rem] font-semibold text-white transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2'
          >
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
}

function formatBandScore(value: number | null | undefined): string {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return '—';
  }
  return Number(value).toFixed(1);
}

function toScore(value: number | null | undefined): number | null {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return null;
  }
  return Number(value.toFixed(1));
}

function badgeByScore(score: number | null): string {
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
}
