import axiosInstance from '@/lib/axiosInstance';

export const GET_practice_speaking_feedback_id = async (id: string) => {
  const { data } = await axiosInstance.get(`/practice/speaking/passed/${id}`);

  return data;
};
