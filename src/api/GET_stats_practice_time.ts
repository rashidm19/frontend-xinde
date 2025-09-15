import { MockTimeStats } from '@/types/Stats';
import { API_URL } from '@/lib/config';

export async function getPracticeTimeStats() {
  const response = await fetch(`${API_URL}/stats/practice/time`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });

  const data = await response.json();

  return data as MockTimeStats;
}
