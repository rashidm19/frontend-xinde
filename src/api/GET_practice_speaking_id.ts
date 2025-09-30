import axiosInstance from '@/lib/axiosInstance';

export const GET_practice_speaking_id = async () => {
  const id = localStorage.getItem('practiceSpeakingId') as string;
  const part = localStorage.getItem('practiceSpeakingPart') as string;

  const { data } = await axiosInstance.get(`/practice/speaking/${id}`, {
    params: { part },
  });

  return data;
};
