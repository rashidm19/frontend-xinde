'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

import { useSubscriptionStore } from '@/stores/subscriptionStore';

export const SubscriptionInitializer = () => {
  const fetchSubscription = useSubscriptionStore(state => state.fetchSubscription);
  const pathname = usePathname();
  const isFirstPathCheck = useRef(true);

  useEffect(() => {
    fetchSubscription().catch(() => {
      // errors are handled within the store
    });
  }, [fetchSubscription]);

  useEffect(() => {
    if (isFirstPathCheck.current) {
      isFirstPathCheck.current = false;
      return;
    }

    fetchSubscription(true).catch(() => {
      // errors are handled within the store
    });
  }, [fetchSubscription, pathname]);

  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchSubscription(true).catch(() => {
          // errors are handled within the store
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchSubscription]);

  return null;
};
