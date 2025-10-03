'use client';

import { queryClient } from './queryClient';

import { resetProfile } from '@/stores/profileStore';
import { resetSubscriptionStore } from '@/stores/subscriptionStore';

export const logout = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
  }

  queryClient.clear();
  resetProfile();
  resetSubscriptionStore();
};
