'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

import { useSubscriptionStore } from '@/stores/subscriptionStore';

export const SubscriptionInitializer = () => {
  const fetchSubscription = useSubscriptionStore(state => state.fetchSubscription);
  const fetchBalance = useSubscriptionStore(state => state.fetchBalance);
  const pathname = usePathname();
  const isFirstPathCheck = useRef(true);

  useEffect(() => {
    Promise.all([fetchSubscription(), fetchBalance()]).catch(() => {
      // errors are handled within the store
    });
  }, [fetchBalance, fetchSubscription]);

  useEffect(() => {
    if (isFirstPathCheck.current) {
      isFirstPathCheck.current = false;
      return;
    }

    Promise.all([fetchSubscription(true), fetchBalance(true)]).catch(() => {
      // errors are handled within the store
    });
  }, [fetchBalance, fetchSubscription, pathname]);

  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        Promise.all([fetchSubscription(true), fetchBalance(true)]).catch(() => {
          // errors are handled within the store
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchBalance, fetchSubscription]);

  return null;
};
