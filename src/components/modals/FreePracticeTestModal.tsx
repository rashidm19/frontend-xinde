'use client';

import { useEffect, useRef, useState } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { CheckCircle2, PenSquare } from 'lucide-react';

interface FreePracticeTestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStart?: () => void | Promise<void>;
  onDismiss?: () => void;
  hasFreeTest: boolean;
}

const OVERLAY_CLASSNAME = 'fixed inset-0 z-[2000] bg-slate-900/35 backdrop-blur-sm';

const CARD_CLASSNAME =
  'relative flex w-[min(92vw,440rem)] flex-col gap-[18rem] rounded-[28rem] border border-[#E6EBFF] bg-[#F7F9FF] px-[32rem] py-[30rem] shadow-[0_26rem_48rem_-44rem_rgba(34,52,120,0.55)] focus-visible:outline-none focus-visible:ring-[3rem] focus-visible:ring-[#5B6CFF]/65';

const CTA_CLASSNAME =
  'inline-flex w-full items-center justify-center rounded-full bg-[#1E2A78] px-[26rem] py-[11rem] text-[14rem] font-semibold text-white transition hover:bg-gradient-to-r hover:from-[#1E2A78] hover:to-[#263088] hover:shadow-[0_16rem_32rem_-22rem_rgba(32,52,120,0.55)] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#636AFB] focus-visible:ring-offset-2';

export function FreePracticeTestModal({ open, onOpenChange, onStart, onDismiss, hasFreeTest }: FreePracticeTestModalProps) {
  const prefersReducedMotion = useReducedMotion();
  const closingReasonRef = useRef<'start' | 'dismiss' | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [showPulse, setShowPulse] = useState(false);

  useEffect(() => {
    if (!open) {
      setIsStarting(false);
      setShowPulse(false);
    }
  }, [open]);

  const closeWithReason = (reason: 'start' | 'dismiss') => {
    closingReasonRef.current = reason;
    onOpenChange(false);
  };

  const handleModalOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      if (closingReasonRef.current !== 'start') {
        onDismiss?.();
      }
      closingReasonRef.current = null;
    } else {
      closingReasonRef.current = null;
    }

    onOpenChange(nextOpen);
  };

  const handleStart = async () => {
    if (isStarting) return;
    closingReasonRef.current = 'start';
    setIsStarting(true);
    setShowPulse(true);

    try {
      await onStart?.();
      onOpenChange(false);
    } catch (error) {
      // не падаем — просто откатываем визуальные состояния
      console.error('Failed to start writing practice', error);
      closingReasonRef.current = null;
      setIsStarting(false);
      if (prefersReducedMotion) {
        setShowPulse(false);
      } else {
        window.setTimeout(() => setShowPulse(false), 220);
      }
    }
  };

  const overlayMotion = prefersReducedMotion
    ? { initial: { opacity: 1 }, animate: { opacity: 1 }, exit: { opacity: 1 } }
    : { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } };

  const cardMotion = prefersReducedMotion
    ? { initial: { opacity: 1, scale: 1 }, animate: { opacity: 1, scale: 1 }, exit: { opacity: 1, scale: 1 } }
    : {
        initial: { opacity: 0, scale: 0.96 },
        animate: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: 'easeOut' } },
        exit: { opacity: 0, scale: 0.96, transition: { duration: 0.24, ease: 'easeIn' } },
      };

  const writingCardMotion = prefersReducedMotion
    ? {}
    : {
        whileHover: { translateY: -4, boxShadow: '0 26rem 52rem -46rem rgba(36,60,140,0.55)' },
        whileTap: { scale: 0.985 },
      };

  const UsedState = () => (
    <div className='flex flex-col items-center gap-[20rem]'>
      <div className='flex flex-col gap-[8rem] text-center'>
        <DialogPrimitive.Title className='text-[20rem] font-semibold text-slate-900'>Free practice test</DialogPrimitive.Title>
        <DialogPrimitive.Description className='text-[13rem] leading-[1.6] text-slate-600'>
          You’ve already used your free IELTS practice test.
        </DialogPrimitive.Description>
      </div>
      <div className='flex size-[68rem] items-center justify-center rounded-full bg-slate-200/65 text-[#4757B8]'>
        <CheckCircle2 className='size-[30rem]' aria-hidden='true' />
      </div>
      <button
        type='button'
        onClick={() => closeWithReason('dismiss')}
        className='rounded-full bg-slate-900 px-[26rem] py-[11rem] text-[14rem] font-semibold text-white transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2'
      >
        Close
      </button>
    </div>
  );

  const FreeState = () => (
    <div className='flex flex-col items-stretch gap-[20rem]'>
      <div className='flex items-start justify-between gap-[12rem]'>
        <div className='flex flex-col gap-[8rem]'>
          <DialogPrimitive.Title className='text-[22rem] font-semibold text-slate-900'>Welcome to StudyBox!</DialogPrimitive.Title>
          <DialogPrimitive.Description className='text-[13rem] leading-[1.6] text-slate-600'>
            You have 1 free Writing Practice — start your first test now.
          </DialogPrimitive.Description>
        </div>

        <DialogPrimitive.Close asChild>
          <button
            type='button'
            aria-label='Close modal'
            className='rounded-full border border-slate-200 bg-white p-[9rem] text-slate-500 transition hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2'
            onClick={() => closeWithReason('dismiss')}
          >
            <svg viewBox='0 0 24 24' className='size-[16rem]' aria-hidden='true'>
              <path
                d='M6.225 5.175a.75.75 0 0 0-1.05 1.05L10.95 12l-5.775 5.775a.75.75 0 0 0 1.05 1.05L12 13.05l5.775 5.775a.75.75 0 0 0 1.05-1.05L13.05 12l5.775-5.775a.75.75 0 1 0-1.05-1.05L12 10.95 6.225 5.175Z'
                fill='currentColor'
              />
            </svg>
          </button>
        </DialogPrimitive.Close>
      </div>

      <motion.div
        className='flex items-center gap-[18rem] rounded-[22rem] border border-[#E0E6FF] bg-[#EEF3FF] px-[24rem] py-[18rem]'
        {...writingCardMotion}
        transition={{ duration: 0.22, ease: 'easeOut' }}
      >
        <span className='flex size-[48rem] items-center justify-center rounded-[16rem] bg-d-blue-secondary text-[#1A5E78]'>
          <PenSquare className='size-[21rem]' aria-hidden='true' />
        </span>
        <div className='flex flex-1 flex-col gap-[6rem]'>
          <div className='flex items-center gap-[10rem]'>
            <span className='text-[17rem] font-semibold text-slate-900'>Writing</span>
            <span className='rounded-full bg-white/85 px-[12rem] py-[4rem] text-[11rem] font-semibold uppercase tracking-[0.13em] text-[#3562FF]'>Free</span>
          </div>
          <p className='text-[13rem] leading-[1.58] text-slate-600'>Write an essay and get instant AI feedback.</p>
        </div>
        <AnimatePresence>
          {showPulse ? (
            <motion.span
              key='pulse'
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.6, opacity: 0 }}
              transition={{ duration: 0.24, ease: 'easeOut' }}
              className='flex size-[26rem] items-center justify-center rounded-full bg-[#1E2A78] text-white shadow-[0_12rem_26rem_-20rem_rgba(30,42,120,0.75)]'
            >
              <CheckCircle2 className='size-[18rem]' aria-hidden='true' />
            </motion.span>
          ) : null}
        </AnimatePresence>
      </motion.div>

      <div className='flex flex-col items-center gap-[14rem]'>
        <button type='button' onClick={handleStart} disabled={isStarting} className={CTA_CLASSNAME}>
          {isStarting ? (
            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className='flex items-center gap-[10rem]'>
              <span className='size-[16rem] animate-spin rounded-full border-[3rem] border-white/35 border-t-white' aria-hidden='true' />
              Starting…
            </motion.span>
          ) : (
            'Start free Writing test'
          )}
        </button>

        <button
          type='button'
          onClick={() => closeWithReason('dismiss')}
          disabled={isStarting}
          className='text-[14rem] font-semibold text-slate-500 transition hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2'
        >
          Maybe later
        </button>

        <p className='text-center text-[12rem] text-slate-400'>You can access it anytime in your dashboard.</p>
      </div>
    </div>
  );

  return (
    <DialogPrimitive.Root open={open} onOpenChange={handleModalOpenChange}>
      <AnimatePresence>
        {open ? (
          <DialogPrimitive.Portal forceMount>
            <DialogPrimitive.Overlay asChild>
              <motion.div {...overlayMotion} className={OVERLAY_CLASSNAME} />
            </DialogPrimitive.Overlay>

            <DialogPrimitive.Content
              asChild
              onEscapeKeyDown={() => closeWithReason('dismiss')}
              onPointerDownOutside={event => {
                event.preventDefault();
                closeWithReason('dismiss');
              }}
            >
              <div className='fixed inset-0 z-[2001] flex items-center justify-center px-[20rem] py-[20rem]'>
                <motion.div {...cardMotion} className={CARD_CLASSNAME}>
                  {hasFreeTest ? <FreeState /> : <UsedState />}
                </motion.div>
              </div>
            </DialogPrimitive.Content>
          </DialogPrimitive.Portal>
        ) : null}
      </AnimatePresence>
    </DialogPrimitive.Root>
  );
}
