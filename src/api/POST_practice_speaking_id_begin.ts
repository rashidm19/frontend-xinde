import type { PracticeSpeakingAttempt } from '@/types/PracticeSpeaking';
import { isPracticeSpeakingPartValue } from '@/types/PracticeSpeaking';

import axiosInstance from '@/lib/axiosInstance';

export const POST_practice_speaking_id_begin = async (): Promise<PracticeSpeakingAttempt> => {
  const id = localStorage.getItem('practiceSpeakingId');
  const part = localStorage.getItem('practiceSpeakingPart');

  const response = await axiosInstance.post<PracticeSpeakingAttempt>(
    `/practice/speaking/${id}`,
    undefined,
    {
      params: part ? { part } : undefined,
    }
  );

  const { id: attemptId, part: attemptPart } = response.data ?? {};

  if (attemptId != null) {
    localStorage.setItem('practiceSpeakingIdStarted', String(attemptId));
  }

  if (isPracticeSpeakingPartValue(attemptPart)) {
    localStorage.setItem('practiceSpeakingPart', attemptPart);
  }

  return response.data;
};
