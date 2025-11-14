import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import { getActiveModals, isModalNotTrackedError } from '@/api/uiModals';

export const ACTIVE_MODALS_QUERY_KEY = ['ui-modals', 'active'] as const;

interface UseActiveModalsOptions {
  enabled?: boolean;
}

type ActiveModalsResult = Awaited<ReturnType<typeof getActiveModals>>;

export const useActiveModals = ({ enabled = true }: UseActiveModalsOptions = {}): UseQueryResult<ActiveModalsResult> =>
  useQuery({
    queryKey: ACTIVE_MODALS_QUERY_KEY,
    queryFn: getActiveModals,
    enabled,
    retry: (failureCount, error) => {
      if (isModalNotTrackedError(error)) {
        return false;
      }

      return failureCount < 2;
    },
  });
