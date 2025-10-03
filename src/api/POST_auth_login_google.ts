'use client';

import { z } from 'zod';

import axiosInstance from '@/lib/axiosInstance';

const requestSchema = z.object({
  token: z.string().min(1, 'Google ID token is required.'),
});

const responseSchema = z.object({
  token: z.string().min(1),
});

const errorSchema = z.object({
  code: z.string().optional(),
  message: z.string().optional(),
});

export type GoogleLoginRequest = z.infer<typeof requestSchema>;
export type GoogleLoginResponse = z.infer<typeof responseSchema>;

export class GoogleLoginError extends Error {
  readonly status: number;
  readonly code?: string;

  constructor(status: number, code?: string, message?: string) {
    super(message ?? `Google login failed with status ${status}`);
    this.status = status;
    this.code = code;
  }
}

export const postAuthLoginGoogle = async (input: GoogleLoginRequest): Promise<GoogleLoginResponse> => {
  const payload = requestSchema.parse(input);

  const response = await axiosInstance.post('/auth/login/google', payload, {
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

  throw new GoogleLoginError(response.status, code, message);
};
