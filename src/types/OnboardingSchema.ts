import { z } from 'zod';

export const onboardingOptionSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  order: z.number().int(),
  allows_custom_answer: z.boolean().optional().default(false),
});

export const onboardingQuestionSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().nullable().optional(),
  type: z.enum(['radio', 'tab', 'checkbox']),
  order: z.number().int(),
  options: z.array(onboardingOptionSchema),
});

export const onboardingSchemaResponseSchema = z.object({
  version: z.number().int(),
  completed_at: z.string().nullable().optional(),
  questions: z.array(onboardingQuestionSchema),
});

export type OnboardingSchemaOption = z.infer<typeof onboardingOptionSchema>;
export type OnboardingSchemaQuestion = z.infer<typeof onboardingQuestionSchema>;
export type OnboardingSchemaResponse = z.infer<typeof onboardingSchemaResponseSchema>;

export const onboardingSubmitOptionSchema = z.object({
  id: z.string().min(1),
  custom_text: z.string().max(2048).nullable().optional(),
});

export const onboardingSubmitAnswerSchema = z.object({
  question_id: z.string().min(1),
  options: z.array(onboardingSubmitOptionSchema).min(1),
});

export const onboardingSubmitRequestSchema = z.object({
  schema_version: z.number().int(),
  answers: z.array(onboardingSubmitAnswerSchema),
});

export const onboardingSubmitResponseSchema = z.object({
  status: z.enum(['submitted', 'duplicate']),
  schema_version: z.number().int(),
  submitted_at: z.string().min(1),
  completed_at: z.string().min(1),
});

export type OnboardingSubmitOption = z.infer<typeof onboardingSubmitOptionSchema>;
export type OnboardingSubmitAnswer = z.infer<typeof onboardingSubmitAnswerSchema>;
export type OnboardingSubmitRequest = z.infer<typeof onboardingSubmitRequestSchema>;
export type OnboardingSubmitResponse = z.infer<typeof onboardingSubmitResponseSchema>;
