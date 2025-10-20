import { useCallback, useState } from 'react';

import { useSubscriptionStore } from '@/stores/subscriptionStore';

type AccessMode = 'practice' | 'mock' | 'subscription';

export const useSubscriptionGate = (mode: AccessMode = 'practice') => {
  const ensureAccess = useSubscriptionStore(state => state.ensureAccess);
  const hasActiveSubscription = useSubscriptionStore(state => state.hasActiveSubscription);
  const hasPracticeCredits = useSubscriptionStore(state => state.hasPracticeCredits);
  const hasMockCredits = useSubscriptionStore(state => state.hasMockCredits);
  const [isCheckingAccess, setIsCheckingAccess] = useState(false);

  const requireSubscription = useCallback(async () => {
    setIsCheckingAccess(true);
    try {
      return await ensureAccess(mode);
    } finally {
      setIsCheckingAccess(false);
    }
  }, [ensureAccess, mode]);

  return {
    hasActiveSubscription,
    hasPracticeCredits,
    hasMockCredits,
    isCheckingAccess,
    requireSubscription,
  };
};
