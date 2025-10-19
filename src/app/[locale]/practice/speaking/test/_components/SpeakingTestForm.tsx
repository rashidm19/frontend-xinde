'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useReactMediaRecorder } from 'react-media-recorder';
import axiosInstance from '@/lib/axiosInstance';
import type { PracticeSpeakingAnswer, PracticeSpeakingAttempt, PracticeSpeakingPartResponse } from '@/types/PracticeSpeaking';
import { cn } from '@/lib/utils';
import { AlertTriangle, CheckCircle, Info, Loader2, Mic, MicOff, Play, RefreshCw, SkipForward, Square, Volume2 } from 'lucide-react';

interface FormProps {
  data: PracticeSpeakingPartResponse;
}

type RecordingPhase = 'idle' | 'permission' | 'recording' | 'review' | 'uploading' | 'submitted' | 'error';

type ToastMessage = {
  tone: 'info' | 'warning' | 'error' | 'success';
  text: string;
};

const PART_DETAILS: Record<number, { label: string; helper: string; timeLimit: number; blurb?: string }> = {
  1: {
    label: 'Part 1',
    helper: 'Warm-up questions',
    timeLimit: 45,
  },
  2: {
    label: 'Part 2',
    helper: 'Cue card response',
    timeLimit: 120,
    blurb: 'You have up to 2 minutes to speak. Take a breath and cover the key points.',
  },
  3: {
    label: 'Part 3',
    helper: 'Follow-up discussion',
    timeLimit: 60,
  },
};

const CTA_ORANGE = '#F9A826';

const hasIntroContent = (question?: PracticeSpeakingPartResponse['questions'][number]) => Boolean(question?.intro || question?.intro_url);

export default function SpeakingTestForm({ data }: FormProps) {
  const router = useRouter();

  const sortedQuestions = useMemo(() => [...data.questions].sort((a, b) => a.number - b.number), [data.questions]);
  const [contentStage, setContentStage] = useState<'intro' | 'question'>(() => (hasIntroContent(sortedQuestions[0]) ? 'intro' : 'question'));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [phase, setPhase] = useState<RecordingPhase>('idle');
  const [recordBlob, setRecordBlob] = useState<Blob | null>(null);
  const [recordUrl, setRecordUrl] = useState<string | null>(null);
  const [recordDurationMs, setRecordDurationMs] = useState(0);
  const [recordElapsedMs, setRecordElapsedMs] = useState(0);
  const [playProgress, setPlayProgress] = useState(0);
  const [isPlayingAnswer, setIsPlayingAnswer] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submittedQuestions, setSubmittedQuestions] = useState<Record<number, boolean>>({});
  const [partNumber, setPartNumber] = useState<1 | 2 | 3 | null>(null);
  const [feedbackAttemptId, setFeedbackAttemptId] = useState<number | null>(null);
  const [isFinishingAttempt, setIsFinishingAttempt] = useState(false);
  const [introAudioState, setIntroAudioState] = useState<'idle' | 'playing'>('idle');

  const practiceAttemptIdRef = useRef<string | null>(null);
  const recordStartRef = useRef<number | null>(null);
  const intervalRef = useRef<number | null>(null);
  const didCancelRef = useRef(false);
  const toastTimerRef = useRef<number | null>(null);
  const introAudioRef = useRef<HTMLAudioElement | null>(null);
  const questionAudioRef = useRef<HTMLAudioElement | null>(null);
  const reviewAudioRef = useRef<HTMLAudioElement | null>(null);
  const [questionAudioState, setQuestionAudioState] = useState<'idle' | 'playing'>('idle');

  const question = sortedQuestions[currentIndex];
  const totalQuestions = sortedQuestions.length;

  useEffect(() => {
    const partFromStorage = Number(localStorage.getItem('practiceSpeakingPart'));
    if (partFromStorage === 1 || partFromStorage === 2 || partFromStorage === 3) {
      setPartNumber(partFromStorage);
    }
    practiceAttemptIdRef.current = localStorage.getItem('practiceSpeakingIdStarted');
  }, []);

  useEffect(() => {
    emitTelemetry('speaking_view_opened', { totalQuestions });
  }, [totalQuestions]);

  const { status, startRecording, stopRecording, mediaBlobUrl, clearBlobUrl, error } = useReactMediaRecorder({
    video: false,
    audio: true,
    blobPropertyBag: { type: 'audio/webm' },
    onStop: (_blobUrl, blob) => {
      if (didCancelRef.current) {
        didCancelRef.current = false;
        return;
      }
      setRecordBlob(blob);
      setRecordUrl(_blobUrl);
      setRecordDurationMs(Date.now() - (recordStartRef.current ?? Date.now()));
      setRecordElapsedMs(Date.now() - (recordStartRef.current ?? Date.now()));
      setPhase('review');
    },
  });

  const partDetails = partNumber ? PART_DETAILS[partNumber] : null;
  const timeLimitSeconds = partDetails?.timeLimit ?? 60;

  const micStatus = useMemo(() => {
    if (phase === 'recording') {
      return { label: 'Recording', tone: CTA_ORANGE };
    }
    if (phase === 'review' || phase === 'submitted') {
      return { label: 'Recorded', tone: '#0F9D58' };
    }
    if (phase === 'uploading') {
      return { label: 'Submitting…', tone: CTA_ORANGE };
    }
    if (phase === 'error') {
      return { label: 'Error', tone: '#C2402C' };
    }
    return { label: 'Idle', tone: '#384148' };
  }, [phase]);

  const recordingProgress = useMemo(() => {
    if (phase !== 'recording') return 0;
    return Math.min(1, recordElapsedMs / (timeLimitSeconds * 1000));
  }, [phase, timeLimitSeconds, recordElapsedMs]);

  useEffect(() => {
    if (status === 'recording') {
      setPhase('recording');
      setErrorMessage(null);
      startInterval();
      return;
    }

    stopInterval();

    if (status === 'idle' && !recordBlob) {
      setPhase('idle');
    }

    if (status === 'stopped' && recordBlob) {
      setPhase('review');
    }
  }, [status, recordBlob]);

  useEffect(() => {
    if (status === 'permission_denied') {
      setPhase('permission');
      setErrorMessage('Microphone access was blocked. Allow access in your browser settings.');
      emitTelemetry('speaking_permission_denied');
      pushToast({ tone: 'warning', text: 'Please enable microphone access to start recording.' });
    }
  }, [status]);

  useEffect(() => {
    if (!error || status === 'permission_denied') {
      return;
    }

    setErrorMessage(error);
    setPhase('error');
    pushToast({ tone: 'error', text: 'Recording error occurred. Please try again.' });
  }, [error, status]);

  useEffect(() => {
    return () => {
      stopInterval();
      if (toastTimerRef.current) {
        window.clearTimeout(toastTimerRef.current);
      }
      questionAudioRef.current?.pause();
      reviewAudioRef.current?.pause();
    };
  }, []);

  useEffect(() => {
    if (phase !== 'review') {
      stopAnswerPlayback();
    }
  }, [phase]);

  useEffect(() => {
    if (!mediaBlobUrl || status !== 'stopped') {
      return;
    }
    setRecordUrl(mediaBlobUrl);
  }, [mediaBlobUrl, status]);

  const answeredCount = useMemo(() => Object.keys(submittedQuestions).length, [submittedQuestions]);

  const progressRatio = totalQuestions === 0 ? 0 : answeredCount / totalQuestions;

  const handleStartRecording = async () => {
    if (phase === 'uploading' || phase === 'recording' || questionAudioState === 'playing') return;
    if (contentStage === 'intro') {
      handlePlayIntro(true);
      return;
    }
    try {
      emitTelemetry('speaking_record_start', { question: question?.number });
      setPhase('recording');
      setRecordBlob(null);
      setRecordUrl(null);
      setRecordDurationMs(0);
      setRecordElapsedMs(0);
      setPlayProgress(0);
      recordStartRef.current = Date.now();
      await startRecording();
    } catch (error) {
      setPhase('permission');
      setErrorMessage('Unable to access microphone.');
      emitTelemetry('speaking_permission_denied', { question: question?.number });
    }
  };

  const handleStopRecording = () => {
    if (status !== 'recording') return;
    stopInterval();
    const started = recordStartRef.current;
    if (started) {
      const duration = Date.now() - started;
      setRecordElapsedMs(duration);
      setRecordDurationMs(duration);
    }
    stopRecording();
    if (started) {
      emitTelemetry('speaking_record_stop', { question: question?.number, durationMs: Date.now() - started });
    }
  };

  const handleCancelRecording = () => {
    didCancelRef.current = true;
    stopInterval();
    recordStartRef.current = null;
    setRecordBlob(null);
    setRecordUrl(null);
    setRecordDurationMs(0);
    setRecordElapsedMs(0);
    clearBlobUrl();
    setPhase('idle');
    if (status === 'recording') {
      stopRecording();
    }
  };

  const handleRetryRecording = () => {
    emitTelemetry('speaking_retry_record', { question: question?.number });
    setRecordBlob(null);
    setRecordUrl(null);
    setRecordDurationMs(0);
    setRecordElapsedMs(0);
    clearBlobUrl();
    setPhase('idle');
    setContentStage(hasIntroContent(question) ? 'intro' : 'question');
  };

  const handleSubmitRecording = async () => {
    if (!recordBlob || !question) return;
    const practiceId = practiceAttemptIdRef.current;
    if (!practiceId) {
      pushToast({ tone: 'error', text: 'Practice session was not initialized. Please refresh the page.' });
      return;
    }

    setPhase('uploading');
    setErrorMessage(null);
    emitTelemetry('speaking_submit_click', { question: question.number });

    const formData = new FormData();
    formData.append('practice_id', practiceId);
    formData.append('question', String(question.number));
    formData.append('audio', recordBlob, `record_${question.number}.webm`);

    try {
      await axiosInstance.post<PracticeSpeakingAnswer>('/practice/send/speaking', formData);
      emitTelemetry('speaking_submit_success', { question: question.number });
      setSubmittedQuestions(prev => ({ ...prev, [question.number]: true }));
      if (isLastQuestion()) {
        pushToast({ tone: 'success', text: 'Answer submitted successfully.' });
        setPhase('submitted');
        await finishAttempt(practiceId);
      } else {
        const nextIndex = Math.min(currentIndex + 1, totalQuestions - 1);
        const nextQuestion = sortedQuestions[nextIndex];
        setPhase('idle');
        setRecordBlob(null);
        setRecordUrl(null);
        setRecordDurationMs(0);
        setRecordElapsedMs(0);
        setPlayProgress(0);
        clearBlobUrl();
        setCurrentIndex(nextIndex);
        setContentStage(hasIntroContent(nextQuestion) ? 'intro' : 'question');
        if (hasIntroContent(nextQuestion)) {
          handlePlayIntro(true, nextQuestion);
        }
      }
    } catch (error) {
      console.error(error);
      setPhase('error');
      setErrorMessage('Something went wrong while submitting your answer. Please try again.');
      emitTelemetry('speaking_submit_error', { question: question.number });
    }
  };

  const handleRetrySubmit = () => {
    if (phase !== 'error') return;
    handleSubmitRecording();
  };

  const handleNextQuestion = () => {
    if (feedbackAttemptId) {
      router.push(`/practice/speaking/feedback/${feedbackAttemptId}`);
    } else {
      router.push('/profile');
    }
  };

  const finishAttempt = async (practiceId: string) => {
    setIsFinishingAttempt(true);
    try {
      const response = await axiosInstance.post<PracticeSpeakingAttempt>(`/practice/speaking/${practiceId}/finish`, undefined);
      const finishData = response.data;
      if (finishData?.id) {
        setFeedbackAttemptId(finishData.id);
        pushToast({ tone: 'info', text: 'Feedback is ready. You can review it now.' });
      } else {
        pushToast({ tone: 'warning', text: 'Could not load feedback. You can return to profile.' });
      }
    } catch (error) {
      console.error(error);
      setErrorMessage('Answer saved locally. Reconnect to submit again.');
      pushToast({ tone: 'warning', text: 'Connection lost. Please retry submitting from a stable connection.' });
    }
    setIsFinishingAttempt(false);
  };

  const isLastQuestion = () => currentIndex === totalQuestions - 1;

  const handleAutoStopByLimit = useCallback(() => {
    pushToast({ tone: 'info', text: 'Time limit reached.' });
    handleStopRecording();
  }, []);

  const startInterval = () => {
    stopInterval();
    intervalRef.current = window.setInterval(() => {
      if (!recordStartRef.current) return;
      const elapsed = Date.now() - recordStartRef.current;
      setRecordElapsedMs(elapsed);
      if (elapsed >= timeLimitSeconds * 1000) {
        handleAutoStopByLimit();
      }
    }, 200);
  };

  const stopInterval = () => {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const pushToast = (message: ToastMessage) => {
    setToast(message);
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = window.setTimeout(() => setToast(null), 4200);
  };

  const retryPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      setPhase('idle');
      setErrorMessage(null);
      pushToast({ tone: 'success', text: 'Microphone is ready. Start recording when you are ready.' });
    } catch (error) {
      setErrorMessage('Microphone permission is required to continue.');
      pushToast({ tone: 'error', text: 'Please allow microphone access in your browser settings.' });
    }
  };

  const handlePlayIntro = (forcePlay = false, customQuestion?: PracticeSpeakingPartResponse['questions'][number]) => {
    const q = customQuestion ?? question;
    if (!hasIntroContent(q)) {
      if (forcePlay && phase === 'idle') {
        setContentStage('question');
      }
      return;
    }

    const introUrl = q?.intro_url;
    if (!introUrl) {
      if (forcePlay && phase === 'idle') {
        setContentStage('question');
      }
      return;
    }

    if (!introAudioRef.current || introAudioRef.current.src !== introUrl) {
      introAudioRef.current?.pause();
      introAudioRef.current = new Audio(introUrl);
      introAudioRef.current.addEventListener('ended', () => {
        setIntroAudioState('idle');
        setContentStage('question');
        autoPlayQuestionAudio(q);
      });
    }

    if (introAudioState === 'playing' && !forcePlay) {
      introAudioRef.current.pause();
      setIntroAudioState('idle');
      return;
    }

    introAudioRef.current.currentTime = 0;
    introAudioRef.current.play().catch(() => null);
    setIntroAudioState('playing');
  };

  useEffect(() => {
    if (contentStage === 'intro') {
      handlePlayIntro(true);
    } else if (contentStage === 'question') {
      autoPlayQuestionAudio();
    }
  }, [contentStage, question?.intro_url, question?.intro, question?.question_url]);

  const autoPlayQuestionAudio = (customQuestion?: PracticeSpeakingPartResponse['questions'][number]) => {
    const q = customQuestion ?? question;
    if (!q?.question_url) {
      return;
    }

    if (!questionAudioRef.current || questionAudioRef.current.src !== q.question_url) {
      questionAudioRef.current?.pause();
      questionAudioRef.current = new Audio(q.question_url);
      questionAudioRef.current.addEventListener('ended', () => setQuestionAudioState('idle'));
    }

    questionAudioRef.current.currentTime = 0;
    questionAudioRef.current.play().catch(() => null);
    setQuestionAudioState('playing');
  };

  const handlePlayQuestionAudio = () => {
    if (!question?.question_url) {
      return;
    }

    if (questionAudioState === 'playing') {
      questionAudioRef.current?.pause();
      setQuestionAudioState('idle');
      return;
    }

    autoPlayQuestionAudio();
  };

  const toggleAnswerPlayback = () => {
    if (!recordUrl) return;
    if (!reviewAudioRef.current) {
      const audio = new Audio(recordUrl);
      reviewAudioRef.current = audio;
      audio.addEventListener('timeupdate', () => {
        if (!audio.duration) return;
        setPlayProgress(audio.currentTime / audio.duration);
      });
      audio.addEventListener('ended', () => {
        setIsPlayingAnswer(false);
        setPlayProgress(0);
      });
    }
    if (isPlayingAnswer) {
      reviewAudioRef.current.pause();
      setIsPlayingAnswer(false);
    } else {
      emitTelemetry('speaking_play_answer', { question: question?.number });
      reviewAudioRef.current.currentTime = 0;
      reviewAudioRef.current.play();
      setIsPlayingAnswer(true);
    }
  };

  const stopAnswerPlayback = () => {
    if (reviewAudioRef.current) {
      reviewAudioRef.current.pause();
      reviewAudioRef.current.currentTime = 0;
    }
    setIsPlayingAnswer(false);
    setPlayProgress(0);
  };

  const micIcon = phase === 'recording' ? <Mic className='size-[16rem]' /> : <MicOff className='size-[16rem]' />;

  useEffect(() => {
    setRecordBlob(null);
    setRecordUrl(null);
    setRecordDurationMs(0);
    setRecordElapsedMs(0);
    setPlayProgress(0);
    stopAnswerPlayback();
    questionAudioRef.current?.pause();
    questionAudioRef.current = null;
    setQuestionAudioState('idle');
    introAudioRef.current?.pause();
    introAudioRef.current = null;
    setIntroAudioState('idle');
    setContentStage(hasIntroContent(sortedQuestions[currentIndex]) ? 'intro' : 'question');
  }, [currentIndex]);

  if (!question) {
    return (
      <main className='min-h-screen bg-d-red-secondary'>
        <div className='mx-auto flex min-h-[100dvh] max-w-[720rem] items-center justify-center px-[16rem] py-[72rem]'>
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className='w-full rounded-[28rem] bg-white/95 p-[40rem] text-center shadow-[0_24rem_64rem_-40rem_rgba(60,30,10,0.45)]'>
            <div className='mb-[16rem] text-[26rem] font-semibold text-d-black'>No questions available right now</div>
            <p className='mb-[32rem] text-[18rem] text-d-black/70'>Please try again later or choose another practice set.</p>
            <button
              type='button'
              onClick={() => router.push('/practice')}
              className='mx-auto flex h-[54rem] w-[220rem] items-center justify-center rounded-[32rem] bg-[#F9A826] text-[18rem] font-semibold text-white transition hover:bg-[#f8b645]'
            >
              Back to profile
            </button>
          </motion.div>
        </div>
      </main>
    );
  }

  return (
    <main className='min-h-screen bg-d-red-secondary'>
      <div className='mx-auto flex min-h-[100dvh] max-w-[1120rem] items-center justify-center px-[16rem] py-[64rem]'>
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className='relative w-full max-w-[640rem] rounded-[24rem] border border-white/40 bg-white/95 px-[24rem] py-[24rem] shadow-[0_26rem_60rem_-42rem_rgba(80,44,14,0.55)] backdrop-blur-sm tablet:px-[28rem] tablet:py-[28rem]'
        >
          <header className='mb-[20rem] flex flex-col gap-[12rem]'>
              <div>
                <div className='flex flex-wrap items-center gap-[6rem] text-[12rem] font-medium tracking-[0.08em] text-d-black/60'>
                  <span>{partDetails?.label ?? 'Speaking Practice'}</span>
                  <span className='text-d-black/30'>•</span>
                  <span>{`Question ${currentIndex + 1} of ${totalQuestions}`}</span>
                  <span className='text-d-black/30'>•</span>
                  <span className='capitalize'>{contentStage === 'intro' ? 'Response intro' : 'Question'}</span>
                </div>
                <h1 className='mt-[6rem] text-[22rem] font-semibold text-d-black'>Practice Speaking</h1>
                <p className='mt-[6rem] text-[14rem] text-d-black/70'>Answer the question aloud. You can re-record before submitting.</p>
              </div>
            {partDetails?.helper && <div className='text-[13rem] text-d-black/60'>{partDetails.helper}</div>}
            {partDetails?.blurb && <div className='rounded-[12rem] border border-[#F6D7B0]/80 bg-[#FFF7EE] px-[14rem] py-[10rem] text-[13rem] text-d-black/75'>{partDetails.blurb}</div>}
            <div className='flex h-[4rem] w-full overflow-hidden rounded-full bg-[rgba(246,215,176,0.45)]'>
              <div className='h-full rounded-full transition-all' style={{ width: `${Math.min(1, progressRatio) * 100}%`, backgroundColor: CTA_ORANGE }} />
            </div>
          </header>

          <section className='mb-[24rem] flex flex-col gap-[16rem]'>
            <motion.div
              layout
              whileHover={{ y: -3, boxShadow: '0 14rem 36rem -28rem rgba(120,64,12,0.35)' }}
              className='rounded-[20rem] border border-[#F6D7B0] bg-white px-[18rem] py-[18rem] shadow-[0_14rem_36rem_-30rem_rgba(80,44,14,0.4)] transition tablet:px-[20rem] tablet:py-[20rem]'
            >
              <div className='mb-[10rem] flex items-center justify-between gap-[10rem]'>
                <div className='flex flex-col gap-[4rem]'>
                  <span className='text-[11rem] font-medium uppercase tracking-[0.12em] text-[#AB7633]'>Intro</span>
                  <h2 className='text-[18rem] font-semibold leading-[1.45] text-d-black'>Examiner feedback</h2>
                </div>
                {question.intro_url && (
                  <button
                    type='button'
                    onClick={() => handlePlayIntro(true)}
                    className='flex size-[36rem] items-center justify-center rounded-full border border-[#F6D7B0] bg-white text-[#AB7633] transition hover:bg-[#FFF0DA] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F9A826]'
                    aria-label='Play intro audio'
                  >
                    <Volume2 className={cn('size-[16rem] transition', introAudioState === 'playing' && 'animate-pulse')} />
                  </button>
                )}
              </div>
              {question.intro && <p className='rounded-[14rem] bg-[#FFF4E6] px-[12rem] py-[9rem] text-[14rem] text-d-black/70'>{question.intro}</p>}
              {question.intro_url && (
                <button
                  type='button'
                  onClick={() => handlePlayIntro(true)}
                  className='mt-[12rem] flex w-fit items-center gap-[6rem] rounded-[20rem] border border-[#F6D7B0] px-[14rem] py-[6rem] text-[12.5rem] font-medium text-[#AB7633] transition hover:bg-[#FFF0DA]'
                >
                  <Volume2 className={cn('size-[14rem] transition', introAudioState === 'playing' && 'animate-pulse')} />
                  Play intro
                </button>
              )}
            </motion.div>

            <motion.div
              layout
              whileHover={{ y: -3, boxShadow: '0 14rem 36rem -28rem rgba(120,64,12,0.35)' }}
              className='rounded-[20rem] border border-[#F6D7B0] bg-white px-[18rem] py-[18rem] shadow-[0_14rem_36rem_-30rem_rgba(80,44,14,0.4)] transition tablet:px-[20rem] tablet:py-[20rem]'
            >
              <div className='mb-[10rem] flex items-center justify-between gap-[10rem]'>
                <div className='flex flex-col gap-[4rem]'>
                  <span className='text-[11rem] font-medium uppercase tracking-[0.12em] text-[#AB7633]'>Question {question.number}</span>
                  {partNumber === 3 && <span className='w-fit rounded-full bg-[#FFF4E6] px-[10rem] py-[4rem] text-[11rem] font-semibold uppercase tracking-[0.14em] text-[#AB7633]'>Follow-up</span>}
                  <h2 className='text-[18rem] font-semibold leading-[1.45] text-d-black'>{question.question}</h2>
                </div>
                {question.question_url && (
                  <button
                    type='button'
                    onClick={handlePlayQuestionAudio}
                    className='flex size-[36rem] items-center justify-center rounded-full border border-[#F6D7B0] bg-white text-[#AB7633] transition hover:bg-[#FFF0DA] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F9A826]'
                    aria-label='Play question audio'
                  >
                    <Volume2 className={cn('size-[16rem] transition', questionAudioState === 'playing' && 'animate-pulse')} />
                  </button>
                )}
              </div>
            </motion.div>

            <motion.div layout className='flex flex-col gap-[14rem] rounded-[20rem] border border-[#F6D7B0]/70 bg-white px-[18rem] py-[18rem] tablet:px-[20rem]'>
              <div className='flex items-center justify-between gap-[14rem]'>
                <div className='flex items-center gap-[10rem]'>
                  <div className={cn('flex size-[36rem] items-center justify-center rounded-full border-2', phase === 'recording' ? 'border-[#F9A826]/80 bg-[#FFF2D9]' : 'border-[#F6D7B0] bg-white')}>
                    {micIcon}
                  </div>
                  <div>
                    <div className='text-[14rem] font-semibold' style={{ color: micStatus.tone }}>
                      {micStatus.label}
                    </div>
                    <div className='text-[12.5rem] text-d-black/60'>Up to {timeLimitSeconds} seconds</div>
                  </div>
                </div>
                <div className='flex items-center gap-[6rem] text-[12.5rem] text-d-black/60'>
                  {phase === 'recording' ? (
                    <span>{formatDuration(Date.now() - (recordStartRef.current ?? Date.now()))}</span>
                  ) : recordDurationMs > 0 ? (
                    <span>{formatDuration(recordDurationMs)}</span>
                  ) : (
                    <span>{contentStage === 'intro' ? 'Listen to examiner feedback' : 'Ready when you are'}</span>
                  )}
                </div>
              </div>
              <div className='h-[4rem] w-full overflow-hidden rounded-full bg-[#F6D7B0]/50'>
                <div
                  className={cn('h-full rounded-full transition-all', phase === 'recording' ? 'bg-[#F9A826]' : 'bg-[#F6D7B0]')}
                  style={{ width: `${phase === 'recording' ? recordingProgress * 100 : phase === 'review' || phase === 'submitted' ? 100 : 2}%` }}
                />
              </div>
              <div className='text-[12.5rem] text-d-black/60'>Status updates automatically as you record.</div>
            </motion.div>
          </section>

          <section className='mb-[18rem]'>
            <AnimatePresence mode='wait'>
              <motion.div
                key={phase}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2 }}
                className='flex flex-wrap items-center justify-between gap-[10rem] rounded-[18rem] bg-[#FFF7EE] px-[18rem] py-[18rem] tablet:px-[20rem]'
              >
                {phase === 'idle' && (
                  <>
                    <div className='text-[13.5rem] text-d-black/70'>
                      {contentStage === 'intro' && hasIntroContent(question) ? 'Listen to examiner feedback before answering.' : 'Take a moment to think, then start recording when ready.'}
                    </div>
                    <div className='flex items-center gap-[10rem]'>
                      {contentStage === 'intro' && hasIntroContent(question) ? (
                        <button
                          type='button'
                          onClick={() => handlePlayIntro(true)}
                          className='flex min-w-[150rem] items-center justify-center rounded-[24rem] border border-[#F6D7B0] bg-white px-[24rem] py-[12rem] text-[13.5rem] font-semibold text-[#AB7633] transition hover:bg-[#FFF0DA]'
                        >
                          Play intro
                        </button>
                      ) : (
                        <>
                      <button
                        type='button'
                        onClick={handleStartRecording}
                        disabled={questionAudioState === 'playing'}
                        className='flex min-w-[160rem] items-center justify-center rounded-[26rem] bg-[#F9A826] px-[26rem] py-[12rem] text-[14.5rem] font-semibold text-white transition hover:bg-[#f8b645] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F9A826] disabled:cursor-not-allowed disabled:bg-[#f7c76b] disabled:text-white/70'
                      >
                        Start recording
                      </button>
                          <button
                            type='button'
                            disabled
                            className='flex min-w-[140rem] items-center justify-center rounded-[26rem] border border-[#F6D7B0] px-[22rem] py-[12rem] text-[13.5rem] font-medium text-d-black/40'
                          >
                            Skip question
                          </button>
                        </>
                      )}
                    </div>
                  </>
                )}

                {phase === 'permission' && (
                  <>
                    <div className='text-[13.5rem] text-d-black/70'>Microphone access is needed. Allow access in your browser settings and retry.</div>
                    <button
                      type='button'
                      onClick={retryPermission}
                      className='flex min-w-[150rem] items-center justify-center rounded-[24rem] border border-[#F6D7B0] bg-white px-[24rem] py-[12rem] text-[13.5rem] font-semibold text-[#AB7633] transition hover:bg-[#FFF0DA]'
                    >
                      Retry permission
                    </button>
                  </>
                )}

                {phase === 'recording' && (
                  <>
                    <div className='text-[13.5rem] text-d-black/70'>Speak clearly. The recording will stop automatically at the time limit.</div>
                    <div className='flex items-center gap-[10rem]'>
                      <button
                        type='button'
                        onClick={handleStopRecording}
                        className='flex min-w-[110rem] items-center justify-center rounded-[26rem] bg-[#F9A826] px-[22rem] py-[12rem] text-[13.5rem] font-semibold text-white transition hover:bg-[#f8b645]'
                      >
                        <Square className='mr-[6rem] size-[14rem]' /> Stop
                      </button>
                      <button
                        type='button'
                        onClick={handleCancelRecording}
                        className='flex min-w-[110rem] items-center justify-center rounded-[26rem] border border-[#F6D7B0] px-[22rem] py-[12rem] text-[13.5rem] font-medium text-d-black/70 transition hover:bg-[#FFF0DA]'
                      >
                        <RefreshCw className='mr-[8rem] size-[16rem]' /> Cancel
                      </button>
                    </div>
                  </>
                )}

                {phase === 'review' && recordUrl && (
                  <>
                    <div className='flex flex-col gap-[10rem] text-[13.5rem] text-d-black/75'>
                      <span>Review your answer before submitting.</span>
                      <div className='flex items-center gap-[10rem]'>
                        <div className='relative h-[6rem] w-[150rem] overflow-hidden rounded-full bg-[#F6D7B0]/50'>
                          <div className='absolute inset-y-0 left-0 rounded-full bg-[#F9A826]' style={{ width: `${playProgress * 100}%` }} />
                        </div>
                        <button
                          type='button'
                          onClick={toggleAnswerPlayback}
                          className='flex items-center gap-[8rem] rounded-[22rem] border border-[#F6D7B0] px-[16rem] py-[8rem] text-[13rem] font-medium text-[#AB7633] transition hover.bg-[#FFF0DA]'
                        >
                          <Play className='size-[14rem]' /> Play your answer
                        </button>
                      </div>
                    </div>
                    <div className='flex items-center gap-[10rem]'>
                      <button
                        type='button'
                        onClick={handleSubmitRecording}
                        className='flex min-w-[140rem] items-center justify-center rounded-[26rem] bg-[#F9A826] px-[26rem] py-[12rem] text-[14.5rem] font-semibold text-white transition hover:bg-[#f8b645]'
                      >
                        Submit
                      </button>
                      <button
                        type='button'
                        onClick={handleRetryRecording}
                        className='flex min-w-[110rem] items-center justify-center rounded-[26rem] border border-[#F6D7B0] px-[22rem] py-[12rem] text-[13.5rem] font-medium text-d-black/70 transition hover:bg-[#FFF0DA]'
                      >
                        Retry
                      </button>
                    </div>
                  </>
                )}

                {phase === 'uploading' && (
                  <div className='flex w-full items-center justify-between gap-[12rem]'>
                    <div className='flex items-center gap-[12rem] text-[15rem] text-d-black/70'>
                      <Loader2 className='size-[18rem] animate-spin text-[#F9A826]' /> Submitting your answer…
                    </div>
                  </div>
                )}

                {phase === 'submitted' && (
                  <>
                    <div className='flex items-center gap-[12rem] text-[15rem] text-[#0F9D58]'>
                      <Mic className='size-[18rem]' /> Answer submitted
                    </div>
                    <button
                      type='button'
                      onClick={handleNextQuestion}
                      className='flex min-w-[170rem] items-center justify-center rounded-[28rem] bg-[#F9A826] px-[28rem] py-[14rem] text-[16rem] font-semibold text-white transition hover:bg-[#f8b645] disabled:cursor-not-allowed disabled:bg-[#f6ba55]'
                      disabled={isLastQuestion() && isFinishingAttempt && !feedbackAttemptId}
                    >
                      {isLastQuestion() ? (feedbackAttemptId ? 'View feedback' : isFinishingAttempt ? 'Preparing feedback…' : 'Back to profile') : 'Next question'}
                      {!isLastQuestion() && <SkipForward className='ml-[8rem] size-[16rem]' />}
                    </button>
                  </>
                )}

                {phase === 'error' && (
                  <>
                    <div className='text-[15rem] text-[#C2402C]'>{errorMessage ?? 'We could not submit your answer.'}</div>
                    <div className='flex items-center gap-[12rem]'>
                      <button
                        type='button'
                        onClick={handleRetrySubmit}
                        className='flex min-w-[120rem] items-center justify-center rounded-[28rem] bg-[#F9A826] px-[28rem] py-[14rem] text-[16rem] font-semibold text-white transition hover:bg-[#f8b645]'
                      >
                        Retry
                      </button>
                      <button
                        type='button'
                        onClick={handleRetryRecording}
                        className='flex min-w-[120rem] items-center justify-center rounded-[28rem] border border-[#F6D7B0] px-[24rem] py-[14rem] text-[15rem] font-medium text-d-black/70 transition hover:bg-[#FFF0DA]'
                      >
                        Re-record
                      </button>
                    </div>
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          </section>

          <footer className='flex flex-col gap-[16rem]'>
            <div className='text-[13rem] text-d-black/50'>Your feedback will be generated after submission.</div>
          </footer>

          <AnimatePresence>
            {toast && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className={cn(
                  'pointer-events-auto absolute left-1/2 bottom-[24rem] z-20 flex w-[auto] -translate-x-1/2 items-center gap-[12rem] rounded-[16rem] px-[20rem] py-[14rem] text-[14rem] shadow-[0_14rem_40rem_-28rem_rgba(80,44,14,0.5)] backdrop-blur-sm',
                  toast.tone === 'success' && 'bg-[#EAF7ED] text-[#1B6F41]',
                  toast.tone === 'warning' && 'bg-[#FFF4E6] text-[#BA6A24]',
                  toast.tone === 'error' && 'bg-[#FFE8E2] text-[#B5402B]',
                  toast.tone === 'info' && 'bg-[#FFF7EE] text-[#9A6A2E]'
                )}
                role='status'
              >
                {toast.tone === 'success' && <CheckCircle className='size-[16rem]' />}
                {toast.tone === 'warning' && <AlertTriangle className='size-[16rem]' />}
                {toast.tone === 'error' && <AlertTriangle className='size-[16rem]' />}
                {toast.tone === 'info' && <Info className='size-[16rem]' />}
                <span>{toast.text}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </main>
  );
}

const emitTelemetry = (event: string, payload?: Record<string, unknown>) => {
  try {
    window.dispatchEvent(new CustomEvent(event, { detail: payload }));
  } catch (error) {
    console.warn('Telemetry dispatch error', error);
  }
};

const formatDuration = (ms: number) => {
  const clamped = Math.max(0, ms);
  const seconds = Math.floor(clamped / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
};

