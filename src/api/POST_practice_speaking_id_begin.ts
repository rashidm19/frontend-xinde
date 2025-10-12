import type { PracticeSpeakingAttempt } from '@/types/PracticeSpeaking';

import axiosInstance from '@/lib/axiosInstance';

export const POST_practice_speaking_id_begin = async (): Promise<PracticeSpeakingAttempt> => {
  const id = localStorage.getItem('practiceSpeakingId') as string;
  const part = localStorage.getItem('practiceSpeakingPart') as string;

  const response = await axiosInstance.post<PracticeSpeakingAttempt>(
    `/practice/speaking/${id}`,
    undefined,
    {
      params: { part },
    }
  );

  if (response.data?.id) {
    localStorage.setItem('practiceSpeakingIdStarted', String(response.data.id));
  }

  return response.data;
};
