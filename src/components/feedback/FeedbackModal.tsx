'use client';

import { useEffect, useMemo, useState } from 'react';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

import { cn } from '@/lib/utils';

type FeedbackStep = 0 | 1 | 2 | 'success';

const EMOJI_SCALE = ['😞', '🙁', '😐', '🙂', '🤩'] as const;

const STEP_TITLES: Record<Exclude<FeedbackStep, 'success'>, string> = {
  0: "How's your Studybox experience so far?",
  1: 'What did you like the most?',
  2: 'Want to leave a short note?',
};

const STEP_DESCRIPTIONS: Record<Exclude<FeedbackStep, 'success'>, string> = {
  0: 'Your feedback helps us make the platform better.',
  1: 'Pick as many as you like.',
  2: 'Every message matters — feel free to share a few words.',
};

const OPTION_ITEMS = ['Reading or Listening', 'Writing', 'Speaking', 'AI feedback', 'Design', 'Other'] as const;

interface FeedbackModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit?: (payload: { rating: number | null; highlights: string[]; otherText: string; comment: string }) => Promise<void> | void;
  onSuccess?: () => void;
}

export function FeedbackModal({ open, onClose, onSubmit, onSuccess }: FeedbackModalProps) {
  const prefersReducedMotion = useReducedMotion();
  const [step, setStep] = useState<FeedbackStep>(0);
  const [rating, setRating] = useState<number | null>(null);
  const [highlights, setHighlights] = useState<string[]>([]);
  const [otherText, setOtherText] = useState('');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      setStep(0);
      setRating(null);
      setHighlights([]);
      setOtherText('');
      setComment('');
      setIsSubmitting(false);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, open]);

  useEffect(() => {
    if (step !== 'success') return undefined;

    const timeout = window.setTimeout(() => {
      onClose();
    }, 2400);

    return () => window.clearTimeout(timeout);
  }, [onClose, step]);

  const progressLabel = useMemo(() => {
    if (step === 'success') return 'Submitted';
    return `${step + 1}/3`;
  }, [step]);

  const progressValue = useMemo(() => {
    if (step === 'success') return 1;
    if (typeof step === 'number') {
      return (step + 1) / 3;
    }
    return 0;
  }, [step]);

  const toggleHighlight = (option: (typeof OPTION_ITEMS)[number]) => {
    setHighlights(prev => {
      if (prev.includes(option)) {
        if (option === 'Other') {
          setOtherText('');
        }
        return prev.filter(item => item !== option);
      }

      return [...prev, option];
    });
  };

  const handleNext = async () => {
    if (step === 0) {
      setStep(1);
      return;
    }

    if (step === 1) {
      setStep(2);
      return;
    }

    if (step === 2) {
      try {
        setIsSubmitting(true);
        await onSubmit?.({ rating, highlights, otherText: highlights.includes('Other') ? otherText : '', comment });
        setIsSubmitting(false);
        setStep('success');
        onSuccess?.();
      } catch (error) {
        setIsSubmitting(false);
      }
    }
  };

  const handleBack = () => {
    if (step === 0) {
      onClose();
      return;
    }

    if (step === 1) {
      setStep(0);
      return;
    }

    if (step === 2) {
      setStep(1);
      return;
    }
  };

  const isNextDisabled = useMemo(() => {
    if (step === 1) {
      if (highlights.length === 0) return true;
      if (highlights.includes('Other')) {
        return otherText.trim().length === 0;
      }
    }
    return false;
  }, [highlights, otherText, step]);

  const renderStepContent = () => {
    if (step === 'success') {
      return (
        <motion.div
          key='success'
          initial={{ opacity: prefersReducedMotion ? 1 : 0, scale: prefersReducedMotion ? 1 : 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: prefersReducedMotion ? 1 : 0, scale: prefersReducedMotion ? 1 : 0.96 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.38, ease: 'easeOut' }}
          className='flex flex-1 flex-col items-center justify-center gap-[18rem] px-[6rem] py-[16rem]'
        >
          <motion.span
            aria-hidden='true'
            className='flex size-[68rem] items-center justify-center rounded-full bg-gradient-to-br from-blue-500/15 via-blue-500/10 to-blue-500/20 text-blue-600 shadow-[0_24rem_60rem_-40rem_rgba(37,99,235,0.55)]'
            initial={{ scale: prefersReducedMotion ? 1 : 0.95, opacity: prefersReducedMotion ? 1 : 0 }}
            animate={{ scale: prefersReducedMotion ? 1 : [1, 1.08, 1], opacity: 1 }}
            transition={{ duration: prefersReducedMotion ? 0.3 : 1.4, ease: 'easeInOut', repeat: prefersReducedMotion ? 0 : Infinity, repeatType: 'mirror' }}
          >
            <svg width='28' height='28' viewBox='0 0 24 24' fill='none' aria-hidden='true' className='text-blue-600'>
              <motion.path
                d='M9.549 16.2 5.4 12l1.506-1.41 2.643 2.58 7.245-7.37L18.3 7.2 9.549 16.2Z'
                fill='currentColor'
                initial={{ pathLength: prefersReducedMotion ? 1 : 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: prefersReducedMotion ? 0.3 : 0.6, ease: 'easeOut' }}
              />
            </svg>
          </motion.span>
          <div className='flex flex-col items-center gap-[8rem] text-center'>
            <h2 className='text-[22rem] font-semibold text-slate-900'>Thank you for the feedback!</h2>
            <p className='text-[14rem] text-slate-500'>Your voice helps us grow.</p>
          </div>
          <motion.button
            type='button'
            onClick={onClose}
            className='rounded-full bg-blue-600 px-[26rem] py-[12rem] text-[13.5rem] font-semibold text-white shadow-[0_20rem_48rem_-28rem_rgba(37,99,235,0.6)] transition hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200 focus-visible:ring-offset-2'
            whileHover={prefersReducedMotion ? undefined : { scale: 1.02 }}
            whileTap={prefersReducedMotion ? undefined : { scale: 0.97 }}
          >
            Done
          </motion.button>
        </motion.div>
      );
    }

    if (step === 0) {
      return (
        <motion.div
          key='step-rating'
          initial={{ opacity: prefersReducedMotion ? 1 : 0, x: prefersReducedMotion ? 0 : 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: prefersReducedMotion ? 1 : 0, x: prefersReducedMotion ? 0 : -24 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.32, ease: 'easeOut' }}
          className='flex flex-1 flex-col items-center justify-center gap-[18rem] px-[6rem] py-[16rem]'
        >
          <div className='flex items-center justify-center gap-[12rem]'>
            {EMOJI_SCALE.map((emoji, index) => {
              const value = index - 2;
              const isActive = rating === value;
              return (
                <motion.button
                  key={emoji}
                  type='button'
                  onClick={() => setRating(value)}
                  className={cn(
                    'relative flex size-[58rem] items-center justify-center rounded-full bg-white/65 text-[24rem] shadow-[0_16rem_48rem_-36rem_rgba(37,99,235,0.45)] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200',
                    isActive ? 'text-blue-600 ring-2 ring-blue-400' : 'hover:bg-blue-50/60'
                  )}
                  whileHover={prefersReducedMotion ? undefined : { scale: 1.05 }}
                  whileTap={prefersReducedMotion ? undefined : { scale: 0.92 }}
                >
                  <span aria-hidden='true'>{emoji}</span>
                  <span className='sr-only'>Rating {value}</span>
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      );
    }

    if (step === 1) {
      const showOtherInput = highlights.includes('Other');
      return (
        <motion.div
          key='step-highlights'
          initial={{ opacity: prefersReducedMotion ? 1 : 0, x: prefersReducedMotion ? 0 : 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: prefersReducedMotion ? 1 : 0, x: prefersReducedMotion ? 0 : -24 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.32, ease: 'easeOut' }}
          className='flex flex-1 flex-col gap-[18rem] px-[6rem] py-[12rem]'
        >
          <div className='flex flex-wrap items-center gap-[12rem]'>
            {OPTION_ITEMS.map(option => {
              const isActive = highlights.includes(option);
              return (
                <motion.button
                  key={option}
                  type='button'
                  onClick={() => toggleHighlight(option)}
                  className={cn(
                    'select-none rounded-full border border-blue-100 px-[16rem] py-[8rem] text-[13rem] font-medium text-slate-600 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200',
                    isActive ? 'bg-blue-50 text-blue-600 shadow-[0_16rem_40rem_-36rem_rgba(37,99,235,0.5)]' : 'hover:bg-blue-50/50'
                  )}
                  whileHover={prefersReducedMotion ? undefined : { scale: 1.04 }}
                  whileTap={prefersReducedMotion ? undefined : { scale: 0.96 }}
                >
                  {option}
                </motion.button>
              );
            })}
          </div>
          <AnimatePresence initial={false}>
            {showOtherInput ? (
              <motion.div
                key='other-input'
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.28, ease: 'easeOut' }}
                className='w-full'
              >
                <input
                  value={otherText}
                  onChange={event => setOtherText(event.target.value)}
                  placeholder='Add a quick note...'
                  className='w-full rounded-[14rem] border border-blue-100 bg-white px-[16rem] py-[10rem] text-[13.5rem] text-slate-700 shadow-[0_10rem_30rem_-35rem_rgba(37,99,235,0.45)] outline-none transition focus:border-blue-300 focus-visible:ring-2 focus-visible:ring-blue-200'
                />
              </motion.div>
            ) : null}
          </AnimatePresence>
        </motion.div>
      );
    }

    return (
      <motion.div
        key='step-comment'
        initial={{ opacity: prefersReducedMotion ? 1 : 0, x: prefersReducedMotion ? 0 : 24 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: prefersReducedMotion ? 1 : 0, x: prefersReducedMotion ? 0 : -24 }}
        transition={{ duration: prefersReducedMotion ? 0 : 0.32, ease: 'easeOut' }}
        className='flex flex-1 flex-col gap-[12rem] px-[6rem]'
      >
        <textarea
          value={comment}
          onChange={event => setComment(event.target.value)}
          placeholder='Share a few words...'
          className='min-h-[120rem] w-full resize-none rounded-[18rem] border border-blue-100 bg-white px-[18rem] py-[16rem] text-[14rem] text-slate-700 shadow-[0_16rem_48rem_-38rem_rgba(37,99,235,0.45)] outline-none transition focus:border-blue-300 focus-visible:ring-2 focus-visible:ring-blue-200'
        />
        <p className='text-[12rem] text-slate-400'>Optional. You can send feedback without text.</p>
      </motion.div>
    );
  };

  const renderFooter = () => {
    if (step === 'success') {
      return null;
    }

    const isLastStep = step === 2;

    return (
      <div className='flex flex-col gap-[10rem]'>
        <div className='flex items-center justify-between text-[12rem] font-medium text-slate-400' aria-live='polite'>
          <span>step</span>
          <span>{progressLabel}</span>
        </div>
        <div className='h-[4rem] w-full overflow-hidden rounded-full bg-slate-100'>
          <motion.div
            className='h-full w-full rounded-full bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600'
            style={{ transformOrigin: 'left center' }}
            animate={{ scaleX: progressValue }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.4, ease: 'easeInOut' }}
          />
        </div>
        <div className='flex flex-col gap-[8rem] tablet:flex-row tablet:items-center tablet:justify-between'>
          {step !== 0 ? (
            <button
              type='button'
              onClick={handleBack}
              className='inline-flex w-full items-center justify-center rounded-full border border-slate-200 px-[16rem] py-[8rem] text-[12.5rem] font-medium text-slate-600 transition hover:border-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200 focus-visible:ring-offset-2 tablet:max-w-[100rem]'
            >
              Back
            </button>
          ) : (
            <span className='hidden tablet:block tablet:max-w-[140rem]' aria-hidden='true' />
          )}
          <div className='flex w-full items-center gap-[16rem] tablet:justify-end'>
            {step === 2 ? (
              <button type='button' onClick={() => setStep('success')} className='px-[16rem] text-[12.5rem] font-medium text-slate-400 transition hover:text-slate-500'>
                Skip
              </button>
            ) : (
              <button type='button' onClick={onClose} className='px-[16rem] text-[12.5rem] font-medium text-slate-400 transition hover:text-slate-500'>
                Later
              </button>
            )}
            <motion.button
              type='button'
              onClick={handleNext}
              disabled={(step === 0 && rating === null) || isNextDisabled || isSubmitting}
              whileHover={prefersReducedMotion ? undefined : { scale: 1.02 }}
              whileTap={prefersReducedMotion ? undefined : { scale: 0.97 }}
              className='inline-flex min-w-[100rem] items-center justify-center rounded-full bg-blue-600 px-[22rem] py-[8rem] text-[13rem] font-semibold text-white shadow-[0_20rem_48rem_-28rem_rgba(37,99,235,0.55)] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-blue-400/70'
            >
              <span className='flex items-center gap-[8rem]'>
                {isLastStep ? (isSubmitting ? 'Sending…' : 'Submit') : 'Next'}
                {isSubmitting ? <span className='h-[14rem] w-[14rem] animate-spin rounded-full border-[2rem] border-white/40 border-t-white' aria-hidden='true' /> : null}
              </span>
            </motion.button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          key='feedback-overlay'
          initial={{ opacity: prefersReducedMotion ? 1 : 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: prefersReducedMotion ? 1 : 0 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.28, ease: 'easeOut' }}
          className='fixed inset-0 z-[2100] flex items-center justify-center bg-slate-900/35 px-[16rem] backdrop-blur-md'
          onClick={onClose}
        >
          <motion.div
            onClick={event => event.stopPropagation()}
            initial={{ opacity: prefersReducedMotion ? 1 : 0, scale: prefersReducedMotion ? 1 : 0.96, y: prefersReducedMotion ? 0 : 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: prefersReducedMotion ? 1 : 0, scale: prefersReducedMotion ? 1 : 0.96, y: prefersReducedMotion ? 0 : 12 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.32, ease: 'easeOut' }}
            className='relative flex w-full max-w-[540rem] flex-col gap-[20rem] rounded-[28rem] bg-white/95 p-[28rem] shadow-[0_52rem_140rem_-80rem_rgba(37,99,235,0.45)] ring-1 ring-blue-100'
          >
            <header className='flex flex-col gap-[10rem] text-left'>
              <p className='text-[11.5rem] font-medium uppercase tracking-[0.14em] text-blue-500/80'>feedback</p>
              <h2 className='text-[24rem] font-semibold text-slate-900' aria-live='polite'>
                {step === 'success' ? 'Thank you for the feedback!' : STEP_TITLES[step]}
              </h2>
              {step === 'success' ? (
                <p className='text-[14rem] text-slate-500'>Your voice helps us grow.</p>
              ) : (
                <p className='text-[14rem] leading-[1.5] text-slate-500'>{STEP_DESCRIPTIONS[step]}</p>
              )}
            </header>
            <div className='flex flex-1 flex-col'>
              <AnimatePresence mode='wait'>{renderStepContent()}</AnimatePresence>
            </div>
            {renderFooter()}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
