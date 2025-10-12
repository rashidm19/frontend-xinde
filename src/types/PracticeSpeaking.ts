export interface PracticeSpeakingSummary {
  speaking_id: number;
  title: string;
  last_score: number | null;
  best_score: number | null;
  questions_count: number;
  attempts: number;
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
}

export interface PracticeSpeakingAttempt {
  id: number;
}

export interface PracticeSpeakingAnswer {
  question: number;
  audio: string;
}
