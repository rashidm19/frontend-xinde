import type { ListeningOut } from '@/types/PracticeListening';

import axiosInstance from '@/lib/axiosInstance';

export const GET_practice_listening_id = async (id: string): Promise<ListeningOut> => {
  const response = await axiosInstance.get<ListeningOut>(`/practice/listening/${id}`);

  return response.data;
};
