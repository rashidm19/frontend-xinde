export type OnboardingStepId = 'intro' | 'goal' | 'score' | 'timeline' | 'priority' | 'finish';

export interface OnboardingAnswers {
  introReasons: IntroReasonId[];
  goal?: OnboardingGoalId;
  goalOther?: string;
  targetScore?: OnboardingTargetScoreId;
  timeline?: OnboardingTimelineId;
  prioritySections: PrioritySectionId[];
}

export type IntroReasonId =
  | 'ielts-academic'
  | 'ielts-general'
  | 'improve-english'
  | 'explore-platform';

export type OnboardingGoalId = 'university' | 'work-migration' | 'self-development' | 'other';

export type OnboardingTargetScoreId = '5.5' | '6.0' | '6.5' | '7.0' | '7.5' | '8.0+';

export type OnboardingTimelineId = '1-month' | '2-3-months' | '4-6-months' | 'not-sure';

export type PrioritySectionId = 'writing' | 'speaking' | 'reading' | 'listening' | 'not-sure';

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
}
