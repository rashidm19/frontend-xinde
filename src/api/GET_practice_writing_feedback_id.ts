import axiosInstance from '@/lib/axiosInstance';

export const GET_practice_writing_feedback_id = async (id: string) => {
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

  return response.data;
};
