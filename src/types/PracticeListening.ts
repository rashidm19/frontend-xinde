export interface PracticeListeningResultQuestion {
  answer: string | null;
  correct_answer: string;
  correct: boolean;
}

export interface PracticeListeningResult {
  id: number;
  listening_id: number;
  score: number;
  questions: PracticeListeningResultQuestion[];
  correct_answers_count: number;
}
