export interface PracticeReadingResultQuestion {
  answer: string | null;
  correct_answer: string;
  correct: boolean;
}

export interface PracticeReadingResult {
  id: number;
  reading_id: number;
  score: number;
  questions: PracticeReadingResultQuestion[];
  correct_answers_count: number;
  title: string | null;
  completed_at: string | null;
}

export type PracticeReadingFullFeedback = PracticeReadingResult;

export interface PracticeReadingBlock {
  kind: string;
  [key: string]: unknown;
}

export interface PracticeReadingPart {
  questions_count: number;
  text?: string;
  blocks: PracticeReadingBlock[];
}

export interface PracticeReadingContent {
  rules: string;
  part_1: PracticeReadingPart;
  part_2: PracticeReadingPart;
  part_3: PracticeReadingPart;
}
