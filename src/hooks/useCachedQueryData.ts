import { useCallback, useSyncExternalStore } from 'react';
import { useQueryClient, type QueryKey } from '@tanstack/react-query';

export const useCachedQueryData = <T,>(queryKey: QueryKey): T | undefined => {
  const queryClient = useQueryClient();

  const getSnapshot = useCallback(() => queryClient.getQueryData<T>(queryKey), [queryClient, queryKey]);

  const subscribe = useCallback(
    (onStoreChange: () => void) =>
      queryClient.getQueryCache().subscribe(() => {
        onStoreChange();
      }),
    [queryClient]
  );

  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
};
