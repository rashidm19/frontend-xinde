import type { PracticeReadingResultV2 } from '@/types/PracticeReadingResultV2';

import axiosInstance from '@/lib/axiosInstance';

export const GET_practice_reading_results_id_v2 = async (id: string): Promise<PracticeReadingResultV2> => {
  const response = await axiosInstance.get<PracticeReadingResultV2>(`/practice/reading/passed/${id}/v2`);

  return response.data;
};
