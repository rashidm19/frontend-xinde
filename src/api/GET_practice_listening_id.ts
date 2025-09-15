import { API_URL } from '@/lib/config';

export const GET_practice_listening_id = async (id: string) => {
  const res = await fetch(`${API_URL}/practice/listening/${id}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });

  return res.json();
};
