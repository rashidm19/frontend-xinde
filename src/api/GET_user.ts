import { User } from "@/types/types";

export async function getUser() {
  const response = await fetch('https://api.studybox.kz/auth/profile', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });

  const data = await response.json();

  return data as User;
}