import axiosInstance from '@/lib/axiosInstance';
import { IPracticeScoresStats } from '@/types/Stats';

export async function getPracticeScoresStats() {
  const { data } = await axiosInstance.get('/stats/practice/scores');

  return data as IPracticeScoresStats;
}
