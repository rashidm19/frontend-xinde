import type { PracticeSpeakingAttempt, PracticeSpeakingPartValue } from '@/types/PracticeSpeaking';

import axiosInstance from '@/lib/axiosInstance';

export const POST_practice_speaking_id_begin = async (practiceId: string, part?: PracticeSpeakingPartValue | null): Promise<PracticeSpeakingAttempt> => {
  const response = await axiosInstance.post<PracticeSpeakingAttempt>(
    `/practice/speaking/${practiceId}`,
    undefined,
    {
      params: part ? { part } : undefined,
    }
  );

  return response.data;
};
