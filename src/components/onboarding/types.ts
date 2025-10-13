import type { OnboardingSchemaQuestion } from '@/types/OnboardingSchema';

export type OnboardingStepId = 'intro' | 'goal' | 'score' | 'timeline' | 'priority' | 'finish';

export interface OnboardingAnswers {
  introReasons: IntroReasonId[];
  goal?: OnboardingGoalId;
  goalOther?: string;
  targetScore?: OnboardingTargetScoreId;
  timeline?: OnboardingTimelineId;
  prioritySections: PrioritySectionId[];
}

export type IntroReasonId = string;
export type OnboardingGoalId = string;
export type OnboardingTargetScoreId = string;
export type OnboardingTimelineId = string;
export type PrioritySectionId = string;

export interface OnboardingStepDefinition {
  id: OnboardingStepId;
  validationKey?: string;
  isSkippable?: boolean;
  validate?: (answers: OnboardingAnswers) => boolean;
}

export interface BaseStepProps {
  answers: OnboardingAnswers;
  onUpdate: (patch: Partial<OnboardingAnswers>) => void;
  t: (key: string, values?: Record<string, string | number>) => string;
  error?: string | null;
  clearError: () => void;
  question?: OnboardingSchemaQuestion;
  questions?: OnboardingSchemaQuestion[];
  stepQuestions?: Map<OnboardingStepId, OnboardingSchemaQuestion>;
}
