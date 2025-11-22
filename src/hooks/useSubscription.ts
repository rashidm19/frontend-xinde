import { useCallback, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import type { IBillingBalance, IClientSubscription } from '@/types/Billing';
import { BALANCE_QUERY_KEY, SUBSCRIPTION_QUERY_KEY } from '@/lib/queryKeys';
import { computeBalanceFlags, computeHasActiveSubscription } from '@/lib/subscription/derive';
import { useCachedQueryData } from '@/hooks/useCachedQueryData';
import { closeSubscriptionPaywall, openSubscriptionPaywall } from '@/stores/subscriptionStore';
import { deriveQueryError, deriveQueryStatus } from '@/lib/subscription/queryState';

export const useSubscription = () => {
  const queryClient = useQueryClient();

  const subscriptionData = useCachedQueryData<IClientSubscription | null>(SUBSCRIPTION_QUERY_KEY);
  const balanceData = useCachedQueryData<IBillingBalance | null>(BALANCE_QUERY_KEY);

  const subscription = subscriptionData ?? null;
  const balance = balanceData ?? null;

  const subscriptionState = queryClient.getQueryState<IClientSubscription | null>(SUBSCRIPTION_QUERY_KEY);
  const balanceState = queryClient.getQueryState<IBillingBalance | null>(BALANCE_QUERY_KEY);

  const status = deriveQueryStatus(subscriptionState);
  const error = deriveQueryError(subscriptionState);
  const balanceStatus = deriveQueryStatus(balanceState);
  const balanceError = deriveQueryError(balanceState);

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
