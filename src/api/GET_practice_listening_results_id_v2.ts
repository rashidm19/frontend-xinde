import { PracticeListeningResultV2 } from '@/types/PracticeListeningResultV2';

import axiosInstance from '@/lib/axiosInstance';

export const GET_practice_listening_results_id_v2 = async (id: string): Promise<PracticeListeningResultV2> => {
  const response = await axiosInstance.get<PracticeListeningResultV2>(`/practice/listening/passed/${id}/v2`);

  return response.data;
};
