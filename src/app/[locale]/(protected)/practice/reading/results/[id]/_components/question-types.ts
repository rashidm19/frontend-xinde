export type ReadingQuestionStatus = 'correct' | 'incorrect' | 'unanswered';
export type ReadingFilterKey = 'all' | 'correct' | 'incorrect' | 'unanswered';

export interface NormalizedReadingQuestion {
  number: number;
  status: ReadingQuestionStatus;
  answer: string | null;
  correctAnswer: string | null;
  /** Optional contextual helper for future enhancements. */
  detailHint?: string | null;
}
