import type { OnboardingAnswers } from '@/components/onboarding';

export interface CompleteOnboardingResult {
  success: boolean;
}

export async function completeOnboarding(_: OnboardingAnswers): Promise<CompleteOnboardingResult> {
  await new Promise(resolve => setTimeout(resolve, 400));

  return { success: true };
}
