import axiosInstance from '@/lib/axiosInstance';

export type FeedbackHighlightKey = string;

export interface FeedbackStatusResponse {
  hasSubmitted: boolean;
  submittedAt?: string | null;
  rating?: number | null;
  highlights?: FeedbackHighlightKey[];
  comment?: string | null;
  otherHighlight?: string | null;
}

export interface SubmitFeedbackPayload {
  rating: number;
  highlights: FeedbackHighlightKey[];
  otherHighlight?: string | null;
  comment?: string | null;
}

interface SubmitFeedbackResponse {
  status: 'stored';
  submittedAt?: string;
}

export async function GET_feedback_status() {
  const { data } = await axiosInstance.get<FeedbackStatusResponse>('/review/status');
  return data;
}

export async function POST_feedback(payload: SubmitFeedbackPayload) {
  const { data } = await axiosInstance.post<SubmitFeedbackResponse>('/review', payload);
  return data;
}

export async function DELETE_feedback() {
  await axiosInstance.delete('/review');
}
