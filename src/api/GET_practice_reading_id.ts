import type { PracticeReadingContent } from '@/types/PracticeReading';

import axiosInstance from '@/lib/axiosInstance';

export const GET_practice_reading_id = async (id: string): Promise<PracticeReadingContent> => {
  const response = await axiosInstance.get<PracticeReadingContent>(`/practice/reading/${id}`);

  return response.data;
};
