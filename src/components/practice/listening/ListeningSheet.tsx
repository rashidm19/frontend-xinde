'use client';

import type { ReactNode } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { AnimatePresence, motion } from 'framer-motion';

import { BottomSheet, BottomSheetContent } from '@/components/ui/bottom-sheet';
import { SubscriptionAccessLabel } from '@/components/SubscriptionAccessLabel';
import { useCustomTranslations } from '@/hooks/useCustomTranslations';
import { useSubscriptionGate } from '@/hooks/useSubscriptionGate';
import { useMobileSheetSubmit } from '@/hooks/useMobileSheetSubmit';
import { cn } from '@/lib/utils';
import nProgress from 'nprogress';
import { useRouter } from 'next/navigation';

type ListeningSheetStep = 'rules' | 'audio-check';

interface ListeningSheetProps {
  open: boolean;
  step: ListeningSheetStep;
  onRequestClose: () => void;
  onStepChange: (step: ListeningSheetStep, options?: { history?: 'push' | 'replace' }) => void;
  routeSignature: string;
}

const INTERACTIVE_TAP = { scale: 0.97 };
const SHEET_MAX_HEIGHT = 'max-h-[90dvh]';
type UseCustomTranslationsReturn = ReturnType<typeof useCustomTranslations>;

export function ListeningSheet({ open, step, onRequestClose, onStepChange, routeSignature }: ListeningSheetProps) {
  const router = useRouter();
  const { t: tRules, tCommon, tImgAlts, tActions } = useCustomTranslations('practice.listening.rules');
  const { t: tAudio } = useCustomTranslations('practice.listening.audioCheck');
  const { requireSubscription, isCheckingAccess } = useSubscriptionGate();

  const [audioError, setAudioError] = useState<string | null>(null);
  const [hasPlayed, setHasPlayed] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const { isSubmitting, submitError, isCoolingDown, submitTransition, submitAsync, resetSubmission, ariaBusy } = useMobileSheetSubmit();

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen) {
        onRequestClose();
        resetSubmission();
      }
    },
    [onRequestClose, resetSubmission]
  );

  useEffect(() => {
    if (!open) {
      setAudioError(null);
      resetSubmission();
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open, resetSubmission]);

  useEffect(() => {
    if (step !== 'audio-check' && audioRef.current) {
      audioRef.current.pause();
    }
  }, [step]);

  useEffect(() => {
    resetSubmission();
  }, [step, resetSubmission]);

  useEffect(() => {
    if (!open) {
      return;
    }
    resetSubmission();
  }, [routeSignature, open, resetSubmission]);

  const sheetAnnouncement = useMemo(() => {
    if (step === 'audio-check') {
      return tAudio('title');
    }
    return tRules('title');
  }, [step, tAudio, tRules]);

  const listeningMeta = `${tCommon('listening')} • ${tCommon('minCount', { count: 30 })} • ${tCommon('partsCount', { count: 4 })}`;

  const handleContinueFromRules = useCallback(() => {
    if (isSubmitting || isCoolingDown || isCheckingAccess) {
      return;
    }

    void submitTransition(() => onStepChange('audio-check', { history: 'push' }));
  }, [isCheckingAccess, isCoolingDown, isSubmitting, onStepChange, submitTransition]);

  const handleStartListening = useCallback(() => {
    if (isCheckingAccess || !hasPlayed || audioError || isSubmitting || isCoolingDown) {
      return;
    }

    void submitAsync(async () => {
      const canStart = await requireSubscription();
      if (!canStart) {
        return;
      }

      nProgress.start();
      onRequestClose();
      router.push('/practice/listening/test/');
    });
  }, [audioError, hasPlayed, isCheckingAccess, isCoolingDown, isSubmitting, onRequestClose, requireSubscription, router, submitAsync]);

  const rulesContinueDisabled = isCheckingAccess;
  const audioContinueDisabled = isCheckingAccess || !hasPlayed || Boolean(audioError);
  const buttonDisabled = (step === 'rules' ? rulesContinueDisabled : audioContinueDisabled) || isSubmitting || isCoolingDown;

  return (
    <BottomSheet open={open} onOpenChange={handleOpenChange}>
      <BottomSheetContent className={cn(SHEET_MAX_HEIGHT, 'border-none bg-transparent px-0 pb-0')}>
        <div className='flex min-h-0 flex-1 flex-col overflow-hidden rounded-t-[32rem] bg-white/95 pb-[calc(20rem+env(safe-area-inset-bottom))] shadow-[0_-18rem_36rem_-28rem_rgba(15,23,42,0.28)] backdrop-blur-lg'>
          <span className='sr-only' aria-live='polite'>
            {sheetAnnouncement}
          </span>

          <SheetHeader
            step={step}
            listeningMeta={listeningMeta}
            onClose={onRequestClose}
            onBack={() => onStepChange('rules', { history: 'replace' })}
            closeLabel={tActions('cancel')}
            backLabel={tActions('back')}
            iconAlt={tImgAlts('listening') ?? 'Listening'}
          />

          <motion.div key={step} initial={{ opacity: 0.45 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className='flex-1 overflow-y-auto px-[20rem] py-[20rem]'>
            {step === 'rules' ? (
              <div className='flex flex-col gap-[20rem]'>
                <h1 className='text-[22rem] font-semibold leading-[120%] text-slate-900'>{tRules('title')}</h1>
                <div className='flex flex-col gap-[12rem]'>
                  <CollapsibleSection id='listening-about' title={tRules('title')} defaultOpen>
                    {tRules.rich('text', {
                      br: () => '\n',
                    })}
                  </CollapsibleSection>
                  <CollapsibleSection id='listening-marking' title={tCommon('marking')}>
                    {tRules('marking')}
                  </CollapsibleSection>
                </div>
              </div>
            ) : (
              <AudioCheckStepContent tAudio={tAudio} tImgAlts={tImgAlts} audioRef={audioRef} onAudioError={setAudioError} onPlayed={() => setHasPlayed(true)} />
            )}
          </motion.div>

          <footer className='sticky bottom-0 z-[1] border-t border-slate-200 bg-white/95 px-[20rem] pb-[calc(20rem+env(safe-area-inset-bottom))] pt-[16rem] shadow-[0_-18rem_36rem_-28rem_rgba(15,23,42,0.18)]'>
            <div className='space-y-[8rem]' aria-busy={ariaBusy}>
              <span className='sr-only' aria-live='polite'>
                {isSubmitting ? 'Continuing…' : ''}
              </span>
              {submitError ? <p className='text-center text-[12rem] font-medium text-red-600'>{submitError}</p> : null}
              <motion.button
                key={`listening-${step}-cta`}
                type='button'
                whileTap={!buttonDisabled ? INTERACTIVE_TAP : undefined}
                disabled={buttonDisabled}
                onClick={step === 'rules' ? handleContinueFromRules : handleStartListening}
                className='flex h-[52rem] w-full items-center justify-center rounded-[28rem] bg-d-green text-[16rem] font-semibold transition hover:bg-d-green/90 disabled:cursor-not-allowed disabled:bg-d-gray/60 disabled:text-d-black/60'
              >
                {isSubmitting ? (
                  <span className='flex items-center gap-[8rem]'>
                    <span className='size-[16rem] animate-spin rounded-full border-[3rem] border-white/40 border-t-white' aria-hidden='true' />
                    Continuing…
                  </span>
                ) : (
                  tActions('continue')
                )}
              </motion.button>
              <SubscriptionAccessLabel className='text-center text-[12rem]' />
              {audioError ? <p className='text-center text-[12rem] font-medium text-red-600'>{audioError}</p> : null}
            </div>
          </footer>
        </div>
      </BottomSheetContent>
    </BottomSheet>
  );
}

interface SheetHeaderProps {
  step: ListeningSheetStep;
  listeningMeta: string;
  onClose: () => void;
  onBack: () => void;
  closeLabel: string;
  backLabel: string;
  iconAlt: string;
}

const SheetHeader = ({ step, listeningMeta, onClose, onBack, closeLabel, backLabel, iconAlt }: SheetHeaderProps) => (
  <header className='sticky top-0 z-[2] flex items-center justify-between gap-[12rem] border-b border-slate-200 bg-white/95 px-[20rem] pb-[16rem] pt-[calc(20rem+env(safe-area-inset-top))]'>
    <div className='flex items-center gap-[12rem]'>
      {step === 'audio-check' ? (
        <button
          type='button'
          onClick={onBack}
          aria-label={backLabel}
          className='flex size-[36rem] items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-d-violet/40'
        >
          <img src='/images/icon_chevron--back.svg' alt='' className='size-[16rem]' />
        </button>
      ) : null}
      <span className='flex size-[36rem] items-center justify-center rounded-full bg-d-mint/30'>
        <img src='/images/icon_listeningSection.svg' alt={iconAlt} className='size-[20rem]' />
      </span>
      <span className='text-[15rem] font-semibold leading-[120%] text-slate-900'>{listeningMeta}</span>
    </div>
    <button
      type='button'
      onClick={onClose}
      aria-label={closeLabel}
      className='flex size-[36rem] items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-d-violet/40'
    >
      <img src='/images/icon_close--black.svg' alt='' className='size-[18rem]' />
    </button>
  </header>
);

interface AudioCheckStepContentProps {
  tAudio: UseCustomTranslationsReturn['t'];
  tImgAlts: UseCustomTranslationsReturn['tImgAlts'];
  audioRef: React.MutableRefObject<HTMLAudioElement | null>;
  onAudioError: (message: string | null) => void;
  onPlayed: () => void;
}

export const AudioCheckStepContent = ({ tAudio, tImgAlts, audioRef, onAudioError, onPlayed }: AudioCheckStepContentProps) => {
  const [playState, setPlayState] = useState<'playing' | 'paused'>('paused');

  const handleToggle = useCallback(async () => {
    const node = audioRef.current;
    if (!node) {
      onAudioError('Sample audio unavailable');
      return;
    }

    try {
      if (node.paused) {
        const playPromise = node.play();
        if (playPromise) {
          await playPromise;
        }
        onPlayed();
        setPlayState('playing');
      } else {
        node.pause();
        setPlayState('paused');
      }
      onAudioError(null);
    } catch (error) {
      console.error(error);
      onAudioError('Unable to play audio. Check your speakers and try again.');
      setPlayState('paused');
    }
  }, [audioRef, onAudioError, onPlayed]);

  return (
    <div className='flex flex-col items-center gap-[20rem] text-center'>
      <audio
        ref={audioRef}
        className='hidden'
        onEnded={() => setPlayState('paused')}
        onPause={() => setPlayState('paused')}
        onPlay={() => setPlayState('playing')}
        onCanPlay={() => onAudioError(null)}
        onError={() => onAudioError('Unable to load audio. Please check your connection and try again.')}
        preload='auto'
      >
        <source src='/files/audio-check.mp3' type='audio/mpeg' />
      </audio>

      <div className='flex flex-col gap-[8rem]'>
        <h2 className='text-[20rem] font-semibold text-slate-900'>{tAudio('title')}</h2>
        <p className='text-[14rem] leading-[150%] text-slate-600'>{tAudio('instruction')}</p>
      </div>

      <motion.button
        type='button'
        whileTap={INTERACTIVE_TAP}
        onClick={handleToggle}
        aria-label={playState === 'playing' ? (tImgAlts('pause') ?? 'Pause') : (tImgAlts('play') ?? 'Play')}
        className='flex size-[72rem] items-center justify-center rounded-full bg-d-green shadow-[0_20rem_50rem_-32rem_rgba(56,138,77,0.6)]'
      >
        <img src={playState === 'playing' ? '/images/icon_audioPause.svg' : '/images/icon_audioPlay.svg'} alt='' className='size-[24rem]' />
      </motion.button>
    </div>
  );
};

interface CollapsibleSectionProps {
  id: string;
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}

const CollapsibleSection = ({ id, title, children, defaultOpen = false }: CollapsibleSectionProps) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className='rounded-[20rem] border border-slate-200 bg-white/95 shadow-[0_12rem_32rem_-28rem_rgba(15,23,42,0.28)]'>
      <motion.button
        type='button'
        aria-expanded={open}
        aria-controls={`${id}-content`}
        onClick={() => setOpen(prev => !prev)}
        whileTap={INTERACTIVE_TAP}
        className='flex w-full items-center justify-between gap-[12rem] px-[18rem] py-[16rem] text-left'
      >
        <span className='text-[16rem] font-semibold leading-[120%] text-slate-900'>{title}</span>
        <img src='/images/icon_chevron--down.svg' alt='' className={cn('size-[16rem] transition-transform duration-200', open ? 'rotate-180' : '')} />
      </motion.button>
      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            key='content'
            id={`${id}-content`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className='overflow-hidden'
          >
            <div className='px-[18rem] pb-[18rem] pr-[6rem]'>
              <p className='max-w-[520rem] whitespace-pre-line text-[14rem] leading-[160%] text-slate-600'>{children}</p>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
};
