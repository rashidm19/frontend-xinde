import { API_URL } from '@/lib/config';

export const POST_practice_speaking_id_start = async () => {
  const id = localStorage.getItem('practiceSpeakingId') as string;
  const part = localStorage.getItem('practiceSpeakingPart') as string;

  const res = await fetch(`${API_URL}/practice/speaking/${id}?part=${part}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });

  return res.json();
};
