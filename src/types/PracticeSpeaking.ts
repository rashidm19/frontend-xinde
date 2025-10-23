export const SPEAKING_PART_VALUES = ['1', '2', '3', 'all', '2-3'] as const;

export type PracticeSpeakingPartValue = (typeof SPEAKING_PART_VALUES)[number];

export const isPracticeSpeakingPartValue = (value: unknown): value is PracticeSpeakingPartValue =>
  typeof value === 'string' && (SPEAKING_PART_VALUES as readonly string[]).includes(value);

export interface PracticeSpeakingSummary {
  speaking_id: number;
  title: string;
  last_score: number | null;
  best_score: number | null;
  questions_count: number;
  attempts: number;
  part?: PracticeSpeakingPartValue;
}

export interface PracticeSpeakingListResponse {
  data: PracticeSpeakingSummary[];
}

export interface PracticeSpeakingCategoryTag {
  id: number;
  name: string;
}

export interface PracticeSpeakingCategory {
  id: number;
  name: string;
  tags: PracticeSpeakingCategoryTag[];
}

export interface PracticeSpeakingCategoriesResponse {
  data: PracticeSpeakingCategory[];
}

export interface PracticeSpeakingQuestion {
  number: number;
  kind: string;
  question: string;
  question_url: string | null;
  intro?: string | null;
  intro_url?: string | null;
}

export interface PracticeSpeakingPartResponse {
  questions: PracticeSpeakingQuestion[];
  part?: PracticeSpeakingPartValue;
}

export interface PracticeSpeakingAttempt {
  id: number;
  part?: PracticeSpeakingPartValue;
}

export interface PracticeSpeakingAnswer {
  question: number;
  audio: string;
}
