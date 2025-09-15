import { API_URL } from '@/lib/config';

export const POST_mock_start = async () => {
  const res = await fetch(`${API_URL}/mock/test`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });

  const data = await res.json();
  console.log(data);
  return data;
};
