import type { MockOut } from '@/types/Mock';

import axiosInstance from '@/lib/axiosInstance';

export const POST_mock_start = async (): Promise<MockOut> => {
  const response = await axiosInstance.post<MockOut>('/mock/test');

  return response.data;
};
