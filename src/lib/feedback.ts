import type { FeedbackHighlightKey } from '@/api/feedback';

export const FEEDBACK_HIGHLIGHT_LABELS: Record<string, string> = {
  'Reading or Listening': 'Reading or Listening',
  Writing: 'Writing',
  Speaking: 'Speaking',
  'AI feedback': 'AI feedback',
  Design: 'Design',
  other: 'other',
};

export function feedbackLabel(key: FeedbackHighlightKey) {
  return FEEDBACK_HIGHLIGHT_LABELS[key];
}
