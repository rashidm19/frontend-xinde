'use client';

import { z } from 'zod';

import axiosInstance from '@/lib/axiosInstance';

const requestSchema = z.object({
  name: z.string().min(1),
  email: z.string().min(1).email(),
  password: z.string().min(8),
  region: z.string().min(1),
  avatar: z.instanceof(Blob).optional(),
});

const responseSchema = z.object({
  message: z.string().min(1),
});

const errorSchema = z.object({
  code: z.string().optional(),
  message: z.string().optional(),
});

export type AuthRegisterRequest = z.infer<typeof requestSchema>;
export type AuthRegisterResponse = z.infer<typeof responseSchema>;

export class AuthRegisterError extends Error {
  readonly status: number;
  readonly code?: string;

  constructor(status: number, code?: string, message?: string) {
    super(message ?? `Registration failed with status ${status}`);
    this.status = status;
    this.code = code;
  }
}

export const postAuthRegister = async (input: AuthRegisterRequest): Promise<AuthRegisterResponse> => {
  const payload = requestSchema.parse(input);

  const body = new FormData();
  body.append('name', payload.name);
  body.append('email', payload.email);
  body.append('password', payload.password);
  body.append('region', payload.region);

  if (payload.avatar) {
    body.append('avatar', payload.avatar);
  }

  const response = await axiosInstance.post('/auth/register', body, {
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

  throw new AuthRegisterError(response.status, code, message);
};
