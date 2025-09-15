import { API_URL } from '@/lib/config';

export const GET_practice_writing_id = async (id: string) => {
  const res = await fetch(`${API_URL}/practice/writing/${id}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });

  return res.json();
};
