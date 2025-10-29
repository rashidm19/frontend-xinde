'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

import { fetchSubscriptionPlans } from '@/api/subscriptions';
import type { ISubscriptionPlan } from '@/types/Billing';

export const usePricingPlans = () => {
  const query = useQuery<ISubscriptionPlan[]>({
    queryKey: ['/billing/subscriptions/plans'],
    queryFn: fetchSubscriptionPlans,
  });

  const activePlans = useMemo(() => (query.data ?? []).filter(plan => plan.is_active), [query.data]);

  return {
    ...query,
    plans: query.data ?? [],
    activePlans,
  };
};
