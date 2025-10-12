import type { PracticeWritingDetails } from '@/types/PracticeWriting';

import axiosInstance from '@/lib/axiosInstance';

export const GET_practice_writing_id = async (id: string): Promise<PracticeWritingDetails> => {
  const response = await axiosInstance.get<PracticeWritingDetails>(`/practice/writing/${id}`);

  return response.data;
};
