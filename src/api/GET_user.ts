import axiosInstance from '@/lib/axiosInstance';
import { User } from '@/types/types';

export async function getUser() {
  const { data } = await axiosInstance.get('/auth/profile');

  return data as User;
}
