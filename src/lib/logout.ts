'use client';

import { queryClient } from './queryClient';

import { resetProfile } from '@/stores/profileStore';
import { resetSubscriptionStore } from '@/stores/subscriptionStore';
import { clearAuthToken } from '@/lib/auth/session';

export const logout = async () => {
  if (process.env.NODE_ENV !== 'production') {
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
