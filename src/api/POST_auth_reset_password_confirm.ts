'use client';

import { z } from 'zod';

import axiosInstance from '@/lib/axiosInstance';

const requestSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8),
});

const responseSchema = z.object({
  message: z.string().min(1),
});

const errorSchema = z.object({
  code: z.string().optional(),
  message: z.string().optional(),
});

export type AuthResetPasswordConfirmRequest = z.infer<typeof requestSchema>;
export type AuthResetPasswordConfirmResponse = z.infer<typeof responseSchema>;

export class AuthResetPasswordConfirmError extends Error {
  readonly status: number;
  readonly code?: string;

  constructor(status: number, code?: string, message?: string) {
    super(message ?? `Password reset confirmation failed with status ${status}`);
    this.status = status;
    this.code = code;
  }
}

export const postAuthResetPasswordConfirm = async (
  input: AuthResetPasswordConfirmRequest
): Promise<AuthResetPasswordConfirmResponse> => {
  const payload = requestSchema.parse(input);

  const response = await axiosInstance.post('/auth/reset-password/confirm', payload, {
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
    },
    validateStatus: () => true,
  });

  if (response.status >= 200 && response.status < 300) {
    return responseSchema.parse(response.data);
  }

  let code: string | undefined;
  let message: string | undefined;

  try {
    const parsed = errorSchema.parse(response.data);
    code = parsed.code;
    message = parsed.message;
  } catch (error) {
    if (typeof response.data === 'string') {
      message = response.data;
    }
  }

  throw new AuthResetPasswordConfirmError(response.status, code, message);
};
