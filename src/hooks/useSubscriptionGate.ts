import { useCallback, useMemo, useState } from 'react';

import { BALANCE_QUERY_KEY, SUBSCRIPTION_QUERY_KEY } from '@/lib/queryKeys';
import { useCachedQueryData } from '@/hooks/useCachedQueryData';
import type { IBillingBalance, IClientSubscription } from '@/types/Billing';
import { computeBalanceFlags, computeHasActiveSubscription } from '@/lib/subscription/derive';
import { openSubscriptionPaywall } from '@/stores/subscriptionStore';

type AccessMode = 'practice' | 'mock' | 'subscription';

export const useSubscriptionGate = (mode: AccessMode = 'practice') => {
  const subscriptionData = useCachedQueryData<IClientSubscription | null>(SUBSCRIPTION_QUERY_KEY);
  const balanceData = useCachedQueryData<IBillingBalance | null>(BALANCE_QUERY_KEY);

  const subscription = subscriptionData ?? null;
  const balance = balanceData ?? null;

  const hasActiveSubscription = useMemo(() => computeHasActiveSubscription(subscription), [subscription]);
  const { hasPracticeCredits, hasMockCredits } = useMemo(() => computeBalanceFlags(balance), [balance]);

  const [isCheckingAccess, setIsCheckingAccess] = useState(false);

  const requireSubscription = useCallback(async () => {
    setIsCheckingAccess(true);
    try {
      let allowed = false;

      if (mode === 'mock') {
        allowed = hasMockCredits;
      } else if (mode === 'subscription') {
        allowed = hasActiveSubscription;
      } else {
        allowed = hasActiveSubscription || hasPracticeCredits;
      }

      if (!allowed) {
        openSubscriptionPaywall();
      }

      return allowed;
    } finally {
      setIsCheckingAccess(false);
    }
  }, [hasActiveSubscription, hasMockCredits, hasPracticeCredits, mode]);

  return {
    hasActiveSubscription,
    hasPracticeCredits,
    hasMockCredits,
    isCheckingAccess,
    requireSubscription,
  };
};
