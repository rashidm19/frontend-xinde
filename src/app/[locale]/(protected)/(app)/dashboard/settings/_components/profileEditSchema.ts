import { z } from 'zod';

import { PASSWORD_MIN_LENGTH } from '@/api/profile';
import { regionSchema } from '@/types/types';

const passwordFieldSchema = z.union([
  z
    .string()
    .min(PASSWORD_MIN_LENGTH, {
      message: `Password must be at least ${PASSWORD_MIN_LENGTH} characters long.`,
    }),
  z.literal(''),
]);

export const profileEditFormSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, { message: 'Name must be at least 2 characters.' })
      .max(120, { message: 'Name must be at most 120 characters.' }),
    email: z.string().email({ message: 'Email must be a valid email address.' }),
    region: regionSchema,
    oldPassword: passwordFieldSchema,
    newPassword: passwordFieldSchema,
  })
  .superRefine((values, ctx) => {
    const hasOld = values.oldPassword.length > 0;
    const hasNew = values.newPassword.length > 0;

    if (hasOld !== hasNew) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: hasOld ? ['newPassword'] : ['oldPassword'],
        message: 'Both current and new passwords are required.',
      });
      return;
    }

    if (hasOld && values.oldPassword === values.newPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['newPassword'],
        message: 'New password must be different from the current password.',
      });
    }
  });

export type ProfileEditFormValues = z.infer<typeof profileEditFormSchema>;
