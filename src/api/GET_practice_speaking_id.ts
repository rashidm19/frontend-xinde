import type { PracticeSpeakingPartResponse } from '@/types/PracticeSpeaking';
import { isPracticeSpeakingPartValue } from '@/types/PracticeSpeaking';

import axiosInstance from '@/lib/axiosInstance';

export const GET_practice_speaking_id = async (): Promise<PracticeSpeakingPartResponse> => {
  const id = localStorage.getItem('practiceSpeakingId');
  const part = localStorage.getItem('practiceSpeakingPart');

  const response = await axiosInstance.get<PracticeSpeakingPartResponse>(`/practice/speaking/${id}`, {
    params: part ? { part } : undefined,
  });

  if (isPracticeSpeakingPartValue(response.data?.part)) {
    localStorage.setItem('practiceSpeakingPart', response.data.part);
  }

  return response.data;
};
