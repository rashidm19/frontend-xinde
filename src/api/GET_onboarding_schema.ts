'use client';

import axiosInstance from '@/lib/axiosInstance';
import { onboardingSchemaResponseSchema, type OnboardingSchemaResponse } from '@/types/OnboardingSchema';

export class OnboardingSchemaError extends Error {
  readonly status: number;

  constructor(status: number, message?: string) {
    super(message ?? `Failed to load onboarding schema (status ${status})`);
    this.status = status;
  }
}

export const getOnboardingSchema = async (): Promise<OnboardingSchemaResponse> => {
  const response = await axiosInstance.get('/onboarding/schema', {
    validateStatus: () => true,
  });

  if (response.status === 200) {
    return onboardingSchemaResponseSchema.parse(response.data);
  }

  let message: string | undefined;
  if (response.data && typeof response.data === 'object' && 'message' in response.data) {
    const raw = (response.data as { message?: unknown }).message;
    if (typeof raw === 'string') {
      message = raw;
    }
  }

  throw new OnboardingSchemaError(response.status, message);
};
