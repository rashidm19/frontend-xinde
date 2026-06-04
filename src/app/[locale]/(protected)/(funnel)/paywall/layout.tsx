import { dehydrate, QueryClient } from '@tanstack/react-query';
import type { ReactNode } from 'react';

import HydrateOnly from '@/app/_providers/HydrateOnly';
import { getPlans } from '@/lib/subscription/getPlans';

export const dynamic = 'force-dynamic';

// Prefetch the plans query server-side and hydrate it, so the paywall page
// renders the full plan set on first paint instead of flashing demo-only → all
// plans. If the server fetch fails, fall through and let the client query load
// (the page still works, just with the usual skeleton).
export default async function PaywallLayout({ children }: { children: ReactNode }) {
  const plans = await getPlans();

  if (!plans) {
    return <>{children}</>;
  }

  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: ['/billing/subscriptions/plans'],
    queryFn: async () => plans,
  });

  return <HydrateOnly state={dehydrate(queryClient)}>{children}</HydrateOnly>;
}
