import axiosInstance from '@/lib/axiosInstance';

export const POST_mock_start = async () => {
  const { data } = await axiosInstance.post('/mock/test');
  console.log(data);
  return data;
};
