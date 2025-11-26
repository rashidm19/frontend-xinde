'use client';

import { useEffect, useRef, useState } from 'react';
import { type QueryClient, useQueryClient } from '@tanstack/react-query';

import { BALANCE_QUERY_KEY, ME_QUERY_KEY, SUBSCRIPTION_QUERY_KEY } from '@/lib/queryKeys';
import { deriveQueryStatus } from '@/lib/subscription/queryState';
import { useHasMounted } from '@/hooks/useHasMounted';

const BOOTSTRAP_QUERY_KEYS = [ME_QUERY_KEY, SUBSCRIPTION_QUERY_KEY, BALANCE_QUERY_KEY] as const;

let bootstrapResolved = false;

type BootstrapQueryKey = (typeof BOOTSTRAP_QUERY_KEYS)[number];

const isQuerySettled = (client: QueryClient, key: BootstrapQueryKey) => {
  const state = client.getQueryState(key);

  if (!state) {
    return false;
  }

  const status = deriveQueryStatus(state);

  if (status === 'success' || status === 'error') {
    return state.fetchStatus !== 'fetching' && state.fetchStatus !== 'paused';
  }

  return false;
};

export const useAppBootstrapReady = () => {
  const queryClient = useQueryClient();
  const hasMounted = useHasMounted();
  const [isReady, setIsReady] = useState(() => bootstrapResolved);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!hasMounted) {
      return;
    }

    if (bootstrapResolved) {
      setIsReady(true);
      return;
    }

    const resolveIfSettled = () => {
      if (bootstrapResolved) {
        return;
      }

      const settled = BOOTSTRAP_QUERY_KEYS.every(key => isQuerySettled(queryClient, key));

      if (settled) {
        bootstrapResolved = true;
        setIsReady(true);

        if (unsubscribeRef.current) {
          unsubscribeRef.current();
          unsubscribeRef.current = null;
        }
      }
    };

    resolveIfSettled();

    if (bootstrapResolved) {
      return;
    }

    const unsubscribe = queryClient.getQueryCache().subscribe(() => {
      resolveIfSettled();
    });

    unsubscribeRef.current = unsubscribe;

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [hasMounted, queryClient]);

  return bootstrapResolved || isReady;
};
