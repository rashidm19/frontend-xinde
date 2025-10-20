import type { PracticeWritingAttempt } from '@/types/PracticeWriting';

import axiosInstance from '@/lib/axiosInstance';

export const POST_practice_writing_id = async (id: string, answer: string): Promise<PracticeWritingAttempt> => {
  const response = await axiosInstance.post<PracticeWritingAttempt>(`/practice/writing/${id}`, { answer });

  return response.data;
};
