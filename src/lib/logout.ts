'use client';

import { queryClient } from './queryClient';

import { resetProfile } from '@/stores/profileStore';
import { resetSubscriptionStore } from '@/stores/subscriptionStore';
import { clearAuthToken } from '@/lib/auth/session';
import { IS_NOT_PROD_BUILD } from '@/lib/config';

export const logout = async () => {
  if (IS_NOT_PROD_BUILD) {
    console.debug('[logout] invoked');
  }

  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem('token');
    } catch (error) {
      console.warn('[logout] failed to remove token from localStorage', error);
    }
  }

  await clearAuthToken();

  queueMicrotask(() => {
    queryClient.clear();
    resetProfile();
    resetSubscriptionStore();
  });
};
