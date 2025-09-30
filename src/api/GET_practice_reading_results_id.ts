import axiosInstance from '@/lib/axiosInstance';

export const GET_practice_reading_results_id = async (id: string) => {
  const { data } = await axiosInstance.get(`/practice/reading/passed/${id}`);

  return data;
};
