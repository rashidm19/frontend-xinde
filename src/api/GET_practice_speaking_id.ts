import type { PracticeSpeakingPartResponse, PracticeSpeakingPartValue } from '@/types/PracticeSpeaking';

import axiosInstance from '@/lib/axiosInstance';

export const GET_practice_speaking_id = async (practiceId: string, part?: PracticeSpeakingPartValue | null): Promise<PracticeSpeakingPartResponse> => {
  const response = await axiosInstance.get<PracticeSpeakingPartResponse>(`/practice/speaking/${practiceId}`, {
    params: part ? { part } : undefined,
  });

  return response.data;
};
