import { API_URL } from '@/lib/config';

export const GET_practice_speaking_categories = async () => {
  const res = await fetch(`${API_URL}/practice/speaking/categories`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });

  return res.json();
};
