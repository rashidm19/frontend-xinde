'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { DEFAULT_ONBOARDING_STEPS, ONBOARDING_STORAGE_KEY } from '@/components/onboarding/constants';
import type { OnboardingAnswers, OnboardingStepDefinition } from '@/components/onboarding/types';

interface UseOnboardingMachineOptions {
  initialStepIndex?: number;
  initialAnswers?: Partial<OnboardingAnswers>;
  ignoreStoredStep?: boolean;
  steps?: OnboardingStepDefinition[];
  schemaVersion?: number | null;
}

interface PersistencePayload {
  answers: OnboardingAnswers;
  step: number;
  schemaVersion: number;
}

const defaultAnswers: OnboardingAnswers = {
  introReasons: [],
  goal: undefined,
  goalOther: '',
  targetScore: undefined,
  timeline: undefined,
  prioritySections: [],
};

export function useOnboardingMachine({ initialStepIndex = 0, initialAnswers, ignoreStoredStep, steps = DEFAULT_ONBOARDING_STEPS, schemaVersion }: UseOnboardingMachineOptions = {}) {
  const [answers, setAnswers] = useState<OnboardingAnswers>(() => mergeAnswers(defaultAnswers, initialAnswers));
  const [currentStepIndex, setCurrentStepIndex] = useState(() => clampStep(initialStepIndex, steps.length || DEFAULT_ONBOARDING_STEPS.length));
  const [stepErrorKey, setStepErrorKey] = useState<string | null>(null);
  const hydratedRef = useRef(false);
  const previousSchemaVersionRef = useRef<number | null>(null);

  const resolvedSteps = useMemo<OnboardingStepDefinition[]>(() => {
    const provided = steps.length ? steps : DEFAULT_ONBOARDING_STEPS;
    const uniqueIds = new Set<string>();
    const normalized = provided.filter(step => {
      if (uniqueIds.has(step.id)) return false;
      uniqueIds.add(step.id);
      return true;
    });

    const hasFinish = normalized.some(step => step.id === 'finish');
    if (!hasFinish) {
      const finishFallback = DEFAULT_ONBOARDING_STEPS.find(step => step.id === 'finish') ?? { id: 'finish' };
      normalized.push(finishFallback);
    }

    return normalized;
  }, [steps]);

  const totalSteps = resolvedSteps.length;
  const currentStep = resolvedSteps[currentStepIndex] ?? resolvedSteps[resolvedSteps.length - 1];

  useEffect(() => {
    setCurrentStepIndex(prev => clampStep(prev, resolvedSteps.length));
  }, [resolvedSteps.length]);

  const canNext = useMemo(() => {
    if (!currentStep?.validate) return true;
    return currentStep.validate(answers);
  }, [answers, currentStep]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (hydratedRef.current) return;
    if (schemaVersion == null) return;

    try {
      const storedRaw = window.sessionStorage.getItem(ONBOARDING_STORAGE_KEY);

      if (storedRaw) {
        const stored = JSON.parse(storedRaw) as PersistencePayload;
        if (stored.schemaVersion === schemaVersion) {
          if (stored.answers) {
            setAnswers(prev => mergeAnswers(prev, stored.answers));
          }

          if (!ignoreStoredStep && typeof stored.step === 'number') {
            setCurrentStepIndex(clampStep(stored.step, resolvedSteps.length));
          }
        }
      }
    } catch (error) {
      console.error('[useOnboardingMachine] failed to read persistence', error);
    } finally {
      hydratedRef.current = true;
      previousSchemaVersionRef.current = schemaVersion ?? null;
    }
  }, [ignoreStoredStep, resolvedSteps.length, schemaVersion]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!hydratedRef.current) return;
    if (schemaVersion == null) return;

    const payload: PersistencePayload = {
      answers,
      step: currentStepIndex,
      schemaVersion,
    };

    try {
      window.sessionStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(payload));
    } catch (error) {
      console.error('[useOnboardingMachine] failed to persist state', error);
    }
  }, [answers, currentStepIndex, schemaVersion]);

  useEffect(() => {
    if (!hydratedRef.current) return;
    if (schemaVersion == null) return;
    if (previousSchemaVersionRef.current === null) {
      previousSchemaVersionRef.current = schemaVersion;
      return;
    }

    if (previousSchemaVersionRef.current !== schemaVersion) {
      setAnswers(defaultAnswers);
      setCurrentStepIndex(0);
      setStepErrorKey(null);
      previousSchemaVersionRef.current = schemaVersion;

      if (typeof window !== 'undefined') {
        try {
          window.sessionStorage.removeItem(ONBOARDING_STORAGE_KEY);
        } catch (error) {
          console.error('[useOnboardingMachine] failed to clear persistence', error);
        }
      }
    }
  }, [schemaVersion]);

  const updateAnswers = useCallback((patch: Partial<OnboardingAnswers>) => {
    setAnswers(prev => mergeAnswers(prev, patch));
  }, []);

  const clearError = useCallback(() => {
    setStepErrorKey(null);
  }, []);

  const goToStep = useCallback(
    (index: number) => {
      setCurrentStepIndex(clampStep(index, resolvedSteps.length));
      setStepErrorKey(null);
    },
    [resolvedSteps.length]
  );

  const next = useCallback(() => {
    const step = resolvedSteps[currentStepIndex];
    if (!step) return { ok: false as const };

    if (step.validate && !step.validate(answers)) {
      setStepErrorKey(step.validationKey ?? null);
      return { ok: false as const, errorKey: step.validationKey };
    }

    setStepErrorKey(null);
    if (currentStepIndex < totalSteps - 1) {
      setCurrentStepIndex(prev => clampStep(prev + 1, resolvedSteps.length));
    }

    return { ok: true as const };
  }, [answers, currentStepIndex, resolvedSteps, totalSteps]);

  const back = useCallback(() => {
    setStepErrorKey(null);
    setCurrentStepIndex(prev => clampStep(prev - 1, resolvedSteps.length));
  }, [resolvedSteps.length]);

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
    steps: resolvedSteps,
  };
}

function clampStep(value: number, stepsLength: number) {
  const maxIndex = Math.max(stepsLength - 1, 0);
  return Math.min(Math.max(0, value), maxIndex);
}

function normalizeArray<T extends string>(values?: T[]) {
  return Array.from(new Set((values ?? []).filter(Boolean))) as T[];
}

function mergeAnswers(base: OnboardingAnswers, patch?: Partial<OnboardingAnswers>): OnboardingAnswers {
  const next: OnboardingAnswers = {
    ...base,
    ...patch,
  };

  next.introReasons = normalizeArray(patch?.introReasons ?? base.introReasons);
  next.prioritySections = normalizeArray(patch?.prioritySections ?? base.prioritySections);
  next.goalOther = patch?.goalOther ?? base.goalOther ?? '';

  return next;
}
