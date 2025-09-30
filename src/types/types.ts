import { z } from 'zod';

export const PROFILE_REGIONS = ['kz', 'kg', 'md'] as const;

export const regionSchema = z.enum(PROFILE_REGIONS);

export type Region = z.infer<typeof regionSchema>;

export const userSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  name: z.string().nullish(),
  avatar: z.string().nullish(),
  region: regionSchema.nullish(),
  target_grade: z.number().nullish(),
});

export type User = z.infer<typeof userSchema>;
