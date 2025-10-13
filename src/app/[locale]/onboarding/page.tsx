'use client';

import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { OnboardingLayout, StepFinish, StepFocus, StepLevel, StepNavigator, StepPriority, StepProgress, StepRhythm, StepWelcome } from '@/components/onboarding';
import { DEFAULT_ONBOARDING_STEPS, ONBOARDING_STORAGE_KEY } from '@/components/onboarding/constants';
import type { BaseStepProps, OnboardingAnswers, OnboardingStepDefinition, OnboardingStepId } from '@/components/onboarding/types';
import { useOnboardingMachine } from '@/hooks/useOnboardingMachine';
import { useProfile } from '@/hooks/useProfile';
import { completeOnboarding } from '@/lib/onboarding';
import { getOnboardingSchema } from '@/api/GET_onboarding_schema';
import { OnboardingSubmitError } from '@/api/POST_onboarding_submit';
import type { OnboardingSchemaQuestion, OnboardingSchemaResponse, OnboardingSubmitAnswer } from '@/types/OnboardingSchema';

const stepComponents: Record<OnboardingStepId, (props: BaseStepProps) => JSX.Element> = {
  intro: StepWelcome,
  goal: StepLevel,
  score: StepFocus,
  timeline: StepRhythm,
  priority: StepPriority,
  finish: StepFinish,
};

const stepMeta: Record<OnboardingStepId, { headingKey: string; descriptionKey?: string; supportingKey: string }> = {
  intro: {
    headingKey: 'onboarding.steps.intro.title',
    descriptionKey: 'onboarding.steps.intro.subtitle',
    supportingKey: 'onboarding.supporting.intro',
  },
  goal: {
    headingKey: 'onboarding.steps.goal.title',
    descriptionKey: 'onboarding.steps.goal.subtitle',
    supportingKey: 'onboarding.supporting.goal',
  },
  score: {
    headingKey: 'onboarding.steps.score.title',
    descriptionKey: 'onboarding.steps.score.subtitle',
    supportingKey: 'onboarding.supporting.score',
  },
  timeline: {
    headingKey: 'onboarding.steps.timeline.title',
    descriptionKey: 'onboarding.steps.timeline.subtitle',
    supportingKey: 'onboarding.supporting.timeline',
  },
  priority: {
    headingKey: 'onboarding.steps.priority.title',
    descriptionKey: 'onboarding.steps.priority.subtitle',
    supportingKey: 'onboarding.supporting.priority',
  },
  finish: {
    headingKey: 'onboarding.steps.finish.title',
    descriptionKey: 'onboarding.steps.finish.subtitle',
    supportingKey: 'onboarding.supporting.finish',
  },
};

const defaultStepMap = new Map<OnboardingStepId, OnboardingStepDefinition>(DEFAULT_ONBOARDING_STEPS.map(step => [step.id, step]));

function isKnownStepId(id: string): id is OnboardingStepId {
  return defaultStepMap.has(id as OnboardingStepId);
}

function createDynamicFlow(questions: OnboardingSchemaQuestion[]): { steps: OnboardingStepDefinition[]; map: Map<OnboardingStepId, OnboardingSchemaQuestion> } {
  const stepQuestions = new Map<OnboardingStepId, OnboardingSchemaQuestion>();
  const steps: OnboardingStepDefinition[] = [];
  const sortedQuestions = [...questions].sort((a, b) => a.order - b.order);
  const baseSteps = DEFAULT_ONBOARDING_STEPS.filter(step => step.id !== 'finish');

  for (const question of sortedQuestions) {
    let stepId: OnboardingStepId | undefined;

    if (isKnownStepId(question.id) && question.id !== 'finish' && !stepQuestions.has(question.id)) {
      stepId = question.id;
    } else {
      const fallback = baseSteps.find(candidate => !stepQuestions.has(candidate.id));
      stepId = fallback?.id;
    }

    if (!stepId || stepQuestions.has(stepId)) continue;

    const template = defaultStepMap.get(stepId);
    if (!template) continue;

    stepQuestions.set(stepId, question);
    steps.push(template);
  }

  if (!steps.length) {
    return { steps: DEFAULT_ONBOARDING_STEPS, map: stepQuestions };
  }

  const finishStep = defaultStepMap.get('finish');
  if (finishStep) {
    steps.push(finishStep);
  }

  return { steps, map: stepQuestions };
}

function buildSubmitAnswers(answers: OnboardingAnswers, stepQuestions: Map<OnboardingStepId, OnboardingSchemaQuestion>): OnboardingSubmitAnswer[] {
  const payload: OnboardingSubmitAnswer[] = [];

  const addAnswer = (stepId: OnboardingStepId, optionIds: string[], customText?: string) => {
    const question = stepQuestions.get(stepId);
    if (!question || optionIds.length === 0) return;

    const validIds = optionIds.filter(id => question.options.some(option => option.id === id));
    if (validIds.length === 0) return;

    const options = validIds
      .map<OnboardingSubmitAnswer['options'][number] | null>(id => {
        const option = question.options.find(item => item.id === id);
        if (!option) return null;
        if (option.allows_custom_answer) {
          const trimmed = (customText ?? '').trim();
          if (!trimmed) {
            return null;
          }
          return { id, custom_text: trimmed };
        }
        return { id, custom_text: null };
      })
      .filter((value): value is OnboardingSubmitAnswer['options'][number] => value !== null);

    if (!options.length) return;
    payload.push({ question_id: question.id, options });
  };

  addAnswer('intro', answers.introReasons);
  addAnswer('goal', answers.goal ? [answers.goal] : [], answers.goalOther);
  addAnswer('score', answers.targetScore ? [answers.targetScore] : []);
  addAnswer('timeline', answers.timeline ? [answers.timeline] : []);
  addAnswer('priority', answers.prioritySections);

  return payload;
}

interface PageProps {
  params: {
    locale: string;
  };
}

export default function OnboardingPage({ params }: PageProps) {
  const { locale } = params;
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations();
  const prefersReducedMotion = useReducedMotion();
  const { profile, status: profileStatus, setProfile } = useProfile();

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [schema, setSchema] = useState<OnboardingSchemaResponse | null>(null);
  const [schemaLoading, setSchemaLoading] = useState(true);
  const [schemaError, setSchemaError] = useState<string | null>(null);
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const headingId = useId();
  const formId = useId();
  const schemaRequestedRef = useRef(false);

  const fetchSchema = useCallback(async () => {
    schemaRequestedRef.current = true;
    setSchemaLoading(true);
    setSchemaError(null);
    try {
      const data = await getOnboardingSchema();
      setSchema(data);
    } catch (error) {
      console.error(error);
      setSchema(null);
      setSchemaError(error instanceof Error ? error.message : 'Failed to load onboarding schema');
    } finally {
      setSchemaLoading(false);
    }
  }, []);

  const stepParam = searchParams.get('step');
  const hasQueryStep = Boolean(stepParam);

  const questions = useMemo(() => {
    if (!schema) return [] as OnboardingSchemaQuestion[];
    return [...schema.questions].sort((a, b) => a.order - b.order);
  }, [schema]);

  const { steps: dynamicSteps, map: stepQuestionMap } = useMemo(() => createDynamicFlow(questions), [questions]);
  const initialStepIndex = useMemo(() => {
    const parsed = stepParam ? Number.parseInt(stepParam, 10) - 1 : 0;
    if (Number.isNaN(parsed)) return 0;
    const maxIndex = dynamicSteps.length ? dynamicSteps.length - 1 : DEFAULT_ONBOARDING_STEPS.length - 1;
    return Math.max(0, Math.min(parsed, maxIndex));
  }, [stepParam, dynamicSteps.length]);

  useEffect(() => {
    if (profileStatus !== 'success') return;
    if (profile?.onboarding_completed) {
      setSchemaLoading(false);
      return;
    }
    if (schemaRequestedRef.current) return;
    fetchSchema();
  }, [fetchSchema, profileStatus, profile?.onboarding_completed]);

  const { answers, currentStep, currentStepIndex, totalSteps, canNext, stepErrorKey, updateAnswers, clearError, next, back, submit } = useOnboardingMachine({
    initialStepIndex,
    ignoreStoredStep: hasQueryStep,
    steps: dynamicSteps,
    schemaVersion: schema?.version ?? null,
  });
  const currentStepId = (currentStep?.id ?? 'finish') as OnboardingStepId;
  const currentQuestion = stepQuestionMap.get(currentStepId);

  useEffect(() => {
    if (profileStatus !== 'success') return;
    if (!profile?.onboarding_completed) return;
    router.replace(`/${locale}/profile`);
  }, [profileStatus, profile?.onboarding_completed, router, locale]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!toastMessage) return;
    const timeout = window.setTimeout(() => setToastMessage(null), 4200);
    return () => window.clearTimeout(timeout);
  }, [toastMessage]);

  useEffect(() => {
    if (!mounted) return;
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    params.set('step', String(currentStepIndex + 1));
    router.replace(`/${locale}/onboarding?${params.toString()}`, { scroll: false });
  }, [currentStepIndex, locale, router, searchParams, mounted]);

  const StepComponent = getStepComponent(currentStepId);

  const errorMessage = stepErrorKey ? t(stepErrorKey) : null;

  const progressLabel = t('onboarding.progress.label', { current: currentStepIndex + 1, total: totalSteps });

  const meta = stepMeta[currentStepId];
  const announcementTitle = currentStepId === 'finish' ? (meta ? t(meta.headingKey) : '') : (currentQuestion?.title ?? (meta ? t(meta.headingKey) : ''));
  const announcement = t('onboarding.accessibility.stepAnnouncement', {
    current: currentStepIndex + 1,
    total: totalSteps,
    title: announcementTitle,
  });

  const isLastStep = currentStepId === 'finish';

  const primaryLabel = isLastStep ? t('onboarding.navigator.finish') : t('onboarding.navigator.next');
  const heading =
    currentStepId === 'finish' ? (meta ? t(meta.headingKey) : (currentQuestion?.title ?? '')) : (currentQuestion?.title ?? (meta ? t(meta.headingKey) : ''));
  const subheading =
    currentStepId === 'finish'
      ? meta?.descriptionKey
        ? t(meta.descriptionKey)
        : (currentQuestion?.description ?? undefined)
      : meta?.descriptionKey
        ? t(meta.descriptionKey)
        : undefined;
  const supportingText = meta ? t(meta.supportingKey) : (currentQuestion?.description ?? undefined);

  const toastVariants = {
    initial: { opacity: 0, y: -8 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' } },
    exit: { opacity: 0, y: -8, transition: { duration: 0.2, ease: 'easeIn' } },
  };

  const stepVariants = {
    initial: { opacity: prefersReducedMotion ? 1 : 0, x: prefersReducedMotion ? 0 : 32 },
    animate: { opacity: 1, x: 0, transition: { duration: prefersReducedMotion ? 0 : 0.45, ease: 'easeInOut' } },
    exit: { opacity: prefersReducedMotion ? 1 : 0, x: prefersReducedMotion ? 0 : -32, transition: { duration: prefersReducedMotion ? 0 : 0.35, ease: 'easeInOut' } },
  };

  const handleNext = async (event?: React.FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    if (schemaLoading || schemaError) return;

    if (isLastStep) {
      await handleFinish();
      return;
    }

    const result = next();
    if (!result.ok) {
      return;
    }
  };

  const handleBack = () => {
    if (schemaLoading) return;
    back();
  };

  const handleFinish = async () => {
    if (isSubmitting) return;
    if (!schema || schemaLoading) {
      setToastMessage(t('onboarding.errors.submitFailed'));
      return;
    }

    setIsSubmitting(true);
    const payload = submit();
    const answersForBackend = buildSubmitAnswers(payload, stepQuestionMap);
    const idempotencyKey = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;

    try {
      if (!answersForBackend.length) {
        throw new Error('No onboarding answers to submit');
      }

      await completeOnboarding({
        schemaVersion: schema.version,
        answers: answersForBackend,
        idempotencyKey,
      });

      if (profile) {
        setProfile({ ...profile, onboarding_completed: true });
      }

      if (typeof window !== 'undefined') {
        try {
          window.sessionStorage.removeItem(ONBOARDING_STORAGE_KEY);
        } catch (error) {
          console.error('[onboarding] failed to clear storage', error);
        }
      }

      router.push(`/${locale}/profile`);
    } catch (error) {
      if (error instanceof OnboardingSubmitError && error.code === 'schema_version_conflict') {
        await fetchSchema();
      } else {
        console.error(error);
      }

      setToastMessage(t('onboarding.errors.submitFailed'));
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (!mounted) return;
    const node = headingRef.current;
    if (!node) return;
    window.requestAnimationFrame(() => {
      node.focus();
    });
  }, [currentStepId, mounted]);

  if (profileStatus === 'success' && profile?.onboarding_completed) {
    return null;
  }

  return (
    <OnboardingLayout
      heading={heading}
      description={subheading}
      supportingText={supportingText}
      progress={<StepProgress currentStep={currentStepIndex + 1} totalSteps={totalSteps} label={progressLabel} />}
      headingRef={headingRef}
      headingId={headingId}
      footer={
        <div className='flex flex-col gap-[12rem]'>
          <AnimatePresence>
            {toastMessage ? (
              <motion.div
                key='toast'
                variants={toastVariants}
                initial='initial'
                animate='animate'
                exit='exit'
                className='rounded-[14rem] border border-blue-100 bg-blue-50 px-[16rem] py-[12rem] text-[13.5rem] text-blue-700 shadow-[0_12rem_24rem_-20rem_rgba(37,99,235,0.45)]'
                role='status'
              >
                {toastMessage}
              </motion.div>
            ) : null}
          </AnimatePresence>
          <StepNavigator
            primaryLabel={primaryLabel}
            primaryType='submit'
            disablePrimary={schemaLoading || schemaError !== null || (!canNext && !isLastStep)}
            loadingPrimary={isSubmitting}
            onBack={currentStepIndex > 0 ? handleBack : undefined}
            backLabel={t('onboarding.navigator.back')}
            disableBack={schemaLoading || schemaError !== null || currentStepIndex === 0}
            formId={formId}
          />
        </div>
      }
      announcement={announcement}
    >
      <form id={formId} className='flex flex-col gap-[16rem]' onSubmit={handleNext} noValidate aria-labelledby={headingId}>
        <AnimatePresence mode='wait'>
          <motion.div key={currentStepId} variants={stepVariants} initial='initial' animate='animate' exit='exit'>
            {schemaLoading ? (
              <div className='flex h-[220rem] items-center justify-center text-[14rem] text-slate-500'>{t('onboarding.transition.preparing')}</div>
            ) : schemaError ? (
              <div className='flex flex-col gap-[12rem] rounded-[16rem] border border-red-100 bg-red-50 px-[18rem] py-[16rem] text-[13rem] text-red-600'>
                <span>{schemaError}</span>
                <button
                  type='button'
                  onClick={fetchSchema}
                  className='inline-flex w-fit items-center justify-center self-start rounded-full border border-red-200 px-[14rem] py-[8rem] text-[12.5rem] font-medium text-red-600 transition hover:bg-red-100'
                >
                  Retry
                </button>
              </div>
            ) : (
              <StepComponent
                answers={answers}
                onUpdate={updateAnswers}
                t={t}
                error={errorMessage}
                clearError={clearError}
                question={currentQuestion}
                questions={questions}
                stepQuestions={stepQuestionMap}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </form>
    </OnboardingLayout>
  );
}

function getStepComponent(stepId: OnboardingStepId) {
  return stepComponents[stepId] ?? StepWelcome;
}
