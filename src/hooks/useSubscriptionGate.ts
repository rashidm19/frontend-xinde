import { useCallback, useState } from 'react';

import { useSubscriptionStore } from '@/stores/subscriptionStore';

export const useSubscriptionGate = () => {
  const ensureAccess = useSubscriptionStore(state => state.ensureAccess);
  const hasActiveSubscription = useSubscriptionStore(state => state.hasActiveSubscription);
  const [isCheckingAccess, setIsCheckingAccess] = useState(false);

  const requireSubscription = useCallback(async () => {
    setIsCheckingAccess(true);
    try {
      return await ensureAccess();
    } finally {
      setIsCheckingAccess(false);
    }
  }, [ensureAccess]);

  return {
    hasActiveSubscription,
    isCheckingAccess,
    requireSubscription,
  };
};
