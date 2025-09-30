import { z } from 'zod';

export const PROFILE_REGIONS = ['kz', 'kg', 'md'] as const;

export const regionSchema = z.enum(PROFILE_REGIONS);

export type Region = z.infer<typeof regionSchema>;

export const userSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  name: z.string().optional(),
  avatar: z.string().optional(),
  region: regionSchema.optional(),
  target_grade: z.string().optional(),
});

export type User = z.infer<typeof userSchema>;
