import type { ISpeakingPracticeFeedback } from '@/types/SpeakingFeedback';

import axiosInstance from '@/lib/axiosInstance';

export const GET_practice_speaking_feedback_id = async (id: string): Promise<ISpeakingPracticeFeedback> => {
  const response = await axiosInstance.get<ISpeakingPracticeFeedback>(`/practice/speaking/passed/${id}`);

  return response.data;
};
