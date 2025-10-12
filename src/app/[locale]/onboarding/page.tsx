"use client";

import { useEffect, useMemo, useRef, useState, useId } from "react";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

import {
  OnboardingLayout,
  ONBOARDING_STEPS,
  StepFinish,
  StepFocus,
  StepLevel,
  StepNavigator,
  StepPriority,
  StepProgress,
  StepRhythm,
  StepWelcome,
  type OnboardingStepId,
} from "@/components/onboarding";
import type { BaseStepProps } from "@/components/onboarding/types";
import { useOnboardingMachine } from "@/hooks/useOnboardingMachine";
import { completeOnboarding } from "@/lib/onboarding";

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
    headingKey: "onboarding.steps.intro.title",
    descriptionKey: "onboarding.steps.intro.subtitle",
    supportingKey: "onboarding.supporting.intro",
  },
  goal: {
    headingKey: "onboarding.steps.goal.title",
    descriptionKey: "onboarding.steps.goal.subtitle",
    supportingKey: "onboarding.supporting.goal",
  },
  score: {
    headingKey: "onboarding.steps.score.title",
    descriptionKey: "onboarding.steps.score.subtitle",
    supportingKey: "onboarding.supporting.score",
  },
  timeline: {
    headingKey: "onboarding.steps.timeline.title",
    descriptionKey: "onboarding.steps.timeline.subtitle",
    supportingKey: "onboarding.supporting.timeline",
  },
  priority: {
    headingKey: "onboarding.steps.priority.title",
    descriptionKey: "onboarding.steps.priority.subtitle",
    supportingKey: "onboarding.supporting.priority",
  },
  finish: {
    headingKey: "onboarding.steps.finish.title",
    descriptionKey: "onboarding.steps.finish.subtitle",
    supportingKey: "onboarding.supporting.finish",
  },
};

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

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const headingId = useId();
  const formId = useId();

  const stepParam = searchParams.get("step");
  const initialStepIndex = useMemo(() => {
    const parsed = stepParam ? Number.parseInt(stepParam, 10) - 1 : 0;
    if (Number.isNaN(parsed)) return 0;
    return Math.max(0, Math.min(parsed, ONBOARDING_STEPS.length - 1));
  }, [stepParam]);

  const hasQueryStep = Boolean(stepParam);

  const { answers, currentStep, currentStepIndex, totalSteps, canNext, stepErrorKey, updateAnswers, clearError, next, back, submit } = useOnboardingMachine({
    initialStepIndex,
    ignoreStoredStep: hasQueryStep,
  });

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
    params.set("step", String(currentStepIndex + 1));
    router.replace(`/${locale}/onboarding?${params.toString()}`, { scroll: false });
  }, [currentStepIndex, locale, router, searchParams, mounted]);

  const StepComponent = getStepComponent(currentStep.id);

  const errorMessage = stepErrorKey ? t(stepErrorKey) : null;

  const progressLabel = t("onboarding.progress.label", { current: currentStepIndex + 1, total: totalSteps });

  const meta = stepMeta[currentStep.id];
  const announcement = t("onboarding.accessibility.stepAnnouncement", {
    current: currentStepIndex + 1,
    total: totalSteps,
    title: t(meta.headingKey),
  });

  const isLastStep = currentStep.id === "finish";

  const primaryLabel = isLastStep ? t("onboarding.navigator.finish") : t("onboarding.navigator.next");
  const heading = t(meta.headingKey);
  const subheading = meta.descriptionKey ? t(meta.descriptionKey) : undefined;
  const supportingText = t(meta.supportingKey);

  const toastVariants = {
    initial: { opacity: 0, y: -8 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.25, ease: "easeOut" } },
    exit: { opacity: 0, y: -8, transition: { duration: 0.2, ease: "easeIn" } },
  };

  const stepVariants = {
    initial: { opacity: prefersReducedMotion ? 1 : 0, x: prefersReducedMotion ? 0 : 32 },
    animate: { opacity: 1, x: 0, transition: { duration: prefersReducedMotion ? 0 : 0.45, ease: "easeInOut" } },
    exit: { opacity: prefersReducedMotion ? 1 : 0, x: prefersReducedMotion ? 0 : -32, transition: { duration: prefersReducedMotion ? 0 : 0.35, ease: "easeInOut" } },
  };

  const handleNext = async (event?: React.FormEvent<HTMLFormElement>) => {
    event?.preventDefault();

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
    back();
  };

  const handleFinish = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    const payload = submit();

    try {
      await completeOnboarding(payload);
      router.push(`/${locale}/dashboard`);
    } catch (error) {
      console.error(error);
      setToastMessage(t("onboarding.errors.submitFailed"));
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
  }, [currentStep.id, mounted]);

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
          <AnimatePresence>{toastMessage ? <motion.div key='toast' variants={toastVariants} initial='initial' animate='animate' exit='exit' className='rounded-[14rem] border border-blue-100 bg-blue-50 px-[16rem] py-[12rem] text-[13.5rem] text-blue-700 shadow-[0_12rem_24rem_-20rem_rgba(37,99,235,0.45)]' role='status'>{toastMessage}</motion.div> : null}</AnimatePresence>
          <StepNavigator
            primaryLabel={primaryLabel}
            primaryType='submit'
            disablePrimary={!canNext && !isLastStep}
            loadingPrimary={isSubmitting}
            onBack={currentStepIndex > 0 ? handleBack : undefined}
            backLabel={t("onboarding.navigator.back")}
            disableBack={currentStepIndex === 0}
            formId={formId}
          />
        </div>
      }
      announcement={announcement}
    >
      <form id={formId} className='flex flex-col gap-[16rem]' onSubmit={handleNext} noValidate aria-labelledby={headingId}>
        <AnimatePresence mode='wait'>
          <motion.div key={currentStep.id} variants={stepVariants} initial='initial' animate='animate' exit='exit'>
            <StepComponent
              answers={answers}
              onUpdate={updateAnswers}
              t={t}
              error={errorMessage}
              clearError={clearError}
            />
          </motion.div>
        </AnimatePresence>
      </form>
    </OnboardingLayout>
  );
}

function getStepComponent(stepId: OnboardingStepId) {
  return stepComponents[stepId] ?? StepWelcome;
}
