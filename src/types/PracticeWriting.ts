export interface PracticeWritingSummary {
  writing_id: number;
  title: string;
  last_score: number | null;
  best_score: number | null;
  questions_count: number;
  attempts: number;
}

export interface PracticeWritingListResponse {
  data: PracticeWritingSummary[];
}

export interface PracticeWritingDetails {
  task: string;
  text: string;
  theme: string | null;
  question: string;
  picture: string | null;
}

export interface PracticeWritingAttempt {
  id: number;
  writing_id: number;
  feedback_ready: boolean;
}
