import { API_URL } from '@/lib/config';

export const GET_practice_speaking_id = async () => {
  const id = localStorage.getItem('practiceSpeakingId') as string;
  const part = localStorage.getItem('practiceSpeakingPart') as string;

  const res = await fetch(`${API_URL}/practice/speaking/${id}?part=${part}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });

  return res.json();
};
