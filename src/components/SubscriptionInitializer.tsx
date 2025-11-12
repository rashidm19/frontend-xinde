'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import type { IBillingBalance, IClientSubscription } from '@/types/Billing';
import { useSubscriptionStore } from '@/stores/subscriptionStore';
import { BALANCE_QUERY_KEY, SUBSCRIPTION_QUERY_KEY } from '@/lib/queryKeys';

export const SubscriptionInitializer = () => {
  const queryClient = useQueryClient();
  const setSubscription = useSubscriptionStore(state => state.setSubscription);
  const setBalance = useSubscriptionStore(state => state.setBalance);

  useEffect(() => {
    const subscription = queryClient.getQueryData<IClientSubscription | null>(SUBSCRIPTION_QUERY_KEY);
    const balance = queryClient.getQueryData<IBillingBalance | null>(BALANCE_QUERY_KEY);

    if (subscription !== undefined) {
      setSubscription(subscription ?? null);
    }

    if (balance !== undefined) {
      setBalance(balance ?? null);
    }
  }, [queryClient, setBalance, setSubscription]);

  return null;
};
