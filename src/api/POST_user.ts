import axiosInstance from '@/lib/axiosInstance';

interface Props {
  grade?: string;
  name?: string;
  region?: string;
}

export async function postUser({ grade, name, region }: Props) {
  const values = {
    ...(grade && { grade }),
    ...(name && { name }),
    ...(region && { region }),
  };

  const response = await axiosInstance.post('/auth/profile', values, {
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
    },
    validateStatus: () => true,
  });

  if (response.status < 200 || response.status >= 300) {
    const text = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
    throw new Error(`POST /auth/profile failed: ${response.status} ${text}`);
  }

  return response.data; // <- { ...updatedUser }
}
