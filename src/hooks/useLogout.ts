'use client';

import { useCallback } from 'react';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import nProgress from 'nprogress';

import { logout as performLogout } from '@/lib/logout';

export const useLogout = () => {
  const router = useRouter();
  const locale = useLocale();

  const logout = useCallback(async () => {
    nProgress.start();

    try {
      await performLogout();
      router.push(`/${locale}`);
    } catch (error) {
      console.error('[useLogout] Failed to logout', error);
    } finally {
      nProgress.done();
    }
  }, [locale, router]);

  return { logout };
};
