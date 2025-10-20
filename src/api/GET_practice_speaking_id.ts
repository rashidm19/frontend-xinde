import type { PracticeSpeakingPartResponse } from '@/types/PracticeSpeaking';

import axiosInstance from '@/lib/axiosInstance';

export const GET_practice_speaking_id = async (): Promise<PracticeSpeakingPartResponse> => {
  const id = localStorage.getItem('practiceSpeakingId') as string;
  const part = localStorage.getItem('practiceSpeakingPart') as string;

  const response = await axiosInstance.get<PracticeSpeakingPartResponse>(`/practice/speaking/${id}`, {
    params: { part },
  });

  return response.data;
};
