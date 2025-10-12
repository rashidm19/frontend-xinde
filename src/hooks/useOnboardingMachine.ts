'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { ONBOARDING_STEPS, ONBOARDING_STORAGE_KEY } from '@/components/onboarding/constants';
import type { OnboardingAnswers } from '@/components/onboarding/types';

interface UseOnboardingMachineOptions {
  initialStepIndex?: number;
  initialAnswers?: Partial<OnboardingAnswers>;
  ignoreStoredStep?: boolean;
}

interface PersistencePayload {
  answers: OnboardingAnswers;
  step: number;
}

const defaultAnswers: OnboardingAnswers = {
  introReasons: [],
  goal: undefined,
  goalOther: '',
  targetScore: undefined,
  timeline: undefined,
  prioritySections: [],
};

export function useOnboardingMachine({ initialStepIndex = 0, initialAnswers, ignoreStoredStep }: UseOnboardingMachineOptions = {}) {
  const [answers, setAnswers] = useState<OnboardingAnswers>(() => ({
    ...defaultAnswers,
    ...initialAnswers,
    introReasons: normalizeArray(initialAnswers?.introReasons ?? defaultAnswers.introReasons),
    prioritySections: normalizeArray(initialAnswers?.prioritySections ?? defaultAnswers.prioritySections),
  }));
  const [currentStepIndex, setCurrentStepIndex] = useState(() => clampStep(initialStepIndex));
  const [stepErrorKey, setStepErrorKey] = useState<string | null>(null);
  const hydratedRef = useRef(false);

  const totalSteps = ONBOARDING_STEPS.length;
  const currentStep = ONBOARDING_STEPS[currentStepIndex];

  const canNext = useMemo(() => {
    if (!currentStep?.validate) return true;
    return currentStep.validate(answers);
  }, [answers, currentStep]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (hydratedRef.current) return;

    try {
      const storedRaw = window.sessionStorage.getItem(ONBOARDING_STORAGE_KEY);

      if (storedRaw) {
        const stored = JSON.parse(storedRaw) as PersistencePayload;
        if (stored.answers) {
          setAnswers(prev => ({
            ...prev,
            ...stored.answers,
            introReasons: normalizeArray(stored.answers.introReasons ?? prev.introReasons),
            prioritySections: normalizeArray(stored.answers.prioritySections ?? prev.prioritySections),
          }));
        }

        if (!ignoreStoredStep && typeof stored.step === 'number') {
          setCurrentStepIndex(clampStep(stored.step));
        }
      }
    } catch (error) {
      console.error('[useOnboardingMachine] failed to read persistence', error);
    } finally {
      hydratedRef.current = true;
    }
  }, [ignoreStoredStep]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!hydratedRef.current) return;

    const payload: PersistencePayload = {
      answers,
      step: currentStepIndex,
    };

    try {
      window.sessionStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(payload));
    } catch (error) {
      console.error('[useOnboardingMachine] failed to persist state', error);
    }
  }, [answers, currentStepIndex]);

  const updateAnswers = useCallback((patch: Partial<OnboardingAnswers>) => {
    setAnswers(prev => {
      const next: OnboardingAnswers = {
        ...prev,
        ...patch,
        introReasons: normalizeArray(patch.introReasons ?? prev.introReasons),
        prioritySections: normalizeArray(patch.prioritySections ?? prev.prioritySections),
      };
      return next;
    });
  }, []);

  const clearError = useCallback(() => {
    setStepErrorKey(null);
  }, []);

  const goToStep = useCallback((index: number) => {
    setCurrentStepIndex(clampStep(index));
    setStepErrorKey(null);
  }, []);

  const next = useCallback(() => {
    const step = ONBOARDING_STEPS[currentStepIndex];
    if (!step) return { ok: false as const };

    if (step.validate && !step.validate(answers)) {
      setStepErrorKey(step.validationKey ?? null);
      return { ok: false as const, errorKey: step.validationKey };
    }

    setStepErrorKey(null);
    if (currentStepIndex < totalSteps - 1) {
      setCurrentStepIndex(prev => clampStep(prev + 1));
    }

    return { ok: true as const };
  }, [answers, currentStepIndex, totalSteps]);

  const back = useCallback(() => {
    setStepErrorKey(null);
    setCurrentStepIndex(prev => clampStep(prev - 1));
  }, []);

  const submit = useCallback(() => answers, [answers]);

  return {
    answers,
    currentStepIndex,
    currentStep,
    totalSteps,
    canNext,
    stepErrorKey,
    updateAnswers,
    clearError,
    next,
    back,
    submit,
    goToStep,
  };
}

function clampStep(value: number) {
  const maxIndex = ONBOARDING_STEPS.length - 1;
  return Math.min(Math.max(0, value), maxIndex);
}

function normalizeArray<T extends string>(values?: T[]) {
  return Array.from(new Set((values ?? []).filter(Boolean))) as T[];
}
