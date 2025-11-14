import { z } from 'zod';

export const PROFILE_REGIONS = ['kz', 'kg', 'md'] as const;

export type KnownRegionCode = (typeof PROFILE_REGIONS)[number];

export const regionSchema = z.preprocess(
  value => (typeof value === 'string' ? value.trim().toLowerCase() : value),
  z
    .string()
    .min(2, { message: 'Region is required.' })
    .max(10, { message: 'Region code is too long.' })
);

export type Region = z.infer<typeof regionSchema>;

export const userSchema = z
  .object({
    id: z.number(),
    email: z.string().email(),
    name: z.string(),
    avatar: z.string().nullable().optional(),
    region: regionSchema.optional(),
    interest_skipped: z.boolean().optional().transform(value => value ?? false),
    target_grade: z.string().nullable().optional(),
    onboarding_completed: z.boolean().transform(value => value ?? false),
    statistics: z.unknown().nullable().optional(),
    balance: z.number(),
    mock_balance: z.number(),
    practice_balance: z.number(),
    got_free_welcome_test: z.boolean().optional(),
  })
  .transform(data => ({
    ...data,
    gotFreeWelcomeTest: data.got_free_welcome_test ?? false,
  }));

export type User = z.infer<typeof userSchema>;
