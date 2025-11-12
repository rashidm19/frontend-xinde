import { dehydrate, QueryClient } from '@tanstack/react-query';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';

import HydrateOnly from '@/app/_providers/HydrateOnly';
import { ME_QUERY_KEY, SUBSCRIPTION_QUERY_KEY, BALANCE_QUERY_KEY } from '@/lib/queryKeys';
import { getMe } from '@/lib/auth/getMe';
import { getBalance } from '@/lib/subscription/getBalance';
import { getSubscription } from '@/lib/subscription/getSubscription';

type ProtectedLayoutProps = {
  children: ReactNode;
  params: { locale: string };
};

export const dynamic = 'force-dynamic';

export default async function ProtectedLayout({ children, params }: ProtectedLayoutProps) {
  const { locale } = params;
  const me = await getMe();

  if (!me) {
    redirect(`/${locale}/login`);
  }

  const queryClient = new QueryClient();

  const [subscription, balance] = await Promise.all([getSubscription(), getBalance()]);

  await queryClient.prefetchQuery({
    queryKey: ME_QUERY_KEY,
    queryFn: async () => me,
  });

  await queryClient.prefetchQuery({
    queryKey: SUBSCRIPTION_QUERY_KEY,
    queryFn: async () => subscription,
  });

  await queryClient.prefetchQuery({
    queryKey: BALANCE_QUERY_KEY,
    queryFn: async () => balance,
  });

  const dehydratedState = dehydrate(queryClient);

  // Providers already wrap the locale subtree; only hydrate here to avoid duplicate QueryClient providers.
  return <HydrateOnly state={dehydratedState}>{children}</HydrateOnly>;
}
