import { useEffect } from 'react';

import { useSubscriptionStore } from '@/stores/subscriptionStore';

export const useSubscription = (autoFetch = true) => {
  const subscription = useSubscriptionStore(state => state.subscription);
  const status = useSubscriptionStore(state => state.status);
  const error = useSubscriptionStore(state => state.error);
  const hasActiveSubscription = useSubscriptionStore(state => state.hasActiveSubscription);
  const fetchSubscription = useSubscriptionStore(state => state.fetchSubscription);
  const ensureAccess = useSubscriptionStore(state => state.ensureAccess);
  const openPaywall = useSubscriptionStore(state => state.openPaywall);
  const closePaywall = useSubscriptionStore(state => state.closePaywall);

  useEffect(() => {
    if (!autoFetch) {
      return;
    }

    if (status === 'idle') {
      fetchSubscription().catch(() => {
        // errors are stored in zustand; components can decide how to handle them
      });
    }
  }, [autoFetch, fetchSubscription, status]);

  return {
    subscription,
    status,
    error,
    hasActiveSubscription,
    fetchSubscription,
    ensureAccess,
    openPaywall,
    closePaywall,
  };
};
