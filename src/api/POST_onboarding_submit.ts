'use client';

import axiosInstance from '@/lib/axiosInstance';
import {
  onboardingSubmitRequestSchema,
  onboardingSubmitResponseSchema,
  type OnboardingSubmitRequest,
  type OnboardingSubmitResponse,
} from '@/types/OnboardingSchema';

export class OnboardingSubmitError extends Error {
  readonly status: number;
  readonly code?: string;
  readonly currentSchemaVersion?: number;

  constructor(status: number, code?: string, message?: string, currentSchemaVersion?: number) {
    super(message ?? `Failed to submit onboarding (status ${status})`);
    this.status = status;
    this.code = code;
    this.currentSchemaVersion = currentSchemaVersion;
  }
}

export const postOnboardingSubmit = async (input: OnboardingSubmitRequest, idempotencyKey: string): Promise<OnboardingSubmitResponse> => {
  const payload = onboardingSubmitRequestSchema.parse(input);

  const response = await axiosInstance.post('/onboarding/submit', payload, {
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
      'Idempotency-Key': idempotencyKey,
    },
    validateStatus: () => true,
  });

  if (response.status === 200) {
    return onboardingSubmitResponseSchema.parse(response.data);
  }

  let code: string | undefined;
  let message: string | undefined;
  let currentSchemaVersion: number | undefined;

  if (response.data && typeof response.data === 'object') {
    const data = response.data as { message?: unknown; code?: unknown; current_schema_version?: unknown };

    if (typeof data.message === 'string') {
      message = data.message;
      code = data.message;
    }

    if (typeof data.code === 'string') {
      code = data.code;
    }

    if (typeof data.current_schema_version === 'number') {
      currentSchemaVersion = data.current_schema_version;
    }
  }

  throw new OnboardingSubmitError(response.status, code, message, currentSchemaVersion);
};
