import { IPracticeScoresStats } from '@/types/Stats';
import { API_URL } from '@/lib/config';

export async function getPracticeScoresStats() {
  const response = await fetch(`${API_URL}/stats/practice/scores`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });

  const data = await response.json();

  return data as IPracticeScoresStats;
}
