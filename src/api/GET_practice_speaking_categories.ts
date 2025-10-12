import type { PracticeSpeakingCategoriesResponse } from '@/types/PracticeSpeaking';

import axiosInstance from '@/lib/axiosInstance';

export const GET_practice_speaking_categories = async (): Promise<PracticeSpeakingCategoriesResponse> => {
  const response = await axiosInstance.get<PracticeSpeakingCategoriesResponse>('/practice/speaking/categories');

  return response.data;
};
