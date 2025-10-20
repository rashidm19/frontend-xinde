'use client';

import { type ReactNode, useCallback, useMemo, useRef, useState } from 'react';

import { motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft, BookOpenCheck, BookOpenText, CircleHelp, Clock3, LogOut, Sparkles, Table } from 'lucide-react';
import { useRouter } from 'next/navigation';

import type { AnswerSheetQuestion, BandMappingEntry, ReviewListHandle } from '@/components/answer-sheets';
import { AnswersGrid, BandMappingModal, DEFAULT_BAND_MAPPING, LegendTooltip, MistakesReviewModal, ResultOverview, ReviewList } from '@/components/answer-sheets';
import type { PracticeReadingResult } from '@/types/PracticeReading';

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

export function ReadingAnswerSheet({ data, locale, meta, bandMapping, onRetry }: ReadingAnswerSheetProps) {
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion() ?? false;
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [bandModalOpen, setBandModalOpen] = useState(false);
  const reviewListRef = useRef<ReviewListHandle>(null);

  const total = data.questions.length;

  const normalizedQuestions = useMemo<AnswerSheetQuestion[]>(() => {
    return data.questions.map((question, index) => {
      const hasAnswer = typeof question.answer === 'string' && question.answer.trim().length > 0;
      const status = hasAnswer ? (question.correct ? 'correct' : 'incorrect') : 'unanswered';
      return {
        number: index + 1,
        status,
        answer: hasAnswer ? (question.answer ?? null) : null,
        correctAnswer: question.correct_answer ?? null,
        detailHint: null,
      } satisfies AnswerSheetQuestion;
    });
  }, [data.questions]);

  const correctCount = useMemo(() => {
    if (typeof data.correct_answers_count === 'number') {
      return data.correct_answers_count;
    }
    return normalizedQuestions.filter(question => question.status === 'correct').length;
  }, [data.correct_answers_count, normalizedQuestions]);

  const hasAnyAnswers = useMemo(() => normalizedQuestions.some(question => question.status !== 'unanswered'), [normalizedQuestions]);

  const mistakeQuestions = useMemo(() => normalizedQuestions.filter(question => question.status !== 'correct'), [normalizedQuestions]);

  const effectiveBandMapping = useMemo(() => (bandMapping?.length ? bandMapping : DEFAULT_BAND_MAPPING), [bandMapping]);

  const metaItems = useMemo(() => {
    const items: { icon: ReactNode; label: string }[] = [];
    const title = data.title ?? meta?.testName ?? null;
    if (title) {
      items.push({
        icon: <BookOpenText className='size-[16rem]' aria-hidden='true' />,
        label: title,
      });
    }

    if (typeof meta?.elapsedMinutes === 'number' && !Number.isNaN(meta.elapsedMinutes)) {
      items.push({
        icon: <Clock3 className='size-[16rem]' aria-hidden='true' />,
        label: `${meta.elapsedMinutes} min`,
      });
    }

    return items;
  }, [data.title, meta?.elapsedMinutes, meta?.testName]);

  const metaDescription = useMemo(() => {
    const completedAt = meta?.takenAt ?? data.completed_at;
    if (!completedAt) {
      return null;
    }

    const parsed = new Date(completedAt);
    if (Number.isNaN(parsed.getTime())) {
      return null;
    }

    return `Completed ${parsed.toLocaleString()}`;
  }, [data.completed_at, meta?.takenAt]);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleExit = useCallback(() => {
    router.push(`/${locale}/profile`);
  }, [locale, router]);

  const handleRetry = useCallback(() => {
    if (onRetry) {
      onRetry();
      return;
    }
    router.push(`/${locale}/practice/reading/rules`);
  }, [locale, onRetry, router]);

  const handleQuestionSelect = useCallback((questionNumber: number) => {
    reviewListRef.current?.focusQuestion(questionNumber);
  }, []);

  return (
    <div className='relative min-h-screen bg-gradient-to-b from-[#EEF3FF] via-white to-white'>
      <div className='mx-auto flex w-full max-w-[1240rem] flex-col gap-[28rem] px-[28rem] pb-[64rem] pt-[36rem] tablet:px-[40rem] desktop:px-[56rem]'>
        <header className='flex flex-wrap items-center justify-between gap-[16rem] rounded-[28rem] border border-white/40 bg-white/70 px-[24rem] py-[18rem] shadow-[0_20rem_50rem_-40rem_rgba(62,88,189,0.55)] backdrop-blur'>
          <nav aria-label='Page navigation' className='flex items-center gap-[12rem]'>
            <button
              type='button'
              onClick={handleBack}
              className='inline-flex items-center gap-[10rem] rounded-[18rem] border border-slate-200 bg-white px-[16rem] py-[10rem] text-[13rem] font-semibold text-slate-600 transition hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2'
            >
              <ArrowLeft className='size-[16rem]' aria-hidden='true' />
              Back to tasks
            </button>
          </nav>
          <div className='flex flex-col items-center gap-[6rem] text-center'>
            <span className='text-[13rem] font-semibold uppercase tracking-[0.22em] text-slate-400'>Reading results</span>
            <h1 className='text-[20rem] font-semibold text-slate-900 tablet:text-[22rem]'>Answer sheet</h1>
          </div>
          <div className='flex items-center gap-[12rem]'>
            <div className='inline-flex items-center gap-[10rem] rounded-[20rem] border border-slate-200 bg-white px-[18rem] py-[10rem] text-[13rem] font-semibold text-slate-600 shadow-[0_18rem_32rem_-26rem_rgba(27,52,129,0.4)]'>
              <span className='rounded-[12rem] bg-slate-900 px-[12rem] py-[6rem] text-white'>Reading</span>
              <span>{total} questions</span>
            </div>
            <button
              type='button'
              onClick={handleExit}
              className='inline-flex items-center gap-[8rem] rounded-[18rem] border border-slate-200 bg-white px-[18rem] py-[10rem] text-[13rem] font-semibold text-slate-600 transition hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2'
            >
              Exit
              <LogOut className='size-[16rem]' aria-hidden='true' />
            </button>
          </div>
        </header>

        <ResultOverview
          icon={<BookOpenCheck className='size-[26rem]' aria-hidden='true' />}
          accentLabel='Reading'
          accentValue={`${total} questions`}
          correctCount={correctCount}
          totalCount={total}
          metaItems={metaItems}
          metaDescription={metaDescription}
          contextDescription={null}
          shouldReduceMotion={shouldReduceMotion}
        />

        <section className='space-y-[20rem]'>
          <header className='flex flex-wrap items-center justify-between gap-[16rem]'>
            <div className='flex items-center gap-[12rem]'>
              <span className='text-[15rem] font-semibold text-slate-900'>Answers overview</span>
              <span className='rounded-[18rem] bg-white px-[14rem] py-[6rem] text-[12rem] font-semibold uppercase tracking-[0.2em] text-slate-500 shadow-[0_12rem_24rem_-20rem_rgba(34,51,120,0.35)]'>
                Quick scan
              </span>
            </div>
            <LegendTooltip shouldReduceMotion={shouldReduceMotion} />
          </header>
          <AnswersGrid questions={normalizedQuestions} shouldReduceMotion={shouldReduceMotion} onQuestionSelect={handleQuestionSelect} />
        </section>

        <ReviewList
          ref={reviewListRef}
          questions={normalizedQuestions}
          shouldReduceMotion={shouldReduceMotion}
          emptyStateMessage='Nothing to review here. Switch filters or explore another test.'
          renderQuestionBody={question => (
            <div className='mt-[18rem] space-y-[14rem] rounded-[22rem] border border-slate-100 bg-[#F8FAFF] px-[20rem] py-[16rem] text-[14rem] text-slate-600'>
              <p className='font-semibold text-slate-900'>Correct answer: {question.correctAnswer ?? '—'}</p>
              <p className='text-slate-600'>Your answer: {question.answer ?? '—'}</p>
              {question.detailHint ? (
                <div className='rounded-[18rem] border border-dashed border-slate-200 bg-white px-[18rem] py-[14rem] text-[13rem] text-slate-500'>
                  {question.detailHint}
                </div>
              ) : null}
            </div>
          )}
        />

        <section className='grid gap-[18rem] tablet:grid-cols-2'>
          <motion.article
            whileHover={shouldReduceMotion ? undefined : { y: -4, scale: 1.01 }}
            className='flex flex-col gap-[14rem] rounded-[28rem] border border-slate-100 bg-white px-[24rem] py-[24rem] shadow-[0_30rem_60rem_-46rem_rgba(48,60,128,0.45)]'
          >
            <div className='flex items-center gap-[12rem]'>
              <CircleHelp className='size-[18rem] text-rose-500' aria-hidden='true' />
              <div className='flex flex-col'>
                <span className='text-[15rem] font-semibold text-slate-900'>Review mistakes only</span>
                <p className='text-[13rem] text-slate-500'>Focus on incorrect and skipped questions in one place.</p>
              </div>
            </div>
            <button
              type='button'
              onClick={() => setReviewModalOpen(true)}
              className='self-start rounded-[18rem] bg-slate-900 px-[20rem] py-[10rem] text-[13rem] font-semibold text-white shadow-[0_20rem_40rem_-28rem_rgba(22,36,96,0.55)] transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2'
            >
              Open mistake review
            </button>
          </motion.article>

          <motion.article
            whileHover={shouldReduceMotion ? undefined : { y: -4, scale: 1.01 }}
            className='flex flex-col gap-[14rem] rounded-[28rem] border border-slate-100 bg-white px-[24rem] py-[24rem] shadow-[0_30rem_60rem_-46rem_rgba(48,60,128,0.45)]'
          >
            <div className='flex items-center gap-[12rem]'>
              <Table className='size-[18rem] text-slate-600' aria-hidden='true' />
              <div className='flex flex-col'>
                <span className='text-[15rem] font-semibold text-slate-900'>View band mapping</span>
                <p className='text-[13rem] text-slate-500'>See how correct answers align with estimated IELTS bands.</p>
              </div>
            </div>
            <button
              type='button'
              onClick={() => setBandModalOpen(true)}
              className='self-start rounded-[18rem] border border-slate-200 bg-white px-[20rem] py-[10rem] text-[13rem] font-semibold text-slate-600 transition hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2'
            >
              Open band mapping
            </button>
          </motion.article>

          <motion.article
            whileHover={shouldReduceMotion ? undefined : { y: -4, scale: 1.01 }}
            className='flex flex-col gap-[14rem] rounded-[28rem] border border-transparent bg-gradient-to-br from-[#4F86F7] to-[#7C5CFF] px-[24rem] py-[24rem] text-white shadow-[0_40rem_80rem_-50rem_rgba(64,80,200,0.75)] tablet:col-span-2'
          >
            <div className='flex items-center gap-[12rem]'>
              <Sparkles className='size-[20rem]' aria-hidden='true' />
              <div className='flex flex-col'>
                <span className='text-[15rem] font-semibold'>Try another Reading test</span>
                <p className='text-[13rem] text-white/80'>Keep practicing while the insights are fresh.</p>
              </div>
            </div>
            <div className='flex flex-wrap items-center gap-[12rem]'>
              <button
                type='button'
                onClick={handleRetry}
                className='rounded-[18rem] bg-white px-[22rem] py-[12rem] text-[13rem] font-semibold text-slate-900 shadow-[0_20rem_40rem_-32rem_rgba(54,72,180,0.65)] transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent'
              >
                Start new test
              </button>
              <span className='text-[12rem] text-white/80'>Reset mindset · Build timing · Track improvements</span>
            </div>
          </motion.article>
        </section>

        {!hasAnyAnswers ? (
          <section className='rounded-[28rem] border border-slate-100 bg-white px-[28rem] py-[32rem] text-center text-[14rem] text-slate-600'>
            You didn’t submit answers yet. Jump back into the practice test when ready.
            <div className='mt-[18rem] flex justify-center'>
              <button
                type='button'
                onClick={handleRetry}
                className='rounded-[18rem] bg-slate-900 px-[20rem] py-[10rem] text-[13rem] font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2'
              >
                Resume practice
              </button>
            </div>
          </section>
        ) : null}
      </div>

      <MistakesReviewModal open={reviewModalOpen} onOpenChange={open => setReviewModalOpen(open)} questions={mistakeQuestions} />

      <BandMappingModal
        open={bandModalOpen}
        onOpenChange={open => setBandModalOpen(open)}
        bandMapping={effectiveBandMapping}
        correctCount={correctCount}
        shouldReduceMotion={shouldReduceMotion}
      />
    </div>
  );
}

export function ReadingAnswerSheetSkeleton() {
  return (
    <div className='relative min-h-[40vh] animate-pulse space-y-[24rem] rounded-[32rem] bg-gradient-to-b from-white to-slate-50 p-[24rem]'>
      <div className='h-[120rem] rounded-[24rem] bg-slate-200/60' />
      <div className='h-[180rem] rounded-[24rem] bg-slate-200/50' />
      <div className='h-[280rem] rounded-[24rem] bg-slate-200/40' />
    </div>
  );
}

export function ReadingAnswerSheetError({ onRetry }: { onRetry?: () => void }) {
  return (
    <div className='flex flex-col items-center justify-center gap-[14rem] rounded-[28rem] border border-rose-100 bg-rose-50 px-[32rem] py-[40rem] text-center text-[14rem] text-rose-700'>
      Something went wrong while loading your reading results.
      {onRetry ? (
        <button
          type='button'
          onClick={onRetry}
          className='rounded-[18rem] border border-rose-200 bg-white px-[20rem] py-[10rem] text-[13rem] font-semibold text-rose-600 transition hover:text-rose-800'
        >
          Retry
        </button>
      ) : null}
    </div>
  );
}
