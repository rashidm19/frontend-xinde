import { User } from '@/types/types';
import { API_URL } from '@/lib/config';

export async function getUser() {
  const response = await fetch(`${API_URL}/auth/profile`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });

  const data = await response.json();

  return data as User;
}
