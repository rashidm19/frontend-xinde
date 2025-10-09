'use client';

import { z } from 'zod';

import axiosInstance from '@/lib/axiosInstance';

const requestSchema = z.object({
  email: z.string().min(1).email(),
});

const responseSchema = z.object({
  message: z.string().min(1),
});

const errorSchema = z.object({
  code: z.string().optional(),
  message: z.string().optional(),
});

export type AuthResetPasswordRequest = z.infer<typeof requestSchema>;
export type AuthResetPasswordResponse = z.infer<typeof responseSchema>;

export class AuthResetPasswordError extends Error {
  readonly status: number;
  readonly code?: string;

  constructor(status: number, code?: string, message?: string) {
    super(message ?? `Password reset request failed with status ${status}`);
    this.status = status;
    this.code = code;
  }
}

export const postAuthResetPassword = async (input: AuthResetPasswordRequest): Promise<AuthResetPasswordResponse> => {
  const payload = requestSchema.parse(input);

  const response = await axiosInstance.post('/auth/reset-password', payload, {
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

  throw new AuthResetPasswordError(response.status, code, message);
};
