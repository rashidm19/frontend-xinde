import { API_URL } from '@/lib/config';

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

  const res = await fetch(`${API_URL}/auth/profile`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
    body: JSON.stringify(values),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`POST /auth/profile failed: ${res.status} ${text}`);
  }

  return res.json(); // <- { ...updatedUser }
}
