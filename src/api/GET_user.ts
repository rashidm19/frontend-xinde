import { fetchProfile } from './profile';

export async function getUser() {
  return fetchProfile();
}
