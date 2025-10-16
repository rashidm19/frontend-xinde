import axiosInstance from '@/lib/axiosInstance';
import { PracticeHistoryEntry } from '@/types/Stats';

export async function getPracticeHistory() {
  const { data } = await axiosInstance.get('/practice/history');

  if (Array.isArray(data)) {
    return data as PracticeHistoryEntry[];
  }

  if (data && Array.isArray(data.history)) {
    return data.history as PracticeHistoryEntry[];
  }

  return [] as PracticeHistoryEntry[];
}
