import type { PracticeListeningResult } from '@/types/PracticeListening';

import axiosInstance from '@/lib/axiosInstance';

export const GET_practice_listening_results_id = async (id: string): Promise<PracticeListeningResult> => {
  const response = await axiosInstance.get<PracticeListeningResult>(`/practice/listening/passed/${id}`);

  return response.data;
};
