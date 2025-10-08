import axiosInstance from '@/lib/axiosInstance';
import type { WritingFeedbackResponse } from '@/types/WritingFeedback';

export const GET_practice_writing_feedback_id = async (id: string): Promise<WritingFeedbackResponse> => {
  const response = await axiosInstance.get(`/practice/writing/passed/${id}`, {
    validateStatus: () => true,
  });

  if (response.status === 404) {
    const error = new Error('Not Found');
    // @ts-expect-error добавляем статус внутрь объекта ошибки
    error.status = 404;
    throw error;
  }

  if (response.status < 200 || response.status >= 300) {
    throw new Error(`Backend responded with status ${response.status}`);
  }

  return response.data as WritingFeedbackResponse;
};
