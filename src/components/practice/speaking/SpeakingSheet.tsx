'use client';

import type { ReactNode } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { AnimatePresence, motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { useReactMediaRecorder } from 'react-media-recorder';
import dynamic from 'next/dynamic';

import { BottomSheet, BottomSheetContent } from '@/components/ui/bottom-sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SubscriptionAccessLabel } from '@/components/SubscriptionAccessLabel';
import { useCustomTranslations } from '@/hooks/useCustomTranslations';
import { useSubscriptionGate } from '@/hooks/useSubscriptionGate';
import { useMobileSheetSubmit } from '@/hooks/useMobileSheetSubmit';
import { GET_practice_speaking_categories } from '@/api/GET_practice_speaking_categories';
import { AudioCheckStepContent } from '@/components/practice/listening/ListeningSheet';
import axiosInstance from '@/lib/axiosInstance';
import { cn } from '@/lib/utils';
import type { PracticeSpeakingCategoriesResponse, PracticeSpeakingCategoryTag, PracticeSpeakingPartValue } from '@/types/PracticeSpeaking';
import nProgress from 'nprogress';
import { useRouter } from 'next/navigation';

type SpeakingSheetStep = 'customize' | 'rules' | 'audio-check' | 'mic-check';

interface SpeakingSheetProps {
  open: boolean;
  step: SpeakingSheetStep;
  onRequestClose: () => void;
  onStepChange: (step: SpeakingSheetStep, options?: { history?: 'push' | 'replace' }) => void;
  routeSignature: string;
}

const INTERACTIVE_TAP = { scale: 0.97 };
const SHEET_MAX_HEIGHT = 'max-h-[90dvh]';
const PART_OPTIONS: PracticeSpeakingPartValue[] = ['1', '2', '3', 'all'];

const AudioVisualizer = dynamic(
  async () => {
    const module = await import('react-audio-visualize');
    return module.AudioVisualizer;
  },
  { ssr: false }
);

export function SpeakingSheet({ open, step, onRequestClose, onStepChange, routeSignature }: SpeakingSheetProps) {
  const router = useRouter();
  const { tImgAlts, tCommon, tActions, tForm } = useCustomTranslations('practice.speaking.customize');
  const { t: tAudio } = useCustomTranslations('practice.speaking.audioCheck');
  const { requireSubscription, isCheckingAccess } = useSubscriptionGate();

  const { isSubmitting, submitError, isCoolingDown, submitTransition, submitAsync, resetError, resetSubmission, ariaBusy } = useMobileSheetSubmit({ resetKey: routeSignature });

  const [selectedPart, setSelectedPart] = useState<PracticeSpeakingPartValue | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<string>('random');
  const [isLaunching, setIsLaunching] = useState(false);

  const [hasPlayedSample, setHasPlayedSample] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [hasRecorded, setHasRecorded] = useState(false);
  const [hasPlayedRecording, setHasPlayedRecording] = useState(false);
  const [recordingBlob, setRecordingBlob] = useState<Blob | null>(null);
  const [recordingError, setRecordingError] = useState<string | null>(null);
  const [launchError, setLaunchError] = useState<string | null>(null);
  const [isTopicSelectInteracting, setIsTopicSelectInteracting] = useState(false);
  const micAudioRef = useRef<HTMLAudioElement | null>(null);
  const [micPlayState, setMicPlayState] = useState<'playing' | 'paused'>('paused');
  const topicSelectInteractionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    status: recordingStatus,
    startRecording,
    stopRecording,
    mediaBlobUrl,
    clearBlobUrl,
    error: mediaRecorderError,
  } = useReactMediaRecorder({ audio: true, video: false });

  const {
    data: categories,
    isLoading: categoriesLoading,
    isError: categoriesError,
  } = useQuery<PracticeSpeakingCategoriesResponse>({
    queryKey: ['speaking-categories'],
    queryFn: GET_practice_speaking_categories,
    enabled: open,
    staleTime: 1000 * 60 * 5,
  });

  const categoriesByPart = useMemo<PracticeSpeakingCategoryTag[]>(() => {
    if (!categories || !selectedPart) {
      return [];
    }
    const categoryName = selectedPart === 'all' ? 'speaking_part_all' : `speaking_part_${selectedPart}`;
    return categories.data.find(category => category.name === categoryName)?.tags ?? [];
  }, [categories, selectedPart]);

  const selectedTopicLabel = useMemo(() => {
    if (selectedTopic === 'random') {
      return tCommon('random');
    }
    const match = categoriesByPart.find(tag => String(tag.id) === selectedTopic);
    return match?.name ?? tCommon('random');
  }, [categoriesByPart, selectedTopic, tCommon]);

  const resolveRandomTopicId = useCallback(() => {
    if (categoriesByPart.length === 0) {
      return null;
    }
    const index = Math.floor(Math.random() * categoriesByPart.length);
    const candidate = categoriesByPart[index];
    return candidate ? String(candidate.id) : null;
  }, [categoriesByPart]);

  useEffect(() => {
    if (!open) {
      setSelectedPart(null);
      setSelectedTopic('random');
      setHasPlayedSample(false);
      setAudioError(null);
      setHasRecorded(false);
      setHasPlayedRecording(false);
      setRecordingBlob(null);
      setRecordingError(null);
      setLaunchError(null);
      setIsTopicSelectInteracting(false);
      if (topicSelectInteractionTimeoutRef.current) {
        clearTimeout(topicSelectInteractionTimeoutRef.current);
        topicSelectInteractionTimeoutRef.current = null;
      }
      setMicPlayState('paused');
      clearBlobUrl();
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      if (micAudioRef.current) {
        micAudioRef.current.pause();
        micAudioRef.current.currentTime = 0;
      }
      setIsLaunching(false);
      resetSubmission();
      resetError();
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open, clearBlobUrl, resetError, resetSubmission]);

  useEffect(() => {
    if (!mediaBlobUrl) {
      setRecordingBlob(null);
      setHasRecorded(false);
      setHasPlayedRecording(false);
      setRecordingError(null);
      setLaunchError(null);
      return;
    }

    let cancelled = false;

    const loadRecording = async () => {
      try {
        const response = await fetch(mediaBlobUrl);
        if (!response.ok) {
          throw new Error('Failed to load recording');
        }
        const blob = await response.blob();
        if (!cancelled) {
          setRecordingBlob(blob);
          setHasRecorded(true);
          setRecordingError(null);
        }
      } catch (error) {
        if (!cancelled) {
          setRecordingBlob(null);
          setRecordingError('Unable to access recording. Please try again.');
        }
      }
    };

    void loadRecording();

    return () => {
      cancelled = true;
    };
  }, [mediaBlobUrl]);

  useEffect(() => {
    if (mediaRecorderError) {
      setRecordingError(mediaRecorderError);
    }
  }, [mediaRecorderError]);

  useEffect(() => {
    if (step !== 'audio-check' && audioRef.current) {
      audioRef.current.pause();
    }
  }, [step]);

  useEffect(() => {
    if (step !== 'mic-check' && micAudioRef.current) {
      micAudioRef.current.pause();
      micAudioRef.current.currentTime = 0;
      setMicPlayState('paused');
    }
  }, [step]);

  useEffect(() => {
    resetError();
  }, [step, resetError]);

  useEffect(() => {
    if (recordingStatus === 'recording') {
      setRecordingError(null);
      setLaunchError(null);
    }
  }, [recordingStatus]);

  useEffect(() => {
    return () => {
      if (topicSelectInteractionTimeoutRef.current) {
        clearTimeout(topicSelectInteractionTimeoutRef.current);
        topicSelectInteractionTimeoutRef.current = null;
      }
    };
  }, []);

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen) {
        onRequestClose();
        resetSubmission();
        resetError();
      }
    },
    [onRequestClose, resetError, resetSubmission]
  );

  const handleContinueFromCustomize = useCallback(() => {
    if (!selectedPart || isSubmitting || isCoolingDown) {
      return;
    }
    void submitTransition(() => onStepChange('rules', { history: 'push' }));
  }, [isCoolingDown, isSubmitting, onStepChange, selectedPart, submitTransition]);

  const handleContinueFromRules = useCallback(() => {
    if (isSubmitting || isCoolingDown) {
      return;
    }
    void submitTransition(() => onStepChange('audio-check', { history: 'push' }));
  }, [isCoolingDown, isSubmitting, onStepChange, submitTransition]);

  const handleContinueFromAudioCheck = useCallback(() => {
    if (!hasPlayedSample || audioError || isSubmitting || isCoolingDown) {
      return;
    }
    void submitTransition(() => onStepChange('mic-check', { history: 'push' }));
  }, [audioError, hasPlayedSample, isCoolingDown, isSubmitting, onStepChange, submitTransition]);

  const handleTopicSelectOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (topicSelectInteractionTimeoutRef.current) {
        clearTimeout(topicSelectInteractionTimeoutRef.current);
        topicSelectInteractionTimeoutRef.current = null;
      }

      if (nextOpen) {
        setIsTopicSelectInteracting(true);
        return;
      }

      topicSelectInteractionTimeoutRef.current = setTimeout(() => {
        setIsTopicSelectInteracting(false);
        topicSelectInteractionTimeoutRef.current = null;
      }, 160);
    },
    []
  );

  const handleBack = useCallback(() => {
    if (step === 'mic-check') {
      onStepChange('audio-check', { history: 'replace' });
      return;
    }
    if (step === 'audio-check') {
      onStepChange('rules', { history: 'replace' });
      return;
    }
    if (step === 'rules') {
      onStepChange('customize', { history: 'replace' });
      return;
    }
    onRequestClose();
  }, [onRequestClose, onStepChange, step]);

  const handleStartSpeaking = useCallback(() => {
    if (isCheckingAccess || isLaunching || isSubmitting || isCoolingDown) {
      return;
    }

    resetError();
    setLaunchError(null);

    if (!selectedPart) {
      setLaunchError('Select a part before continuing.');
      return;
    }

    if (!hasRecorded || !hasPlayedRecording) {
      setRecordingError('Record and review your audio before continuing.');
      return;
    }

    void submitAsync(async () => {
      setIsLaunching(true);
      try {
        const canStart = await requireSubscription();

        if (!canStart) {
          return;
        }

        const resolvedTopic = selectedTopic === 'random' ? resolveRandomTopicId() : selectedTopic;

        const params: Record<string, string> = {
          part: selectedPart,
        };

        if (resolvedTopic) {
          params.tag_id = resolvedTopic;
        }

        const result = await axiosInstance.get('/practice/speaking', {
          params,
          validateStatus: () => true,
        });

        if (result.status >= 200 && result.status < 300) {
          const payload = result.data as { data?: Array<{ speaking_id?: number; part?: PracticeSpeakingPartValue }> };
          if (Array.isArray(payload.data) && payload.data.length > 0) {
            const randomIndex = Math.floor(Math.random() * payload.data.length);
            const speakingEntry = payload.data[randomIndex];
            const speakingId = speakingEntry?.speaking_id;

            if (typeof speakingId === 'number' && typeof window !== 'undefined') {
              window.localStorage.setItem('practiceSpeakingId', String(speakingId));
              window.localStorage.setItem('practiceSpeakingPart', selectedPart);
            }

            nProgress.start();
            onRequestClose();
      router.push('/practice/speaking/test');
            return;
          }

          setLaunchError("We couldn't find a speaking task right now. Please try again later.");
          return;
        }

        setLaunchError('Unable to start speaking practice. Please try again.');
      } finally {
        setIsLaunching(false);
      }
    });
  }, [isCheckingAccess, isCoolingDown, isLaunching, isSubmitting, resetError, selectedPart, hasRecorded, hasPlayedRecording, submitAsync, requireSubscription, selectedTopic, resolveRandomTopicId, onRequestClose, router]);

  const customizeContinueDisabled = categoriesLoading || categoriesError || !selectedPart;
  const rulesContinueDisabled = false;
  const audioContinueDisabled = isCheckingAccess || Boolean(audioError) || !hasPlayedSample;
  const micContinueDisabled = isCheckingAccess || isLaunching || Boolean(recordingError);

  const baseButtonDisabled =
    step === 'customize'
      ? customizeContinueDisabled
      : step === 'rules'
        ? rulesContinueDisabled
        : step === 'audio-check'
          ? audioContinueDisabled
          : micContinueDisabled;

  const buttonDisabled = baseButtonDisabled || isSubmitting || isCoolingDown;
  const shouldLockPrimaryAction = step === 'customize' && isTopicSelectInteracting;

  const sheetAnnouncement = useMemo(() => {
    switch (step) {
      case 'rules':
        return 'Speaking rules';
      case 'audio-check':
        return tAudio('title');
      case 'mic-check':
        return 'Microphone check';
      default:
        return 'Speaking task selection';
    }
  }, [step, tAudio]);

  const headerMeta = `${tCommon('speaking')} • ${tCommon('minCount', { count: 14 })} • ${tCommon('partsCount', { count: 3 })}`;

  const handlePrimaryAction = useCallback(() => {
    if (shouldLockPrimaryAction) {
      return;
    }
    if (step === 'customize') {
      handleContinueFromCustomize();
      return;
    }
    if (step === 'rules') {
      handleContinueFromRules();
      return;
    }
    if (step === 'audio-check') {
      handleContinueFromAudioCheck();
      return;
    }
    handleStartSpeaking();
  }, [handleContinueFromAudioCheck, handleContinueFromCustomize, handleContinueFromRules, handleStartSpeaking, shouldLockPrimaryAction, step]);

  return (
    <BottomSheet open={open} onOpenChange={handleOpenChange}>
      <BottomSheetContent className={cn(SHEET_MAX_HEIGHT, 'border-none bg-transparent px-0 pb-0')}>
        <div className='flex min-h-0 flex-1 flex-col overflow-hidden rounded-t-[32rem] bg-white/95 pb-[calc(20rem+env(safe-area-inset-bottom))] shadow-[0_-18rem_36rem_-28rem_rgba(15,23,42,0.28)] backdrop-blur-lg'>
          <span className='sr-only' aria-live='polite'>
            {sheetAnnouncement}
          </span>

          <SheetHeader
            step={step}
            meta={headerMeta}
            onClose={onRequestClose}
            onBack={handleBack}
            iconAlt={tImgAlts('speaking') ?? 'Speaking'}
            closeLabel={tActions('cancel')}
            backLabel={tActions('back')}
          />

          <motion.div key={step} initial={{ opacity: 0.45 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className='flex-1 overflow-y-auto px-[20rem] py-[20rem]'>
            {step === 'customize' ? (
              <CustomizeStep
                categoriesLoading={categoriesLoading}
                categoriesError={categoriesError}
                categoriesByPart={categoriesByPart}
                selectedPart={selectedPart}
                selectedTopic={selectedTopic}
                onPartSelect={part => {
                  resetError();
                  setSelectedPart(part);
                  setSelectedTopic('random');
                  setLaunchError(null);
                }}
                onTopicSelect={value => {
                  resetError();
                  setSelectedTopic(value);
                  setLaunchError(null);
                }}
                selectedTopicLabel={selectedTopicLabel}
                onTopicSelectOpenChange={handleTopicSelectOpenChange}
                tCommon={tCommon}
                tForm={tForm}
              />
            ) : null}

            {step === 'rules' ? <RulesStep /> : null}

            {step === 'audio-check' ? (
              <AudioCheckStepContent
                tAudio={tAudio}
                tImgAlts={tImgAlts}
                audioRef={audioRef}
                onAudioError={message => setAudioError(message)}
                onPlayed={() => {
                  setHasPlayedSample(true);
                  setAudioError(null);
                }}
              />
            ) : null}

            {step === 'mic-check' ? (
              <MicCheckStep
                title='Microphone check'
                instruction='Record your voice and make sure you can hear it clearly before you continue.'
                retryLabel='Record again'
                tImgAlts={tImgAlts}
                status={recordingStatus}
                startRecording={startRecording}
                stopRecording={stopRecording}
                clearRecording={() => {
                  resetError();
                  clearBlobUrl();
                  setRecordingBlob(null);
                  setHasRecorded(false);
                  setHasPlayedRecording(false);
                  setRecordingError(null);
                  setLaunchError(null);
                  setMicPlayState('paused');
                }}
                recordingBlob={recordingBlob}
                audioRef={micAudioRef}
                playState={micPlayState}
                setPlayState={setMicPlayState}
                onPlayback={() => {
                  setHasPlayedRecording(true);
                  setRecordingError(null);
                }}
                error={recordingError}
              />
            ) : null}
          </motion.div>

          <footer className='sticky bottom-0 z-[1] border-t border-slate-200 bg-white/95 px-[20rem] pb-[calc(20rem+env(safe-area-inset-bottom))] pt-[16rem] shadow-[0_-18rem_36rem_-28rem_rgba(15,23,42,0.18)]'>
            <div className='space-y-[8rem]' aria-busy={ariaBusy}>
              <span className='sr-only' aria-live='polite'>
                {isSubmitting ? 'Continuing…' : ''}
              </span>
              {submitError ? <p className='text-center text-[12rem] font-medium text-red-600'>{submitError}</p> : null}
              <motion.button
                key={`speaking-${step}-cta`}
                type='button'
                whileTap={!(buttonDisabled || shouldLockPrimaryAction) ? INTERACTIVE_TAP : undefined}
                disabled={buttonDisabled || shouldLockPrimaryAction}
                onClick={handlePrimaryAction}
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
            </div>
          </footer>
        </div>
      </BottomSheetContent>
    </BottomSheet>
  );
}

interface SheetHeaderProps {
  step: SpeakingSheetStep;
  meta: string;
  onClose: () => void;
  onBack: () => void;
  iconAlt: string;
  closeLabel: string;
  backLabel: string;
}

const SheetHeader = ({ step, meta, onClose, onBack, iconAlt, closeLabel, backLabel }: SheetHeaderProps) => (
  <header className='sticky top-0 z-[2] flex items-center justify-between gap-[12rem] border-b border-slate-200 bg-white/95 px-[20rem] pb-[16rem] pt-[calc(20rem+env(safe-area-inset-top))]'>
    <div className='flex items-center gap-[12rem]'>
      {step !== 'customize' ? (
        <button
          type='button'
          onClick={onBack}
          aria-label={backLabel}
          className='flex size-[36rem] items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-d-violet/40'
        >
          <img src='/images/icon_chevron--back.svg' alt='' className='size-[16rem]' />
        </button>
      ) : null}
      <span className='flex size-[36rem] items-center justify-center rounded-full bg-d-violet-secondary/40'>
        <img src='/images/icon_speakingSection.svg' alt={iconAlt} className='size-[20rem]' />
      </span>
      <span className='text-[15rem] font-semibold leading-[120%] text-slate-900'>{meta}</span>
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

interface CustomizeStepProps {
  categoriesLoading: boolean;
  categoriesError: boolean;
  categoriesByPart: PracticeSpeakingCategoryTag[];
  selectedPart: PracticeSpeakingPartValue | null;
  selectedTopic: string;
  onPartSelect: (part: PracticeSpeakingPartValue) => void;
  onTopicSelect: (value: string) => void;
  onTopicSelectOpenChange: (open: boolean) => void;
  selectedTopicLabel: string;
  tCommon: ReturnType<typeof useCustomTranslations>['tCommon'];
  tForm: ReturnType<typeof useCustomTranslations>['tForm'];
}

const CustomizeStep = ({
  categoriesLoading,
  categoriesError,
  categoriesByPart,
  selectedPart,
  selectedTopic,
  onPartSelect,
  onTopicSelect,
  onTopicSelectOpenChange,
  selectedTopicLabel,
  tCommon,
  tForm,
}: CustomizeStepProps) => (
  <div className='flex flex-col gap-[24rem]'>
    <header className='space-y-[8rem]'>
      <h1 className='text-[22rem] font-semibold leading-[120%] text-slate-900'>{tCommon('tasksSelection')}</h1>
      <p className='text-[14rem] leading-[150%] text-slate-600'>Please select which speaking tasks you would like to practise.</p>
    </header>

    <section className='space-y-[12rem]'>
      <h2 className='text-[15rem] font-semibold leading-[120%] text-slate-900'>Select the part</h2>
      <div className='grid grid-cols-2 gap-[12rem]'>
        {PART_OPTIONS.map(part => (
          <motion.button
            key={part}
            type='button'
            whileTap={INTERACTIVE_TAP}
            onClick={() => onPartSelect(part)}
            className={cn(
              'flex h-[52rem] items-center justify-center rounded-[18rem] border-[2rem] text-[15rem] font-semibold transition-colors',
              selectedPart === part
                ? 'border-d-violet bg-d-violet-secondary/20 text-d-violet'
                : 'border-slate-200 bg-white text-slate-600 hover:border-d-violet/40 hover:text-d-violet'
            )}
            aria-pressed={selectedPart === part}
          >
            {part === 'all' ? 'All parts' : tCommon('partNumber', { number: Number(part) })}
          </motion.button>
        ))}
      </div>
    </section>

    <section className='space-y-[12rem]'>
      <h2 className='text-[15rem] font-semibold leading-[120%] text-slate-900'>Select a topic</h2>
      <Select value={selectedTopic} onValueChange={onTopicSelect} disabled={!selectedPart || categoriesLoading || categoriesError} onOpenChange={onTopicSelectOpenChange}>
        <SelectTrigger className='h-[52rem] rounded-[16rem] border border-slate-200 bg-white px-[20rem] text-[15rem] font-semibold text-slate-700'>
          <SelectValue placeholder={tForm('placeholders.random') ?? 'Random'}>{selectedTopicLabel}</SelectValue>
        </SelectTrigger>
        <SelectContent className='max-h-[240rem] rounded-[20rem] border border-slate-200 bg-white/95 shadow-[0_18rem_45rem_-30rem_rgba(15,23,42,0.28)]'>
          <SelectItem value='random' className='h-[48rem] px-[20rem] text-[15rem] font-medium text-slate-700'>
            {tCommon('random')}
          </SelectItem>
          {categoriesByPart.map(tag => (
            <SelectItem key={tag.id} value={String(tag.id)} className='h-[48rem] px-[20rem] text-[15rem] font-medium text-slate-700'>
              {tag.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {categoriesLoading ? <p className='text-[13rem] text-slate-500'>Loading topics…</p> : null}
      {categoriesError ? <p className='text-[13rem] text-red-600'>Unable to load topics. Please try again.</p> : null}
    </section>
  </div>
);

const RulesStep = () => (
  <div className='flex flex-col gap-[16rem]'>
    <h1 className='text-[22rem] font-semibold leading-[120%] text-slate-900'>What’s in the IELTS Speaking test?</h1>
    <CollapsibleSection title='Overview' id='speaking-overview' defaultOpen>
      The Speaking test is a face-to-face interview between you and an examiner. It is recorded and split across three parts to check different speaking skills and
      communication styles.
    </CollapsibleSection>
    <CollapsibleSection title='Marking' id='speaking-marking'>
      Certificated IELTS examiners listen for fluency and coherence, lexical resource, grammatical range and accuracy, and pronunciation when deciding your band score.
    </CollapsibleSection>
  </div>
);

interface MicCheckStepProps {
  title: string;
  instruction: string;
  retryLabel: string;
  tImgAlts: ReturnType<typeof useCustomTranslations>['tImgAlts'];
  status: string;
  startRecording: () => void;
  stopRecording: () => void;
  clearRecording: () => void;
  recordingBlob: Blob | null;
  audioRef: React.MutableRefObject<HTMLAudioElement | null>;
  playState: 'playing' | 'paused';
  setPlayState: (state: 'playing' | 'paused') => void;
  onPlayback: () => void;
  error: string | null;
}

const MicCheckStep = ({
  title,
  instruction,
  retryLabel,
  tImgAlts,
  status,
  startRecording,
  stopRecording,
  clearRecording,
  recordingBlob,
  audioRef,
  playState,
  setPlayState,
  onPlayback,
  error,
}: MicCheckStepProps) => {
  const [currentTime, setCurrentTime] = useState(0);

  const recordingUrl = useMemo(() => {
    if (!recordingBlob) {
      return null;
    }
    return URL.createObjectURL(recordingBlob);
  }, [recordingBlob]);

  useEffect(() => {
    if (!recordingUrl) {
      return;
    }

    const node = audioRef.current;
    if (node) {
      node.src = recordingUrl;
      node.load();
    }

    return () => {
      URL.revokeObjectURL(recordingUrl);
    };
  }, [recordingUrl, audioRef]);

  useEffect(() => {
    if (!recordingBlob) {
      setCurrentTime(0);
      setPlayState('paused');
    }
  }, [recordingBlob, setPlayState]);

  return (
    <div className='flex flex-col items-center gap-[24rem]'>
      <header className='text-center'>
        <h2 className='text-[20rem] font-semibold text-slate-900'>{title}</h2>
        <p className='mt-[8rem] text-[14rem] leading-[150%] text-slate-600'>{instruction}</p>
      </header>

      <div className='flex flex-col items-center gap-[16rem]'>
        <motion.button
          type='button'
          whileTap={INTERACTIVE_TAP}
          onClick={() => {
            if (status === 'recording') {
              stopRecording();
            } else {
              startRecording();
            }
          }}
          aria-label={status === 'recording' ? (tImgAlts('pause') ?? 'Stop recording') : (tImgAlts('speaking') ?? 'Start recording')}
          className={cn('flex size-[72rem] items-center justify-center rounded-full text-white', status === 'recording' ? 'bg-red-500' : 'bg-d-green')}
        >
          <img src={status === 'recording' ? '/images/icon_audioPause.svg' : '/images/icon_speakingSection.svg'} alt='' className='size-[24rem]' />
        </motion.button>
        <p className='text-[14rem] font-medium text-slate-700'>{status === 'recording' ? 'Recording… say a few sentences.' : 'Tap to start recording'}</p>
      </div>

      {recordingBlob ? (
        <div className='flex flex-col items-center gap-[16rem]'>
          <audio
            ref={node => {
              audioRef.current = node;
            }}
            className='hidden'
            onPlay={() => {
              setPlayState('playing');
              onPlayback();
            }}
            onPause={() => setPlayState('paused')}
            onEnded={() => setPlayState('paused')}
            onTimeUpdate={() => {
              const node = audioRef.current;
              if (node) {
                setCurrentTime(node.currentTime);
              }
            }}
          />
          <motion.button
            type='button'
            whileTap={INTERACTIVE_TAP}
            onClick={() => {
              const node = audioRef.current;
              if (!node) {
                return;
              }
              if (node.paused) {
                void node.play();
              } else {
                node.pause();
              }
            }}
            aria-label={playState === 'playing' ? (tImgAlts('pause') ?? 'Pause playback') : (tImgAlts('play') ?? 'Play recording')}
            className='flex size-[72rem] items-center justify-center rounded-full bg-d-green text-white'
          >
            <img src={playState === 'playing' ? '/images/icon_audioPause.svg' : '/images/icon_audioPlay.svg'} alt='' className='size-[24rem]' />
          </motion.button>
          <AudioVisualizer blob={recordingBlob} width={320} height={56} barWidth={2} gap={2} barColor='#d0d0d0' barPlayedColor='#383838' currentTime={currentTime} />
          <button
            type='button'
            onClick={() => {
              setCurrentTime(0);
              setPlayState('paused');
              clearRecording();
            }}
            className='text-[13rem] font-semibold text-d-violet'
          >
            {retryLabel}
          </button>
        </div>
      ) : null}

      {error ? <p className='text-[12rem] text-red-600'>{error}</p> : null}
    </div>
  );
};

interface CollapsibleSectionProps {
  title: string;
  id: string;
  children: ReactNode;
  defaultOpen?: boolean;
}

const CollapsibleSection = ({ title, id, children, defaultOpen = false }: CollapsibleSectionProps) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className='rounded-[20rem] border border-slate-200 bg-white/95 shadow-[0_12rem_32rem_-28rem_rgba(15,23,42,0.28)]'>
      <motion.button
        type='button'
        aria-expanded={open}
        aria-controls={`${id}-content`}
        whileTap={INTERACTIVE_TAP}
        onClick={() => setOpen(prev => !prev)}
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
              <p className='text-[14rem] leading-[160%] text-slate-600'>{children}</p>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
};
