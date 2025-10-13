import type { OnboardingStepDefinition } from './types';

export const ONBOARDING_STORAGE_KEY = 'studybox:onboarding-state';

export const DEFAULT_ONBOARDING_STEPS: OnboardingStepDefinition[] = [
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
