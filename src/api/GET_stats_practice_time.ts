import axiosInstance from '@/lib/axiosInstance';
import { PracticeTimeStats } from '@/types/Stats';

export async function getPracticeTimeStats() {
  const { data } = await axiosInstance.get('/stats/practice/time');

  return data as PracticeTimeStats;
}
