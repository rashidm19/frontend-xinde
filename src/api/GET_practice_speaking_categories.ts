import axiosInstance from '@/lib/axiosInstance';

export const GET_practice_speaking_categories = async () => {
  const { data } = await axiosInstance.get('/practice/speaking/categories');

  return data;
};
