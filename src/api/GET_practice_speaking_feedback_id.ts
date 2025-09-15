import { API_URL } from '@/lib/config';

export const GET_practice_speaking_feedback_id = async (id: string) => {
  const res = await fetch(`${API_URL}/practice/speaking/passed/${id}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });

  return res.json();
};
