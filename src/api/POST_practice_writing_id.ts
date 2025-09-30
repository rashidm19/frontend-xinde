import axiosInstance from '@/lib/axiosInstance';

export const POST_practice_writing_id = async (id: string, answer: string) => {
  const { data } = await axiosInstance.post(`/practice/writing/${id}`, { answer });

  return data;
};
