import { useCallback, useMemo } from 'react';
import { useQueryClient, type QueryState } from '@tanstack/react-query';

import type { IBillingBalance, IClientSubscription } from '@/types/Billing';
import { BALANCE_QUERY_KEY, SUBSCRIPTION_QUERY_KEY } from '@/lib/queryKeys';
import { computeBalanceFlags, computeHasActiveSubscription } from '@/lib/subscription/derive';
import { useCachedQueryData } from '@/hooks/useCachedQueryData';
import { closeSubscriptionPaywall, openSubscriptionPaywall } from '@/stores/subscriptionStore';

type SubscriptionStatus = 'idle' | 'loading' | 'success' | 'error';

const deriveStatus = (state?: QueryState<unknown, unknown>): SubscriptionStatus => {
  if (!state) {
    return 'idle';
  }

  if (state.status === 'success') {
    return 'success';
  }

  if (state.status === 'error') {
    return 'error';
  }

  if (state.fetchStatus === 'fetching' || state.fetchStatus === 'paused') {
    return 'loading';
  }

  return 'idle';
};

const deriveError = (state?: QueryState<unknown, unknown>): string | null => {
  if (!state || !state.error) {
    return null;
  }

  if (state.error instanceof Error) {
    return state.error.message;
  }

  if (typeof state.error === 'string') {
    return state.error;
  }

  return 'Unknown error';
};

export const useSubscription = () => {
  const queryClient = useQueryClient();

  const subscriptionData = useCachedQueryData<IClientSubscription | null>(SUBSCRIPTION_QUERY_KEY);
  const balanceData = useCachedQueryData<IBillingBalance | null>(BALANCE_QUERY_KEY);

  const subscription = subscriptionData ?? null;
  const balance = balanceData ?? null;

  const subscriptionState = queryClient.getQueryState<IClientSubscription | null>(SUBSCRIPTION_QUERY_KEY);
  const balanceState = queryClient.getQueryState<IBillingBalance | null>(BALANCE_QUERY_KEY);

  const status = deriveStatus(subscriptionState);
  const error = deriveError(subscriptionState);
  const balanceStatus = deriveStatus(balanceState);
  const balanceError = deriveError(balanceState);

  const hasActiveSubscription = useMemo(() => computeHasActiveSubscription(subscription), [subscription]);
  const { hasPracticeCredits, hasMockCredits } = useMemo(() => computeBalanceFlags(balance), [balance]);

  const openPaywall = useCallback(() => {
    openSubscriptionPaywall();
  }, []);

  const closePaywall = useCallback(() => {
    closeSubscriptionPaywall();
  }, []);

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
    openPaywall,
    closePaywall,
  };
};
