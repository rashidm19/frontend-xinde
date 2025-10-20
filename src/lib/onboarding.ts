import { postOnboardingSubmit } from '@/api/POST_onboarding_submit';
import type { OnboardingSubmitAnswer, OnboardingSubmitResponse } from '@/types/OnboardingSchema';

export interface CompleteOnboardingParams {
  schemaVersion: number;
  answers: OnboardingSubmitAnswer[];
  idempotencyKey: string;
}

export const completeOnboarding = async ({ schemaVersion, answers, idempotencyKey }: CompleteOnboardingParams): Promise<OnboardingSubmitResponse> => {
  return postOnboardingSubmit(
    {
      schema_version: schemaVersion,
      answers,
    },
    idempotencyKey
  );
};
