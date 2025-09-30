import axiosInstance from '@/lib/axiosInstance';

export const GET_practice_listening_results_id = async (id: string) => {
  const { data } = await axiosInstance.get(`/practice/listening/passed/${id}`);

  return data;
};
