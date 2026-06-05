'use client';

import { useQuery } from '@tanstack/react-query';

import { fetchLaunchOffer } from '@/api/subscriptions';
import type { ILaunchOffer } from '@/types/Billing';

const INACTIVE: ILaunchOffer = { active: false, expiresAt: null, discountPct: 0 };

// Per-user launch-offer window. Fetched once and cached: the first call starts the
// window server-side, so we deliberately do not refetch (that would never restart
// it, but there's no reason to re-hit it). Returns an inactive offer while loading
// or for logged-out users, so the discount/timer only appears when it's truly on.
export const useOffer = (): ILaunchOffer => {
  const query = useQuery<ILaunchOffer>({
    queryKey: ['/billing/offer'],
    queryFn: fetchLaunchOffer,
    staleTime: Infinity,
    retry: false,
  });

  return query.data ?? INACTIVE;
};
