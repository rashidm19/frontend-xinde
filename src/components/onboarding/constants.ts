import type {
  IntroReasonId,
  OnboardingGoalId,
  OnboardingStepDefinition,
  OnboardingTargetScoreId,
  OnboardingTimelineId,
  PrioritySectionId,
} from './types';

export const ONBOARDING_STORAGE_KEY = 'studybox:onboarding-state';

export const ONBOARDING_STEPS: OnboardingStepDefinition[] = [
  {
    id: 'intro',
    validationKey: 'onboarding.errors.introRequired',
    validate: answers => answers.introReasons.length > 0,
  },
  {
    id: 'goal',
    validationKey: 'onboarding.errors.goalRequired',
    validate: answers => {
      if (!answers.goal) return false;
      if (answers.goal === 'other') {
        return Boolean(answers.goalOther && answers.goalOther.trim().length > 0);
      }
      return true;
    },
  },
  {
    id: 'score',
    validationKey: 'onboarding.errors.scoreRequired',
    validate: answers => Boolean(answers.targetScore),
  },
  {
    id: 'timeline',
    validationKey: 'onboarding.errors.timelineRequired',
    validate: answers => Boolean(answers.timeline),
  },
  {
    id: 'priority',
    validationKey: 'onboarding.errors.priorityRequired',
    validate: answers => answers.prioritySections.length > 0,
  },
  {
    id: 'finish',
  },
];

export interface OnboardingOption<T extends string = string> {
  id: T;
  labelKey: string;
  descriptionKey?: string;
  icon?: string;
}

export const INTRO_OPTIONS: OnboardingOption<IntroReasonId>[] = [
  {
    id: 'ielts-academic',
    labelKey: 'onboarding.steps.intro.options.academic',
  },
  {
    id: 'ielts-general',
    labelKey: 'onboarding.steps.intro.options.general',
  },
  {
    id: 'improve-english',
    labelKey: 'onboarding.steps.intro.options.improveEnglish',
  },
  {
    id: 'explore-platform',
    labelKey: 'onboarding.steps.intro.options.explore',
  },
];

export const GOAL_OPTIONS: Array<OnboardingOption<OnboardingGoalId> & { requiresInput?: boolean }> = [
  {
    id: 'university',
    labelKey: 'onboarding.steps.goal.options.university',
  },
  {
    id: 'work-migration',
    labelKey: 'onboarding.steps.goal.options.work',
  },
  {
    id: 'self-development',
    labelKey: 'onboarding.steps.goal.options.self',
  },
  {
    id: 'other',
    labelKey: 'onboarding.steps.goal.options.other',
    requiresInput: true,
  },
];

export const TARGET_SCORE_OPTIONS: OnboardingOption<OnboardingTargetScoreId>[] = [
  { id: '5.5', labelKey: 'onboarding.steps.score.options.fiveFive' },
  { id: '6.0', labelKey: 'onboarding.steps.score.options.six' },
  { id: '6.5', labelKey: 'onboarding.steps.score.options.sixFive' },
  { id: '7.0', labelKey: 'onboarding.steps.score.options.seven' },
  { id: '7.5', labelKey: 'onboarding.steps.score.options.sevenFive' },
  { id: '8.0+', labelKey: 'onboarding.steps.score.options.eightPlus' },
];

export const TIMELINE_OPTIONS: OnboardingOption<OnboardingTimelineId>[] = [
  {
    id: '1-month',
    labelKey: 'onboarding.steps.timeline.options.soon',
  },
  {
    id: '2-3-months',
    labelKey: 'onboarding.steps.timeline.options.mid',
  },
  {
    id: '4-6-months',
    labelKey: 'onboarding.steps.timeline.options.later',
  },
  {
    id: 'not-sure',
    labelKey: 'onboarding.steps.timeline.options.unknown',
  },
];

export const PRIORITY_OPTIONS: Array<OnboardingOption<PrioritySectionId>> = [
  {
    id: 'writing',
    labelKey: 'onboarding.steps.priority.options.writing',
    icon: '✍️',
  },
  {
    id: 'speaking',
    labelKey: 'onboarding.steps.priority.options.speaking',
    icon: '🎤',
  },
  {
    id: 'reading',
    labelKey: 'onboarding.steps.priority.options.reading',
    icon: '📖',
  },
  {
    id: 'listening',
    labelKey: 'onboarding.steps.priority.options.listening',
    icon: '🎧',
  },
  {
    id: 'not-sure',
    labelKey: 'onboarding.steps.priority.options.unknown',
    icon: '❓',
  },
];
