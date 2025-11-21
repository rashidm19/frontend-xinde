export type ListeningQuestionStatus = 'correct' | 'incorrect' | 'unanswered';
export type ListeningFilterKey = 'all' | 'correct' | 'incorrect' | 'unanswered';

export interface NormalizedListeningQuestion {
  number: number;
  status: ListeningQuestionStatus;
  answer: string | null;
  correctAnswer: string | null;
  sectionLabel?: string | null;
  timestampSeconds?: number | null;
  /** Optional contextual helper for future enhancements. */
  detailHint?: string | null;
}
