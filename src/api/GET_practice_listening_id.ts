import axiosInstance from '@/lib/axiosInstance';

export const GET_practice_listening_id = async (id: string) => {
  const { data } = await axiosInstance.get(`/practice/listening/${id}`);

  return data;
};
