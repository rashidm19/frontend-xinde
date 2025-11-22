'use client';

import { useEffect } from 'react';

import type { IBillingBalance, IClientSubscription } from '@/types/Billing';
import { BALANCE_QUERY_KEY, SUBSCRIPTION_QUERY_KEY } from '@/lib/queryKeys';
import { useCachedQueryData } from '@/hooks/useCachedQueryData';
import { useQueryStateSnapshot } from '@/hooks/useQueryStateSnapshot';
import { deriveQueryError, deriveQueryStatus } from '@/lib/subscription/queryState';
import { computeBalanceFlags, computeHasActiveSubscription } from '@/lib/subscription/derive';
import { useSubscriptionStore } from '@/stores/subscriptionStore';

export const SubscriptionInitializer = () => {
  const subscriptionData = useCachedQueryData<IClientSubscription | null>(SUBSCRIPTION_QUERY_KEY);
  const balanceData = useCachedQueryData<IBillingBalance | null>(BALANCE_QUERY_KEY);

  const subscriptionState = useQueryStateSnapshot<IClientSubscription | null>(SUBSCRIPTION_QUERY_KEY);
  const balanceState = useQueryStateSnapshot<IBillingBalance | null>(BALANCE_QUERY_KEY);

  const subscriptionStatus = deriveQueryStatus(subscriptionState);
  const subscriptionError = deriveQueryError(subscriptionState);
  const balanceStatus = deriveQueryStatus(balanceState);
  const balanceError = deriveQueryError(balanceState);

  useEffect(() => {
    const subscription = subscriptionData ?? null;
    const balance = balanceData ?? null;

    const hasActiveSubscription = computeHasActiveSubscription(subscription);
    const balanceFlags = computeBalanceFlags(balance);

    useSubscriptionStore.setState({
      subscription,
      status: subscriptionStatus,
      error: subscriptionError,
      hasActiveSubscription,
      balance,
      balanceStatus,
      balanceError,
      ...balanceFlags,
    });
  }, [subscriptionData, balanceData, subscriptionStatus, subscriptionError, balanceStatus, balanceError]);

  return null;
};
