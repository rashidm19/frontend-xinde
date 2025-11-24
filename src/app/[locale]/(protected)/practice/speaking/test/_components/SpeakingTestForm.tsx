'use client';

import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useReactMediaRecorder } from 'react-media-recorder';
import axiosInstance from '@/lib/axiosInstance';
import { clearPracticeSessionCookie } from '@/lib/practiceSession';
import type { PracticeSpeakingAnswer, PracticeSpeakingAttempt, PracticeSpeakingPartResponse, PracticeSpeakingPartValue } from '@/types/PracticeSpeaking';
import { isPracticeSpeakingPartValue } from '@/types/PracticeSpeaking';
import { cn } from '@/lib/utils';
import { MobileHeader } from '@/components/practice/reading/mobile/MobileHeader';
import { AlertTriangle, CheckCircle, Info, Loader2, Mic, MicOff, Play, RefreshCw, SkipForward, Square, Volume2 } from 'lucide-react';

interface FormProps {
  data: PracticeSpeakingPartResponse;
  practicePart?: PracticeSpeakingPartValue | null;
  practiceAttemptId?: string | null;
  exitLabel?: string;
  onExit?: () => void;
}

type RecordingPhase = 'idle' | 'permission' | 'recording' | 'review' | 'uploading' | 'submitted' | 'error';

type ToastMessage = {
  tone: 'info' | 'warning' | 'error' | 'success';
  text: string;
};

type AudioSource = 'intro' | 'question' | 'answer';

const AUDIO_SOURCE_LABEL: Record<AudioSource, string> = {
  intro: 'Playing intro…',
  question: 'Playing question…',
  answer: 'Playing your answer…',
};

const PART_DETAILS: Partial<Record<PracticeSpeakingPartValue, { label: string; timeLimit: number; blurb?: string }>> = {
  '1': {
    label: 'Part 1',
    timeLimit: 45,
  },
  '2': {
    label: 'Part 2',
    timeLimit: 120,
    blurb: 'You have up to 2 minutes to speak. Take a breath and cover the key points.',
  },
  '3': {
    label: 'Part 3',
    timeLimit: 60,
  },
  all: {
    label: 'All Parts',
    timeLimit: 60,
  },
  '2-3': {
    label: 'Part 2+3',
    timeLimit: 90,
  },
};

const CTA_ORANGE = '#F9A826';

const AUDIO_MIME_TYPE_PREFERENCE = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4;codecs=mp4a.40.2', 'audio/mp4', 'audio/mpeg'];
const DEFAULT_AUDIO_BLOB_TYPE = 'audio/webm';

const MIME_EXTENSION_MAP: Record<string, string> = {
  'audio/webm': 'webm',
  'audio/mp4': 'm4a',
  'audio/mpeg': 'mp3',
};

const normaliseBlobMimeType = (mimeType: string | null) => {
  if (!mimeType) return DEFAULT_AUDIO_BLOB_TYPE;
  const [base] = mimeType.split(';');
  return base || DEFAULT_AUDIO_BLOB_TYPE;
};

const getExtensionForMimeType = (mimeType: string) => MIME_EXTENSION_MAP[mimeType] ?? 'webm';

const hasIntroContent = (question?: PracticeSpeakingPartResponse['questions'][number]) => Boolean(question?.intro || question?.intro_url);

export default function SpeakingTestForm({ data, practicePart, practiceAttemptId, exitLabel, onExit }: FormProps) {
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
  const [partValue, setPartValue] = useState<PracticeSpeakingPartValue | null>(null);
  const [feedbackAttemptId, setFeedbackAttemptId] = useState<number | null>(null);
  const [isFinishingAttempt, setIsFinishingAttempt] = useState(false);
  const [isSubmitButtonBusy, setIsSubmitButtonBusy] = useState(false);
  const [currentAudioSource, setCurrentAudioSource] = useState<AudioSource | null>(null);
  const [audioPlaybackState, setAudioPlaybackState] = useState<Record<number, { introPlayed: boolean; questionPlayed: boolean }>>({});
  const [introAudioState, setIntroAudioState] = useState<'idle' | 'playing'>('idle');
  const [audioMimeType, setAudioMimeType] = useState<string | null>(null);

  const practiceAttemptIdRef = useRef<string | null>(practiceAttemptId ?? null);
  const recordStartRef = useRef<number | null>(null);
  const intervalRef = useRef<number | null>(null);
  const didCancelRef = useRef(false);
  const toastTimerRef = useRef<number | null>(null);
  const introAudioRef = useRef<HTMLAudioElement | null>(null);
  const questionAudioRef = useRef<HTMLAudioElement | null>(null);
  const reviewAudioRef = useRef<HTMLAudioElement | null>(null);
  const introAudioCleanupRef = useRef<(() => void) | null>(null);
  const questionAudioCleanupRef = useRef<(() => void) | null>(null);
  const reviewAudioCleanupRef = useRef<(() => void) | null>(null);
  const [questionAudioState, setQuestionAudioState] = useState<'idle' | 'playing'>('idle');
  const fallbackRecordUrlRef = useRef<string | null>(null);

  const resolvedBlobMimeType = useMemo(() => normaliseBlobMimeType(audioMimeType), [audioMimeType]);
  const audioFileExtension = useMemo(() => getExtensionForMimeType(resolvedBlobMimeType), [resolvedBlobMimeType]);

  useEffect(() => {
    if (typeof window === 'undefined' || !('MediaRecorder' in window)) {
      setAudioMimeType(null);
      return;
    }

    const supported = AUDIO_MIME_TYPE_PREFERENCE.find(type => {
      try {
        return window.MediaRecorder.isTypeSupported(type);
      } catch {
        return false;
      }
    });

    setAudioMimeType(supported ?? null);
  }, []);

  const handleReviewTimeUpdate = useCallback(() => {
    const audio = reviewAudioRef.current;
    if (!audio || !audio.duration) return;
    setPlayProgress(audio.currentTime / audio.duration);
  }, []);

  const handleReviewEnded = useCallback(() => {
    const audio = reviewAudioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    setIsPlayingAnswer(false);
    setPlayProgress(0);
  }, []);

  const question = sortedQuestions[currentIndex];
  const totalQuestions = sortedQuestions.length;
  const isFinalQuestion = currentIndex === totalQuestions - 1;

  const exitActionLabel = exitLabel ?? 'Exit';

  const handleExit = useCallback(() => {
    if (onExit) {
      onExit();
      return;
    }
    router.push('/profile');
  }, [onExit, router]);

  useEffect(() => {
    if (isPracticeSpeakingPartValue(practicePart)) {
      setPartValue(practicePart);
    }
  }, [practicePart]);

  useEffect(() => {
    practiceAttemptIdRef.current = practiceAttemptId ?? null;
  }, [practiceAttemptId]);

  useEffect(() => {
    if (isPracticeSpeakingPartValue(data.part)) {
      setPartValue(data.part);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('speakingPreferredPart', data.part);
      }
    }
  }, [data.part]);

  useEffect(() => {
    emitTelemetry('speaking_view_opened', { totalQuestions });
  }, [totalQuestions]);

  const markIntroPlayed = useCallback((questionNumber: number) => {
    setAudioPlaybackState(prev => {
      const existing = prev[questionNumber] ?? { introPlayed: false, questionPlayed: false };
      if (existing.introPlayed) {
        return prev;
      }
      return {
        ...prev,
        [questionNumber]: { ...existing, introPlayed: true },
      };
    });
  }, []);

  const markQuestionPlayed = useCallback((questionNumber: number) => {
    setAudioPlaybackState(prev => {
      const existing = prev[questionNumber] ?? { introPlayed: false, questionPlayed: false };
      if (existing.questionPlayed) {
        return prev;
      }
      return {
        ...prev,
        [questionNumber]: { ...existing, questionPlayed: true },
      };
    });
  }, []);

  const attachAudioStatusHandlers = useCallback(
    (
      audio: HTMLAudioElement,
      source: AudioSource,
      options?: {
        questionNumber?: number;
        onEnded?: () => void;
        onPause?: () => void;
        onPlay?: () => void;
        onError?: () => void;
      }
    ) => {
      const { questionNumber, onEnded, onPause, onPlay, onError } = options ?? {};

      const handlePlay = () => {
        setCurrentAudioSource(source);
        onPlay?.();
      };

      const handleEnded = () => {
        if (typeof questionNumber === 'number') {
          if (source === 'intro') {
            markIntroPlayed(questionNumber);
          }
          if (source === 'question') {
            markQuestionPlayed(questionNumber);
          }
        }
        onEnded?.();
        setCurrentAudioSource(prev => (prev === source ? null : prev));
      };

      const handlePause = () => {
        if (audio.ended) {
          return;
        }
        onPause?.();
        setCurrentAudioSource(prev => (prev === source ? null : prev));
      };

      const handleError = () => {
        onError?.();
        setCurrentAudioSource(prev => (prev === source ? null : prev));
      };

      audio.addEventListener('play', handlePlay);
      audio.addEventListener('pause', handlePause);
      audio.addEventListener('ended', handleEnded);
      audio.addEventListener('error', handleError);

      return () => {
        audio.removeEventListener('play', handlePlay);
        audio.removeEventListener('pause', handlePause);
        audio.removeEventListener('ended', handleEnded);
        audio.removeEventListener('error', handleError);
      };
    },
    [markIntroPlayed, markQuestionPlayed]
  );

  useEffect(() => {
    const currentQuestion = sortedQuestions[currentIndex];
    if (!currentQuestion) return;
    setAudioPlaybackState(prev => {
      if (prev[currentQuestion.number]) {
        return prev;
      }
      return {
        ...prev,
        [currentQuestion.number]: {
          introPlayed: !hasIntroContent(currentQuestion),
          questionPlayed: false,
        },
      };
    });
  }, [currentIndex, sortedQuestions]);

  const { status, startRecording, stopRecording, mediaBlobUrl, clearBlobUrl, error } = useReactMediaRecorder({
    video: false,
    audio: true,
    mediaRecorderOptions: audioMimeType ? { mimeType: audioMimeType } : undefined,
    blobPropertyBag: { type: resolvedBlobMimeType },
    onStop: (_blobUrl, blob) => {
      if (didCancelRef.current) {
        didCancelRef.current = false;
        return;
      }
      const finalBlob = blob.type ? blob : new Blob([blob], { type: resolvedBlobMimeType });
      const finalUrl = _blobUrl ?? URL.createObjectURL(finalBlob);
      if (!_blobUrl) {
        if (fallbackRecordUrlRef.current) {
          URL.revokeObjectURL(fallbackRecordUrlRef.current);
        }
        fallbackRecordUrlRef.current = finalUrl;
      } else if (fallbackRecordUrlRef.current) {
        URL.revokeObjectURL(fallbackRecordUrlRef.current);
        fallbackRecordUrlRef.current = null;
      }
      setRecordBlob(finalBlob);
      setRecordUrl(finalUrl);
      setRecordDurationMs(Date.now() - (recordStartRef.current ?? Date.now()));
      setRecordElapsedMs(Date.now() - (recordStartRef.current ?? Date.now()));
      setPhase('review');
    },
  });

  const partDetails = partValue ? (PART_DETAILS[partValue] ?? null) : null;
  const timeLimitSeconds = partDetails?.timeLimit ?? 60;

  // const micStatus = useMemo(() => {
  //   if (phase === 'recording') {
  //     return { label: 'Recording', tone: CTA_ORANGE };
  //   }
  //   if (phase === 'review' || phase === 'submitted') {
  //     return { label: 'Recorded', tone: '#0F9D58' };
  //   }
  //   if (phase === 'uploading') {
  //     return { label: 'Submitting…', tone: CTA_ORANGE };
  //   }
  //   if (phase === 'error') {
  //     return { label: 'Error', tone: '#C2402C' };
  //   }
  //   return { label: 'Idle', tone: '#384148' };
  // }, [phase]);

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
      introAudioCleanupRef.current?.();
      introAudioCleanupRef.current = null;
      questionAudioCleanupRef.current?.();
      questionAudioCleanupRef.current = null;
      reviewAudioCleanupRef.current?.();
      reviewAudioCleanupRef.current = null;
      if (toastTimerRef.current) {
        window.clearTimeout(toastTimerRef.current);
      }
      if (questionAudioRef.current) {
        questionAudioRef.current.pause();
        questionAudioRef.current.currentTime = 0;
        questionAudioRef.current = null;
      }
      if (reviewAudioRef.current) {
        reviewAudioRef.current.pause();
        reviewAudioRef.current.currentTime = 0;
        reviewAudioRef.current.removeEventListener('timeupdate', handleReviewTimeUpdate);
        reviewAudioRef.current = null;
      }
      if (introAudioRef.current) {
        introAudioRef.current.pause();
        introAudioRef.current.currentTime = 0;
        introAudioRef.current = null;
      }
      if (fallbackRecordUrlRef.current) {
        URL.revokeObjectURL(fallbackRecordUrlRef.current);
        fallbackRecordUrlRef.current = null;
      }
    };
  }, [handleReviewEnded, handleReviewTimeUpdate]);

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

  useEffect(() => {
    if (!recordUrl) {
      reviewAudioCleanupRef.current?.();
      reviewAudioCleanupRef.current = null;
      const existing = reviewAudioRef.current;
      if (existing) {
        existing.pause();
        existing.currentTime = 0;
        existing.removeEventListener('timeupdate', handleReviewTimeUpdate);
      }
      reviewAudioRef.current = null;
      setIsPlayingAnswer(false);
      setPlayProgress(0);
      setCurrentAudioSource(prev => (prev === 'answer' ? null : prev));
      if (fallbackRecordUrlRef.current) {
        URL.revokeObjectURL(fallbackRecordUrlRef.current);
        fallbackRecordUrlRef.current = null;
      }
      return;
    }

    const audio = new Audio(recordUrl);
    audio.addEventListener('timeupdate', handleReviewTimeUpdate);

    reviewAudioCleanupRef.current?.();
    if (reviewAudioRef.current) {
      reviewAudioRef.current.pause();
      reviewAudioRef.current.removeEventListener('timeupdate', handleReviewTimeUpdate);
      setCurrentAudioSource(prev => (prev === 'answer' ? null : prev));
    }

    const lifecycleCleanup = attachAudioStatusHandlers(audio, 'answer', {
      onPlay: () => setIsPlayingAnswer(true),
      onPause: () => setIsPlayingAnswer(false),
      onEnded: () => {
        handleReviewEnded();
      },
      onError: () => setIsPlayingAnswer(false),
    });

    reviewAudioCleanupRef.current = () => {
      lifecycleCleanup();
      audio.removeEventListener('timeupdate', handleReviewTimeUpdate);
    };

    reviewAudioRef.current = audio;
    setIsPlayingAnswer(false);
    setPlayProgress(0);

    return () => {
      reviewAudioCleanupRef.current?.();
      reviewAudioCleanupRef.current = null;
      audio.pause();
      setCurrentAudioSource(prev => (prev === 'answer' ? null : prev));
      if (reviewAudioRef.current === audio) {
        reviewAudioRef.current = null;
      }
    };
  }, [recordUrl, handleReviewEnded, handleReviewTimeUpdate, attachAudioStatusHandlers]);

  const answeredCount = useMemo(() => Object.keys(submittedQuestions).length, [submittedQuestions]);

  const progressRatio = totalQuestions === 0 ? 0 : answeredCount / totalQuestions;
  const isPrimaryActionAudioLocked = Boolean(currentAudioSource);
  const audioSourceLabel = currentAudioSource ? AUDIO_SOURCE_LABEL[currentAudioSource] : null;

  const handleStartRecording = async () => {
    if (phase === 'uploading' || phase === 'recording' || currentAudioSource) return;
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
    if (fallbackRecordUrlRef.current) {
      URL.revokeObjectURL(fallbackRecordUrlRef.current);
      fallbackRecordUrlRef.current = null;
    }
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
    if (fallbackRecordUrlRef.current) {
      URL.revokeObjectURL(fallbackRecordUrlRef.current);
      fallbackRecordUrlRef.current = null;
    }
    setPhase('idle');
    setIsSubmitButtonBusy(false);
    setContentStage(hasIntroContent(question) ? 'intro' : 'question');
  };

  const handleSubmitRecording = async () => {
    if (!recordBlob || !question || isSubmitButtonBusy || phase === 'uploading') return;
    const practiceId = practiceAttemptIdRef.current;
    if (!practiceId) {
      pushToast({ tone: 'error', text: 'Practice session was not initialized. Please refresh the page.' });
      return;
    }

    const submittingTest = isFinalQuestion;
    setIsSubmitButtonBusy(true);
    setPhase('uploading');
    setErrorMessage(null);
    if (submittingTest) {
      emitTelemetry('speaking_submit_test_click', { question: question.number });
    }
    emitTelemetry('speaking_submit_click', { question: question.number });

    const formData = new FormData();
    formData.append('practice_id', practiceId);
    formData.append('question', String(question.number));
    formData.append('audio', recordBlob, `record_${question.number}.${audioFileExtension}`);

    try {
      await axiosInstance.post<PracticeSpeakingAnswer>('/practice/send/speaking', formData);
      emitTelemetry('speaking_submit_success', { question: question.number });
      setSubmittedQuestions(prev => ({ ...prev, [question.number]: true }));

      if (submittingTest) {
        const finishData = await finishAttempt(practiceId);
        if (!finishData?.id) {
          throw new Error('missing_feedback_id');
        }
        emitTelemetry('speaking_submit_test_success', { question: question.number, attemptId: finishData.id });
        router.replace(`/practice/speaking/feedback/${finishData.id}`);
        return;
      }

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
    } catch (error) {
      console.error(error);
      setPhase('error');
      const message = submittingTest
        ? 'We could not complete your test submission. Please try again.'
        : 'Something went wrong while submitting your answer. Please try again.';
      setErrorMessage(message);
      emitTelemetry('speaking_submit_error', { question: question.number });
      if (submittingTest) {
        emitTelemetry('speaking_submit_test_error', {
          question: question.number,
          reason: error instanceof Error ? error.message : 'unknown_error',
        });
      }
    } finally {
      setIsSubmitButtonBusy(false);
    }
  };

  const handleRetrySubmit = () => {
    if (phase !== 'error') return;
    setIsSubmitButtonBusy(false);
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
      if (isPracticeSpeakingPartValue(finishData?.part)) {
        setPartValue(finishData.part);
        if (typeof window !== 'undefined') {
          window.localStorage.setItem('speakingPreferredPart', finishData.part);
        }
      }
      if (finishData?.id) {
        setFeedbackAttemptId(finishData.id);
      }
      await clearPracticeSessionCookie('speaking');
      return finishData;
    } catch (error) {
      throw error instanceof Error ? error : new Error('finish_attempt_failed');
    } finally {
      setIsFinishingAttempt(false);
    }
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
      introAudioCleanupRef.current?.();
      const audio = new Audio(introUrl);
      introAudioCleanupRef.current = attachAudioStatusHandlers(audio, 'intro', {
        questionNumber: q?.number,
        onPlay: () => setIntroAudioState('playing'),
        onPause: () => setIntroAudioState('idle'),
        onEnded: () => {
          setIntroAudioState('idle');
          setContentStage('question');
          autoPlayQuestionAudio(q);
        },
        onError: () => setIntroAudioState('idle'),
      });
      introAudioRef.current = audio;
    }

    if (introAudioState === 'playing' && !forcePlay) {
      introAudioRef.current.pause();
      return;
    }

    introAudioRef.current.currentTime = 0;
    introAudioRef.current.play().catch(() => {
      setIntroAudioState('idle');
      setCurrentAudioSource(prev => (prev === 'intro' ? null : prev));
    });
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
      questionAudioCleanupRef.current?.();
      const audio = new Audio(q.question_url);
      questionAudioCleanupRef.current = attachAudioStatusHandlers(audio, 'question', {
        questionNumber: q.number,
        onPlay: () => setQuestionAudioState('playing'),
        onPause: () => setQuestionAudioState('idle'),
        onEnded: () => setQuestionAudioState('idle'),
        onError: () => setQuestionAudioState('idle'),
      });
      questionAudioRef.current = audio;
    }

    questionAudioRef.current.currentTime = 0;
    questionAudioRef.current.play().catch(() => {
      setQuestionAudioState('idle');
      setCurrentAudioSource(prev => (prev === 'question' ? null : prev));
    });
  };

  const handlePlayQuestionAudio = () => {
    if (!question?.question_url) {
      return;
    }
    const playbackState = audioPlaybackState[question.number] ?? { introPlayed: !hasIntroContent(question), questionPlayed: false };
    if (!playbackState.introPlayed || !playbackState.questionPlayed) {
      return;
    }
    if (currentAudioSource) {
      return;
    }

    autoPlayQuestionAudio();
  };

  const toggleAnswerPlayback = () => {
    const audio = reviewAudioRef.current;
    if (!audio) return;

    if (isPlayingAnswer) {
      audio.pause();
      setIsPlayingAnswer(false);
      setCurrentAudioSource(prev => (prev === 'answer' ? null : prev));
      return;
    }

    emitTelemetry('speaking_play_answer', { question: question?.number });
    try {
      audio.currentTime = 0;
    } catch (error) {
      console.error('Answer playback failed to seek', error);
      stopAnswerPlayback();
      pushToast({ tone: 'error', text: 'Playback is not supported on this device. Please re-record your answer.' });
      return;
    }
    setPlayProgress(0);
    setCurrentAudioSource('answer');
    let playPromise: Promise<void> | undefined;
    try {
      playPromise = audio.play();
    } catch (error) {
      console.error('Answer playback failed to start', error);
      stopAnswerPlayback();
      pushToast({ tone: 'error', text: 'Playback is not supported on this device. Please re-record your answer.' });
      return;
    }
    if (playPromise) {
      playPromise.catch(error => {
        console.error('Answer playback failed', error);
        stopAnswerPlayback();
        pushToast({ tone: 'error', text: 'Playback is not supported on this device. Please re-record your answer.' });
      });
    }
    setIsPlayingAnswer(true);
  };

  const stopAnswerPlayback = () => {
    const audio = reviewAudioRef.current;
    if (audio) {
      audio.pause();
      try {
        audio.currentTime = 0;
      } catch (error) {
        console.error('Answer playback reset failed', error);
      }
    }
    setIsPlayingAnswer(false);
    setPlayProgress(0);
    setCurrentAudioSource(prev => (prev === 'answer' ? null : prev));
  };

  const micIcon = phase === 'recording' ? <Mic className='size-[13rem] tablet:size-[16rem]' /> : <MicOff className='size-[13rem] tablet:size-[16rem]' />;

  useEffect(() => {
    setRecordBlob(null);
    setRecordUrl(null);
    setRecordDurationMs(0);
    setRecordElapsedMs(0);
    setPlayProgress(0);
    stopAnswerPlayback();
    reviewAudioCleanupRef.current?.();
    reviewAudioCleanupRef.current = null;
    questionAudioCleanupRef.current?.();
    questionAudioCleanupRef.current = null;
    questionAudioRef.current?.pause();
    questionAudioRef.current = null;
    setQuestionAudioState('idle');
    introAudioCleanupRef.current?.();
    introAudioCleanupRef.current = null;
    introAudioRef.current?.pause();
    introAudioRef.current = null;
    setIntroAudioState('idle');
    setCurrentAudioSource(null);
    if (fallbackRecordUrlRef.current) {
      URL.revokeObjectURL(fallbackRecordUrlRef.current);
      fallbackRecordUrlRef.current = null;
    }
    setContentStage(hasIntroContent(sortedQuestions[currentIndex]) ? 'intro' : 'question');
  }, [currentIndex]);

  if (!question) {
    return (
      <>
        <div className='min-h-[100dvh] bg-d-red-secondary'>
          <MobileHeader title='Practice' tag='Speaking' exitLabel={exitActionLabel} onClose={handleExit} variant='speaking' />

          <main className='mx-auto flex w-full flex-col items-center justify-center px-[16rem] py-[32rem] tablet:max-w-[720rem] tablet:px-[24rem] tablet:py-[72rem]'>
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className='w-full max-w-[520rem] rounded-[22rem] bg-white/95 px-[24rem] py-[28rem] text-center shadow-[0_24rem_64rem_-40rem_rgba(60,30,10,0.45)] tablet:max-w-none tablet:rounded-[28rem] tablet:px-[40rem] tablet:py-[40rem]'
            >
              <div className='mb-[12rem] text-[20rem] font-semibold text-d-black tablet:mb-[16rem] tablet:text-[26rem]'>No questions available right now</div>
              <p className='mb-[24rem] text-[14rem] text-d-black/70 tablet:mb-[32rem] tablet:text-[18rem]'>Please try again later or choose another practice set.</p>
              <Link
                href='/practice'
                className='mx-auto flex h-[48rem] w-full max-w-[240rem] items-center justify-center rounded-[26rem] bg-[#F9A826] text-[15rem] font-semibold text-white transition hover:bg-[#f8b645] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F9A826]/40 tablet:h-[54rem] tablet:max-w-[220rem] tablet:rounded-[32rem] tablet:text-[18rem]'
              >
                Back to profile
              </Link>
            </motion.div>
          </main>
        </div>
      </>
    );
  }

  const questionPlaybackState = audioPlaybackState[question.number] ?? {
    introPlayed: !hasIntroContent(question),
    questionPlayed: false,
  };
  const canReplayQuestionAudio = questionPlaybackState.introPlayed && questionPlaybackState.questionPlayed && !currentAudioSource;
  const isReviewPrimaryBusy = isSubmitButtonBusy || isPrimaryActionAudioLocked;
  const reviewPrimaryLabel = isSubmitButtonBusy
    ? isFinalQuestion
      ? 'Submitting test…'
      : 'Submitting…'
    : (audioSourceLabel ?? (isFinalQuestion ? 'Submit test' : 'Next'));

  return (
    <>
      <div className='min-h-[100dvh] bg-d-red-secondary'>
        <MobileHeader title='Practice' tag='Speaking' exitLabel={exitActionLabel} onClose={handleExit} variant='speaking' />

        <main className='mx-auto flex w-full flex-col items-center justify-start gap-[24rem] px-[16rem] py-[28rem] tablet:max-w-[1120rem] tablet:flex-row tablet:items-center tablet:justify-center tablet:gap-0 tablet:px-[16rem] tablet:py-[64rem]'>
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className='relative w-full max-w-[560rem] rounded-[20rem] border border-white/60 bg-white px-[18rem] py-[22rem] shadow-[0_18rem_48rem_-38rem_rgba(80,44,14,0.45)] backdrop-blur-sm tablet:max-w-[640rem] tablet:rounded-[24rem] tablet:border-white/40 tablet:bg-white/95 tablet:px-[24rem] tablet:py-[24rem] tablet:shadow-[0_26rem_60rem_-42rem_rgba(80,44,14,0.55)]'
          >
            <header className='mb-[18rem] flex flex-col gap-[10rem] tablet:mb-[20rem] tablet:gap-[12rem]'>
              <div className='flex flex-wrap items-center justify-center gap-[8rem] text-center text-[11rem] font-medium tracking-[0.08em] text-d-black/60 tablet:justify-start tablet:gap-[6rem] tablet:text-[12rem]'>
                <span>{partDetails?.label ?? 'Speaking Practice'}</span>
                <span className='text-d-black/30'>•</span>
                <span>{`Question ${currentIndex + 1} of ${totalQuestions}`}</span>
                <span className='text-d-black/30'>•</span>
                <span className='capitalize'>{contentStage === 'intro' ? 'Intro' : 'Question'}</span>
              </div>
              {partDetails?.blurb && (
                <div className='rounded-[14rem] border border-[#F6D7B0]/80 bg-[#FFF7EE] px-[14rem] py-[10rem] text-[12rem] text-d-black/75 tablet:text-[13rem]'>
                  {partDetails.blurb}
                </div>
              )}
              <div className='flex h-[5rem] w-full overflow-hidden rounded-full bg-[rgba(246,215,176,0.45)] tablet:h-[4rem]'>
                <div className='h-full rounded-full transition-all' style={{ width: `${Math.min(1, progressRatio) * 100}%`, backgroundColor: CTA_ORANGE }} />
              </div>
            </header>

            <section className='mb-[20rem] flex flex-col gap-[14rem] tablet:mb-[24rem] tablet:gap-[16rem]'>
              <motion.div
                layout
                whileHover={{ y: -3, boxShadow: '0 14rem 36rem -28rem rgba(120,64,12,0.35)' }}
                className='rounded-[18rem] border border-[#F6D7B0] bg-white px-[16rem] py-[16rem] shadow-[0_12rem_30rem_-28rem_rgba(80,44,14,0.35)] transition tablet:rounded-[20rem] tablet:px-[20rem] tablet:py-[20rem] tablet:shadow-[0_14rem_36rem_-30rem_rgba(80,44,14,0.4)]'
              >
                <div className='mb-[10rem] flex flex-row items-start gap-[12rem] tablet:items-center tablet:justify-between tablet:gap-[10rem]'>
                  <div className='flex flex-col gap-[4rem]'>
                    <span className='text-[10rem] font-medium uppercase tracking-[0.12em] text-[#AB7633] tablet:text-[11rem]'>Question {question.number}</span>
                    {partValue === '3' && (
                      <span className='w-fit rounded-full bg-[#FFF4E6] px-[10rem] py-[4rem] text-[10rem] font-semibold uppercase tracking-[0.14em] text-[#AB7633] tablet:text-[11rem]'>
                        Follow-up
                      </span>
                    )}
                    <h2 className='text-[16rem] font-semibold leading-[1.45] text-d-black tablet:text-[18rem]'>{question.question}</h2>
                  </div>
                  {question.question_url && (
                    <button
                      type='button'
                      onClick={handlePlayQuestionAudio}
                      disabled={!canReplayQuestionAudio}
                      className='flex size-[32rem] min-w-[32rem] items-center justify-center rounded-full border border-[#F6D7B0] bg-white text-[#AB7633] transition hover:bg-[#FFF0DA] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F9A826] tablet:size-[36rem] tablet:min-w-[36rem]'
                      aria-label='Replay question audio'
                    >
                      <Volume2 className={cn('size-[14rem] transition tablet:size-[16rem]', questionAudioState === 'playing' && 'animate-pulse')} />
                    </button>
                  )}
                </div>
              </motion.div>

              <motion.div
                layout
                className='flex flex-col gap-[12rem] rounded-[18rem] border border-[#F6D7B0]/70 bg-white px-[16rem] py-[16rem] tablet:gap-[14rem] tablet:rounded-[20rem] tablet:px-[18rem] tablet:py-[18rem]'
              >
                <div className='flex flex-col gap-[12rem] tablet:flex-row tablet:items-center tablet:justify-between tablet:gap-[14rem]'>
                  <div className='flex items-center gap-[10rem]'>
                    <div
                      className={cn(
                        'flex size-[32rem] items-center justify-center rounded-full border-2 tablet:size-[36rem]',
                        phase === 'recording' ? 'border-[#F9A826]/80 bg-[#FFF2D9]' : 'border-[#F6D7B0] bg-white'
                      )}
                    >
                      {micIcon}
                    </div>
                    <div>
                      {/*<div className='text-[14rem] font-semibold' style={{ color: micStatus.tone }}>*/}
                      {/*  {micStatus.label}*/}
                      {/*</div>*/}
                      <div className='text-[11.5rem] text-d-black/60 tablet:text-[12.5rem]'>Up to {timeLimitSeconds} seconds</div>
                    </div>
                  </div>
                  <div className='flex items-center gap-[6rem] text-[12rem] text-d-black/60 tablet:text-[12.5rem]'>
                    {
                      phase === 'recording' ? (
                        <span>{formatDuration(Date.now() - (recordStartRef.current ?? Date.now()))}</span>
                      ) : (
                        recordDurationMs > 0 && <span>{formatDuration(recordDurationMs)}</span>
                      )
                      //   : (
                      //   <span>{contentStage === 'intro' ? 'Listen to examiner feedback' : 'Ready when you are'}</span>
                      // )
                    }
                  </div>
                </div>
                <div className='h-[5rem] w-full overflow-hidden rounded-full bg-[#F6D7B0]/50 tablet:h-[4rem]'>
                  <div
                    className={cn('h-full rounded-full transition-all', phase === 'recording' ? 'bg-[#F9A826]' : 'bg-[#F6D7B0]')}
                    style={{ width: `${phase === 'recording' ? recordingProgress * 100 : phase === 'review' || phase === 'submitted' ? 100 : 2}%` }}
                  />
                </div>
                <div className='text-[11.5rem] text-d-black/60 tablet:text-[12.5rem]'>Status updates automatically as you record.</div>
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
                  className='flex flex-col gap-[14rem] rounded-[18rem] bg-[#FFF7EE] px-[16rem] py-[16rem] tablet:flex-row tablet:flex-wrap tablet:items-center tablet:justify-between tablet:gap-[10rem] tablet:px-[20rem] tablet:py-[18rem]'
                >
                  {phase === 'idle' && (
                    <>
                      <div className='text-[12.5rem] text-d-black/70 tablet:text-[13.5rem]'>
                        {contentStage === 'intro' && hasIntroContent(question)
                          ? 'Listen to examiner feedback before answering.'
                          : 'Take a moment to think, then start recording when ready.'}
                      </div>
                      <div className='flex w-full flex-col gap-[10rem] tablet:w-auto tablet:flex-row tablet:items-center'>
                        {contentStage === 'intro' && hasIntroContent(question) ? (
                          <button
                            type='button'
                            onClick={() => handlePlayIntro(true)}
                            disabled={isPrimaryActionAudioLocked}
                            aria-disabled={isPrimaryActionAudioLocked}
                            aria-busy={isPrimaryActionAudioLocked}
                            aria-live='polite'
                            className='flex h-[48rem] w-full items-center justify-center rounded-[24rem] border border-[#F6D7B0] bg-white px-[18rem] py-[12rem] text-[13rem] font-semibold text-[#AB7633] transition hover:bg-[#FFF0DA] tablet:h-[52rem] tablet:w-auto tablet:min-w-[150rem] tablet:px-[24rem] tablet:text-[13.5rem]'
                          >
                            {audioSourceLabel ?? 'Next'}
                          </button>
                        ) : (
                          <button
                            type='button'
                            onClick={handleStartRecording}
                            disabled={isPrimaryActionAudioLocked}
                            aria-disabled={isPrimaryActionAudioLocked}
                            aria-busy={isPrimaryActionAudioLocked}
                            aria-live='polite'
                            className='flex h-[52rem] w-full items-center justify-center rounded-[28rem] bg-[#F9A826] px-[22rem] py-[12rem] text-[14rem] font-semibold text-white transition hover:bg-[#f8b645] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F9A826] disabled:cursor-not-allowed disabled:bg-[#f7c76b] disabled:text-white/70 tablet:w-auto tablet:min-w-[160rem] tablet:px-[26rem] tablet:text-[14.5rem]'
                          >
                            {audioSourceLabel ?? 'Start recording'}
                          </button>
                        )}
                      </div>
                    </>
                  )}

                  {phase === 'permission' && (
                    <>
                      <div className='text-[12.5rem] text-d-black/70 tablet:text-[13.5rem]'>
                        Microphone access is needed. Allow access in your browser settings and retry.
                      </div>
                      <button
                        type='button'
                        onClick={retryPermission}
                        className='flex h-[48rem] w-full items-center justify-center rounded-[24rem] border border-[#F6D7B0] bg-white px-[18rem] py-[12rem] text-[13rem] font-semibold text-[#AB7633] transition hover:bg-[#FFF0DA] tablet:h-[52rem] tablet:w-auto tablet:min-w-[150rem] tablet:px-[24rem] tablet:text-[13.5rem]'
                      >
                        Retry permission
                      </button>
                    </>
                  )}

                  {phase === 'recording' && (
                    <>
                      <div className='text-[12.5rem] text-d-black/70 tablet:text-[13.5rem]'>Speak clearly. The recording will stop automatically at the time limit.</div>
                      <div className='flex w-full flex-col gap-[10rem] tablet:w-auto tablet:flex-row tablet:items-center'>
                        <button
                          type='button'
                          onClick={handleStopRecording}
                          className='flex h-[52rem] w-full items-center justify-center rounded-[28rem] bg-[#F9A826] px-[20rem] py-[12rem] text-[13rem] font-semibold text-white transition hover:bg-[#f8b645] tablet:h-[48rem] tablet:w-auto tablet:min-w-[110rem] tablet:px-[22rem] tablet:text-[13.5rem]'
                        >
                          <Square className='mr-[6rem] size-[14rem]' /> Stop
                        </button>
                        <button
                          type='button'
                          onClick={handleCancelRecording}
                          className='flex h-[48rem] w-full items-center justify-center rounded-[26rem] border border-[#F6D7B0] px-[20rem] py-[12rem] text-[13rem] font-medium text-d-black/70 transition hover:bg-[#FFF0DA] tablet:w-auto tablet:min-w-[110rem] tablet:px-[22rem] tablet:text-[13.5rem]'
                        >
                          <RefreshCw className='mr-[8rem] size-[16rem]' /> Cancel
                        </button>
                      </div>
                    </>
                  )}

                  {phase === 'review' && recordUrl && (
                    <>
                      <div className='flex flex-col gap-[10rem] text-[12.5rem] text-d-black/75 tablet:text-[13.5rem]'>
                        <span>Review your answer before submitting.</span>
                        <div className='flex w-full flex-col gap-[10rem] tablet:flex-row tablet:items-center'>
                          <div className='relative h-[6rem] w-full overflow-hidden rounded-full bg-[#F6D7B0]/50 tablet:w-[150rem]'>
                            <div className='absolute inset-y-0 left-0 rounded-full bg-[#F9A826]' style={{ width: `${playProgress * 100}%` }} />
                          </div>
                          <button
                            type='button'
                            onClick={toggleAnswerPlayback}
                            className='hover.bg-[#FFF0DA] flex h-[44rem] w-full items-center justify-center gap-[8rem] rounded-[22rem] border border-[#F6D7B0] px-[16rem] py-[8rem] text-[13rem] font-medium text-[#AB7633] transition tablet:w-auto'
                          >
                            <Play className='size-[14rem]' /> Play your answer
                          </button>
                        </div>
                      </div>
                      <div className='flex w-full flex-col gap-[10rem] tablet:w-auto tablet:flex-row tablet:items-center'>
                        <button
                          type='button'
                          onClick={handleSubmitRecording}
                          disabled={isReviewPrimaryBusy}
                          aria-disabled={isReviewPrimaryBusy}
                          aria-busy={isReviewPrimaryBusy}
                          aria-live='polite'
                          className='flex h-[52rem] w-full items-center justify-center gap-[8rem] rounded-[28rem] bg-[#F9A826] px-[22rem] py-[12rem] text-[14rem] font-semibold text-white transition hover:bg-[#f8b645] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F9A826] disabled:cursor-not-allowed disabled:bg-[#f7c76b] disabled:text-white/70 tablet:w-auto tablet:min-w-[140rem] tablet:px-[26rem] tablet:text-[14.5rem]'
                        >
                          {isSubmitButtonBusy && <Loader2 className='size-[16rem] animate-spin' aria-hidden='true' />}
                          {reviewPrimaryLabel}
                        </button>
                        <button
                          type='button'
                          onClick={handleRetryRecording}
                          className='flex h-[48rem] w-full items-center justify-center rounded-[26rem] border border-[#F6D7B0] px-[20rem] py-[12rem] text-[13rem] font-medium text-d-black/70 transition hover:bg-[#FFF0DA] tablet:w-auto tablet:min-w-[110rem] tablet:px-[22rem] tablet:text-[13.5rem]'
                        >
                          Retry
                        </button>
                      </div>
                    </>
                  )}

                  {phase === 'uploading' && (
                    <div className='flex w-full flex-col items-center justify-center gap-[12rem] text-[13.5rem] text-d-black/70 tablet:flex-row tablet:justify-between tablet:text-[15rem]'>
                      <div className='flex items-center gap-[12rem]' role='status' aria-live='polite'>
                        <Loader2 className='size-[18rem] animate-spin text-[#F9A826]' aria-hidden='true' /> Submitting your answer…
                      </div>
                      <button
                        type='button'
                        disabled
                        aria-disabled='true'
                        aria-busy='true'
                        className='flex h-[52rem] w-full items-center justify-center gap-[8rem] rounded-[28rem] bg-[#F9A826] px-[22rem] py-[12rem] text-[14rem] font-semibold text-white tablet:w-auto tablet:min-w-[150rem] tablet:px-[26rem] tablet:text-[14.5rem]'
                      >
                        <Loader2 className='size-[16rem] animate-spin' aria-hidden='true' /> {isFinalQuestion ? 'Submitting test…' : 'Submitting…'}
                      </button>
                    </div>
                  )}

                  {phase === 'submitted' && (
                    <>
                      <div className='flex items-center justify-center gap-[12rem] text-[14rem] text-[#0F9D58] tablet:justify-start tablet:text-[15rem]'>
                        <Mic className='size-[16rem] tablet:size-[18rem]' /> Answer submitted
                      </div>
                      <button
                        type='button'
                        onClick={handleNextQuestion}
                        className='flex h-[54rem] w-full items-center justify-center rounded-[28rem] bg-[#F9A826] px-[24rem] py-[14rem] text-[15rem] font-semibold text-white transition hover:bg-[#f8b645] disabled:cursor-not-allowed disabled:bg-[#f6ba55] tablet:w-auto tablet:min-w-[170rem] tablet:px-[28rem] tablet:text-[16rem]'
                        disabled={isLastQuestion() && isFinishingAttempt && !feedbackAttemptId}
                      >
                        {isLastQuestion() ? (feedbackAttemptId ? 'View feedback' : isFinishingAttempt ? 'Preparing feedback…' : 'Back to profile') : 'Next question'}
                        {!isLastQuestion() && <SkipForward className='ml-[8rem] size-[16rem]' />}
                      </button>
                    </>
                  )}

                  {phase === 'error' && (
                    <>
                      <div className='text-[13.5rem] text-[#C2402C] tablet:text-[15rem]'>{errorMessage ?? 'We could not submit your answer.'}</div>
                      <div className='flex w-full flex-col gap-[10rem] tablet:w-auto tablet:flex-row tablet:items-center tablet:gap-[12rem]'>
                        <button
                          type='button'
                          onClick={handleRetrySubmit}
                          className='flex h-[52rem] w-full items-center justify-center rounded-[28rem] bg-[#F9A826] px-[22rem] py-[12rem] text-[14.5rem] font-semibold text-white transition hover:bg-[#f8b645] tablet:w-auto tablet:min-w-[120rem] tablet:px-[28rem] tablet:py-[14rem] tablet:text-[16rem]'
                        >
                          Retry
                        </button>
                        <button
                          type='button'
                          onClick={handleRetryRecording}
                          className='flex h-[48rem] w-full items-center justify-center rounded-[26rem] border border-[#F6D7B0] px-[20rem] py-[12rem] text-[13.5rem] font-medium text-d-black/70 transition hover:bg-[#FFF0DA] tablet:w-auto tablet:min-w-[120rem] tablet:px-[24rem] tablet:py-[14rem] tablet:text-[15rem]'
                        >
                          Re-record
                        </button>
                      </div>
                    </>
                  )}
                </motion.div>
              </AnimatePresence>
            </section>

            <footer className='flex flex-col gap-[12rem] tablet:gap-[16rem]'>
              <div className='text-center text-[12rem] text-d-black/50 tablet:text-left tablet:text-[13rem]'>Your feedback will be generated after submission.</div>
            </footer>

            <AnimatePresence>
              {toast && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className={cn(
                    'pointer-events-auto absolute bottom-[16rem] left-1/2 z-20 flex w-[calc(100%-32rem)] max-w-[360rem] -translate-x-1/2 items-center gap-[12rem] rounded-[16rem] px-[20rem] py-[12rem] text-[13.5rem] shadow-[0_14rem_40rem_-28rem_rgba(80,44,14,0.5)] backdrop-blur-sm tablet:bottom-[24rem] tablet:w-auto tablet:max-w-none tablet:py-[14rem] tablet:text-[14rem]',
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
        </main>
      </div>
    </>
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
