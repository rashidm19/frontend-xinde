import type { PracticeSpeakingAttempt } from '@/types/PracticeSpeaking';
import { isPracticeSpeakingPartValue } from '@/types/PracticeSpeaking';

import axiosInstance from '@/lib/axiosInstance';

export const POST_practice_speaking_id_start = async (): Promise<PracticeSpeakingAttempt> => {
  const id = localStorage.getItem('practiceSpeakingId');
  const part = localStorage.getItem('practiceSpeakingPart');

  const response = await axiosInstance.post<PracticeSpeakingAttempt>(
    `/practice/speaking/${id}`,
    undefined,
    {
      params: part ? { part } : undefined,
    }
  );

  if (isPracticeSpeakingPartValue(response.data?.part)) {
    localStorage.setItem('practiceSpeakingPart', response.data.part);
  }

  return response.data;
};
