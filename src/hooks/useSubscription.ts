import { useEffect } from 'react';

import { useSubscriptionStore } from '@/stores/subscriptionStore';

export const useSubscription = (autoFetch = true) => {
  const subscription = useSubscriptionStore(state => state.subscription);
  const status = useSubscriptionStore(state => state.status);
  const error = useSubscriptionStore(state => state.error);
  const hasActiveSubscription = useSubscriptionStore(state => state.hasActiveSubscription);
  const fetchSubscription = useSubscriptionStore(state => state.fetchSubscription);
  const balance = useSubscriptionStore(state => state.balance);
  const balanceStatus = useSubscriptionStore(state => state.balanceStatus);
  const balanceError = useSubscriptionStore(state => state.balanceError);
  const hasPracticeCredits = useSubscriptionStore(state => state.hasPracticeCredits);
  const hasMockCredits = useSubscriptionStore(state => state.hasMockCredits);
  const ensureAccess = useSubscriptionStore(state => state.ensureAccess);
  const openPaywall = useSubscriptionStore(state => state.openPaywall);
  const closePaywall = useSubscriptionStore(state => state.closePaywall);
  const fetchBalance = useSubscriptionStore(state => state.fetchBalance);
  const refreshSubscriptionAndBalance = useSubscriptionStore(state => state.refreshSubscriptionAndBalance);

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

  useEffect(() => {
    if (!autoFetch) {
      return;
    }

    if (balanceStatus === 'idle') {
      fetchBalance().catch(() => {
        // errors are stored in zustand; components can decide how to handle them
      });
    }
  }, [autoFetch, balanceStatus, fetchBalance]);

  return {
    subscription,
    status,
    error,
    hasActiveSubscription,
    balance,
    balanceStatus,
    balanceError,
    hasPracticeCredits,
    hasMockCredits,
    fetchSubscription,
    fetchBalance,
    refreshSubscriptionAndBalance,
    ensureAccess,
    openPaywall,
    closePaywall,
  };
};
