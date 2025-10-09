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
}
