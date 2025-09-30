import { z } from 'zod';

import axiosInstance from '@/lib/axiosInstance';
import { regionSchema, userSchema, User } from '@/types/types';

export const PASSWORD_MIN_LENGTH = 8;

const passwordSchema = z.string().min(PASSWORD_MIN_LENGTH);

export const profileUpdateRequestSchema = z
  .object({
    grade: z.union([z.number(), z.string()]).optional(),
    name: z
      .string()
      .trim()
      .min(2, { message: 'Name must be at least 2 characters.' })
      .max(120, { message: 'Name must be at most 120 characters.' })
      .optional(),
    region: regionSchema.optional(),
    oldPassword: passwordSchema.optional(),
    newPassword: passwordSchema.optional(),
  })
  .superRefine((values, ctx) => {
    const hasOld = !!values.oldPassword;
    const hasNew = !!values.newPassword;

    if (hasOld !== hasNew) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: hasOld ? ['newPassword'] : ['oldPassword'],
        message: 'Both current and new passwords are required.',
      });
    }
  });

export type ProfileUpdateRequest = z.infer<typeof profileUpdateRequestSchema>;

export const profileUpdatePayloadSchema = z.object({
  grade: z.string().optional(),
  name: z
    .string()
    .trim()
    .min(2, { message: 'Name must be at least 2 characters.' })
    .max(120, { message: 'Name must be at most 120 characters.' })
    .optional(),
  region: regionSchema.optional(),
  old_password: passwordSchema.optional(),
  new_password: passwordSchema.optional(),
});

export type ProfileUpdatePayload = z.infer<typeof profileUpdatePayloadSchema>;

export const profileUpdateResponseSchema = userSchema;

export type ProfileUpdateResponse = z.infer<typeof profileUpdateResponseSchema>;

export const profileResponseSchema = userSchema;

export type ProfileResponse = z.infer<typeof profileResponseSchema>;

export const PROFILE_ENDPOINT = '/auth/profile';

export const fetchProfile = async (): Promise<User> => {
  const response = await axiosInstance.get(PROFILE_ENDPOINT);
  return profileResponseSchema.parse(response.data);
};
