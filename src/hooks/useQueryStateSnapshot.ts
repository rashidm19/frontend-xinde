'use client';

import { useCallback, useSyncExternalStore } from 'react';
import { useQueryClient, type QueryKey, type QueryState } from '@tanstack/react-query';

export const useQueryStateSnapshot = <TData, TError = unknown>(queryKey: QueryKey): QueryState<TData, TError> | undefined => {
  const queryClient = useQueryClient();

  const getSnapshot = useCallback(() => queryClient.getQueryState<TData, TError>(queryKey), [queryClient, queryKey]);

  const subscribe = useCallback(
    (onStoreChange: () => void) =>
      queryClient.getQueryCache().subscribe(() => {
        onStoreChange();
      }),
    [queryClient]
  );

  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
};
