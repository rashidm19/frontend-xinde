'use client';

import { queryClient } from './queryClient';

import { resetProfile } from '@/stores/profileStore';
import { resetSubscriptionStore } from '@/stores/subscriptionStore';
import { clearAuthToken } from '@/lib/auth/session';

export const logout = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
  }

  void clearAuthToken();

  queryClient.clear();
  resetProfile();
  resetSubscriptionStore();
};
