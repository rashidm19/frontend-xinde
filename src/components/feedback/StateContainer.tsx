'use client';

import { useEffect, useMemo, useState } from 'react';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useRouter } from 'next/navigation';

type Tone = 'info' | 'error';
type Section = 'speaking' | 'writing';

interface StateContainerProps {
  tone: Tone;
  title: string;
  color: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  section?: Section;
  primaryLabel?: string;
  secondaryLabel?: string;
  statusMessages?: string[];
}

const DEFAULT_STATUS_MESSAGES: Record<Section, string[]> = {
  speaking: ['Checking pronunciation clarity…', 'Assessing lexical range…', 'Analyzing coherence and fluency…', 'Comparing against IELTS descriptors…'],
  writing: ['Reviewing task fulfillment…', 'Evaluating lexical variety…', 'Assessing coherence and cohesion…', 'Comparing against IELTS descriptors…'],
};

export function StateContainer({
  tone,
  title,
  color = 'bg-d-blue-secondary',
  description,
  actionLabel,
  onAction,
  section = 'speaking',
  primaryLabel,
  secondaryLabel,
  statusMessages,
}: StateContainerProps) {
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();

  if (tone !== 'info') {
    const iconStyles = 'bg-[#FECACA] text-[#7F1D1D]';
    return (
      <div className={`flex min-h-[100dvh] items-center justify-center ${color} px-[24rem]`}>
        <div className='flex max-w-[480rem] flex-col items-center gap-[16rem] rounded-[28rem] border border-dashed border-slate-200 bg-white px-[40rem] py-[48rem] text-center shadow-[0_24rem_80rem_-64rem_rgba(46,67,139,0.35)]'>
          <div className={'flex size-[56rem] items-center justify-center rounded-full text-[20rem] font-semibold ' + iconStyles}>!</div>
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

  const resolvedStatusMessages = statusMessages ?? DEFAULT_STATUS_MESSAGES[section];
  const helperLine =
    section === 'writing'
      ? 'Our AI is analyzing your IELTS writing performance using official scoring criteria.'
      : 'Our AI is analyzing your IELTS speaking performance using official scoring criteria.';

  return (
    <div className={`flex min-h-[100dvh] items-center justify-center ${color} px-[24rem]`}>
      <div className='flex max-w-[480rem] flex-col items-center gap-[24rem] rounded-[28rem] border border-dashed border-slate-200 bg-white px-[40rem] py-[48rem] text-center shadow-[0_24rem_80rem_-64rem_rgba(46,67,139,0.35)]'>
        <AiLoader reducedMotion={!!shouldReduceMotion} />
        <motion.div
          initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={shouldReduceMotion ? undefined : { duration: 0.5, ease: 'easeOut', delay: 0.1 }}
        >
          <h2 className='text-[24rem] font-semibold text-slate-900'>Evaluating your response…</h2>
        </motion.div>
        <motion.div
          className='space-y-[6rem]'
          initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={shouldReduceMotion ? undefined : { duration: 0.5, ease: 'easeOut', delay: 0.2 }}
        >
          <p className='text-[15rem] text-slate-600'>{helperLine}</p>
          <p className='text-[15rem] text-slate-600'>You can wait here or come back to view your feedback later.</p>
        </motion.div>
        <StatusMarquee reducedMotion={!!shouldReduceMotion} messages={resolvedStatusMessages} />
        <ActionButtons reducedMotion={!!shouldReduceMotion} primaryLabel={primaryLabel} secondaryLabel={secondaryLabel} onGoToProfile={() => router.push('/profile')} />
      </div>
    </div>
  );
}

interface AiLoaderProps {
  reducedMotion: boolean;
}

function AiLoader({ reducedMotion }: AiLoaderProps) {
  return (
    <motion.div
      className='relative flex size-[82rem] items-center justify-center'
      initial={reducedMotion ? { opacity: 1 } : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={reducedMotion ? undefined : { duration: 0.6, ease: 'easeOut' }}
      aria-hidden='true'
    >
      <motion.span
        className='absolute inset-0 rounded-full border-[3rem] border-d-blue/40 border-t-transparent'
        animate={
          reducedMotion
            ? undefined
            : {
                rotate: [0, 360],
              }
        }
        transition={reducedMotion ? undefined : { duration: 10, ease: 'linear', repeat: Infinity }}
      />
      <motion.span
        className='absolute inset-[16rem] rounded-full border border-d-violet/20'
        animate={
          reducedMotion
            ? undefined
            : {
                scale: [1, 1.08, 1],
                opacity: [0.6, 1, 0.6],
              }
        }
        transition={reducedMotion ? undefined : { duration: 3, ease: 'easeInOut', repeat: Infinity }}
      />
      <motion.span
        className='size-[22rem] rounded-full bg-gradient-to-br from-d-blue/80 via-d-violet to-d-violet-secondary'
        animate={
          reducedMotion
            ? undefined
            : {
                scale: [1, 1.12, 1],
                opacity: [1, 0.8, 1],
              }
        }
        transition={reducedMotion ? undefined : { duration: 2.8, ease: 'easeInOut', repeat: Infinity }}
      />
      <span className='sr-only'>Evaluating in progress</span>
    </motion.div>
  );
}

interface StatusMarqueeProps {
  reducedMotion: boolean;
  messages: string[];
}

function StatusMarquee({ reducedMotion, messages }: StatusMarqueeProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (reducedMotion) return;

    const interval = window.setInterval(() => {
      setIndex(prev => (prev + 1) % messages.length);
    }, 4200);

    return () => window.clearInterval(interval);
  }, [messages.length, reducedMotion]);

  const currentMessage = useMemo(() => messages[index], [index, messages]);

  return (
    <motion.div
      className='flex w-full flex-col gap-[18rem]'
      initial={reducedMotion ? { opacity: 1 } : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={reducedMotion ? undefined : { duration: 0.5, ease: 'easeOut', delay: 0.3 }}
    >
      <div className='relative h-[6rem] w-full overflow-hidden rounded-full bg-slate-200'>
        <motion.span
          className='absolute inset-y-0 w-1/2 rounded-full bg-gradient-to-r from-d-blue/40 via-d-violet/60 to-d-violet'
          animate={reducedMotion ? undefined : { x: ['-110%', '110%'] }}
          transition={reducedMotion ? undefined : { duration: 3.4, ease: 'linear', repeat: Infinity }}
        />
      </div>
      <div role='status' aria-live='polite' className='relative h-[24rem]'>
        <AnimatePresence mode='wait'>
          <motion.p
            key={currentMessage}
            initial={{ opacity: reducedMotion ? 1 : 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: reducedMotion ? 1 : 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.5, ease: 'easeOut' }}
            className='text-[14rem] font-medium text-slate-500'
          >
            {currentMessage}
          </motion.p>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

interface ActionButtonsProps {
  reducedMotion: boolean;
  onGoToProfile: () => void;
  primaryLabel?: string;
  secondaryLabel?: string;
}

function ActionButtons({ reducedMotion, onGoToProfile, primaryLabel, secondaryLabel }: ActionButtonsProps) {
  const primaryText = primaryLabel ?? 'Go to Profile';
  const secondaryText = secondaryLabel ?? 'Stay here and wait';

  return (
    <motion.div
      className='flex w-full flex-col gap-[12rem]'
      initial={reducedMotion ? { opacity: 1 } : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={reducedMotion ? undefined : { duration: 0.5, ease: 'easeOut', delay: 0.4 }}
    >
      <motion.button
        type='button'
        onClick={onGoToProfile}
        className='rounded-[16rem] bg-d-violet px-[24rem] py-[16rem] text-[15rem] font-semibold text-white shadow-[0_20rem_48rem_-28rem_rgba(80,85,200,0.6)] transition hover:bg-d-violet/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-d-violet focus-visible:ring-offset-2 focus-visible:ring-offset-white'
        whileHover={reducedMotion ? undefined : { scale: 1.02 }}
        whileTap={reducedMotion ? undefined : { scale: 0.98 }}
      >
        {primaryText}
      </motion.button>
      <motion.button
        type='button'
        className='text-[14rem] font-medium text-slate-500 underline-offset-4 transition hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white'
        whileHover={reducedMotion ? undefined : { opacity: 0.85 }}
      >
        {secondaryText}
      </motion.button>
    </motion.div>
  );
}
