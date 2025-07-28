import { MockTimeStats } from '@/types/Stats';

export async function getPracticeTimeStats() {
  const response = await fetch('https://api.studybox.kz/stats/practice/time', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });

  const data = await response.json();

  return data as MockTimeStats;
}
