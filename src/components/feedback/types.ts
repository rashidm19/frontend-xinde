export interface FeedbackModalSubmitPayload {
  rating: number | null;
  highlights: string[];
  otherText: string;
  comment: string;
}

export type FeedbackModalSubmitResult = { ok: true } | { ok: false; error: string };
