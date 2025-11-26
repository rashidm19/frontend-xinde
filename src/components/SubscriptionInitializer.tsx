'use client';

import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';

import { fetchBillingBalance, fetchCurrentSubscription } from '@/api/subscriptions';
import { computeBalanceFlags, computeHasActiveSubscription } from '@/lib/subscription/derive';
import { BALANCE_QUERY_KEY, SUBSCRIPTION_QUERY_KEY } from '@/lib/queryKeys';
import { useSubscriptionStore } from '@/stores/subscriptionStore';

// Helper to match store's expected status type
type SubscriptionStatus = 'idle' | 'loading' | 'success' | 'error';

export const SubscriptionInitializer = () => {
  const subscriptionQuery = useQuery({
    queryKey: SUBSCRIPTION_QUERY_KEY,
    queryFn: fetchCurrentSubscription,
    staleTime: 300_000, // 5 minutes
    refetchOnWindowFocus: true, // Refresh when user returns
  });

  const balanceQuery = useQuery({
    queryKey: BALANCE_QUERY_KEY,
    queryFn: fetchBillingBalance,
    staleTime: 300_000, // 5 minutes
    refetchOnWindowFocus: true,
  });

  const deriveStatus = (q: { status: string; fetchStatus: string }): SubscriptionStatus => {
    if (q.status === 'success') return 'success';
    if (q.status === 'error') return 'error';
    if (q.fetchStatus === 'fetching') return 'loading';
    return 'idle';
  };

  const deriveError = (q: { error: unknown }): string | null => {
    if (!q.error) return null;
    if (q.error instanceof Error) return q.error.message;
    return 'Unknown error';
  };

  useEffect(() => {
    const subscription = subscriptionQuery.data ?? null;
    const balance = balanceQuery.data ?? null;

    const hasActiveSubscription = computeHasActiveSubscription(subscription);
    const balanceFlags = computeBalanceFlags(balance);

    useSubscriptionStore.setState({
      subscription,
      status: deriveStatus(subscriptionQuery),
      error: deriveError(subscriptionQuery),
      hasActiveSubscription,
      balance,
      balanceStatus: deriveStatus(balanceQuery),
      balanceError: deriveError(balanceQuery),
      ...balanceFlags,
    });
  }, [
    subscriptionQuery.data,
    subscriptionQuery.status,
    subscriptionQuery.fetchStatus,
    subscriptionQuery.error,
    balanceQuery.data,
    balanceQuery.status,
    balanceQuery.fetchStatus,
    balanceQuery.error,
  ]);

  return null;
};
