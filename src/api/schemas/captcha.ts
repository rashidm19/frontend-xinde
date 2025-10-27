import { z } from 'zod';

export const captchaProviderSchema = z.enum(['google', 'hcaptcha']);

export const captchaModeSchema = z.enum(['invisible', 'challenge']);

export const captchaMetadataSchema = z.object({
  captchaToken: z.string().min(1),
  captchaProvider: captchaProviderSchema,
  captchaMode: captchaModeSchema,
});

export type CaptchaMetadata = z.infer<typeof captchaMetadataSchema>;
