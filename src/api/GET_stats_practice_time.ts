import axiosInstance from '@/lib/axiosInstance';
import { MockTimeStats } from '@/types/Stats';

export async function getPracticeTimeStats() {
  const { data } = await axiosInstance.get('/stats/practice/time');

  return data as MockTimeStats;
}
