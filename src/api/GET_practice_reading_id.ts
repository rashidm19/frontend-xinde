import axiosInstance from '@/lib/axiosInstance';

export const GET_practice_reading_id = async (id: string) => {
  const { data } = await axiosInstance.get(`/practice/reading/${id}`);

  return data;
};
