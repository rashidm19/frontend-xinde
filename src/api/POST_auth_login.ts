'use client';

import { z } from 'zod';

import { captchaMetadataSchema } from '@/api/schemas/captcha';
import axiosInstance from '@/lib/axiosInstance';

const requestSchema = z
  .object({
  email: z.string().min(1),
  password: z.string().min(1),
  })
  .merge(captchaMetadataSchema.partial());

const responseSchema = z.object({
  token: z.string().min(1),
});

const errorSchema = z.object({
  code: z.string().optional(),
  message: z.string().optional(),
});

export type AuthLoginRequest = z.infer<typeof requestSchema>;
export type AuthLoginResponse = z.infer<typeof responseSchema>;

export class AuthLoginError extends Error {
  readonly status: number;
  readonly code?: string;

  constructor(status: number, code?: string, message?: string) {
    super(message ?? `Auth login failed with status ${status}`);
    this.status = status;
    this.code = code;
  }
}

export const postAuthLogin = async (input: AuthLoginRequest): Promise<AuthLoginResponse> => {
  const payload = requestSchema.parse(input);

  const response = await axiosInstance.post('/auth/login', payload, {
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

  throw new AuthLoginError(response.status, code, message);
};
