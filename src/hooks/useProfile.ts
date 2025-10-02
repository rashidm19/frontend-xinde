import { useEffect } from 'react';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';

import { useProfileStore } from '@/stores/profileStore';

export const useProfile = () => {
  const profile = useProfileStore(state => state.profile);
  const status = useProfileStore(state => state.status);
  const error = useProfileStore(state => state.error);
  const fetchProfile = useProfileStore(state => state.fetchProfile);
  const setProfile = useProfileStore(state => state.setProfile);
  const router = useRouter();
  const locale = useLocale();

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      router.replace(`/${locale}/login`);
    }
  }, [router, locale]);

  useEffect(() => {
    if (status === 'idle') {
      if (typeof window !== 'undefined' && !localStorage.getItem('token')) {
        return;
      }

      fetchProfile().catch(() => {
        // errors are stored in state; consumers can react to the status change
      });
    }
  }, [fetchProfile, status]);

  useEffect(() => {
    if (error === 'unauthorized') {
      router.replace(`/${locale}/login`);
    }
  }, [error, router, locale]);

  return { profile, status, error, fetchProfile, setProfile };
};
