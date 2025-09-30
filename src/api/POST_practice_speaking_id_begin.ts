import axiosInstance from '@/lib/axiosInstance';

export const POST_practice_speaking_id_begin = async () => {
  const id = localStorage.getItem('practiceSpeakingId') as string;
  const part = localStorage.getItem('practiceSpeakingPart') as string;

  const { data } = await axiosInstance.post(
    `/practice/speaking/${id}`,
    undefined,
    {
      params: { part },
    }
  );

  if (data.id) {
    localStorage.setItem('practiceSpeakingIdStarted', data.id);
  }

  return data;
};
