import axiosInstance from '@/lib/axiosInstance';

export const GET_practice_writing_id = async (id: string) => {
  const { data } = await axiosInstance.get(`/practice/writing/${id}`);

  return data;
};
