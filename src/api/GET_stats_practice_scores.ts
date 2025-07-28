import { IPracticeScoresStats } from '@/types/Stats';

export async function getPracticeScoresStats() {
  const response = await fetch('https://api.studybox.kz/stats/practice/scores', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });

  const data = await response.json();

  return data as IPracticeScoresStats;
}
