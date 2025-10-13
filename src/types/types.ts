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

export const userSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  name: z.string().optional(),
  avatar: z.string().nullable().optional(),
  region: regionSchema.optional(),
  target_grade: z.string().nullable().optional(),
  onboarding_completed: z.boolean().optional().transform(value => value ?? false),
});

export type User = z.infer<typeof userSchema>;
