import { dehydrate, QueryClient } from '@tanstack/react-query';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';

import HydrateOnly from '@/app/_providers/HydrateOnly';
import { ME_QUERY_KEY, SUBSCRIPTION_QUERY_KEY, BALANCE_QUERY_KEY } from '@/lib/queryKeys';
import { getMe } from '@/lib/auth/getMe';
import { getBalance } from '@/lib/subscription/getBalance';
import { getSubscription } from '@/lib/subscription/getSubscription';
import { UpstreamServiceError } from '@/lib/api/errors';
import type { IBillingBalance, IClientSubscription } from '@/types/Billing';
import type { User } from '@/types/types';

type ProtectedLayoutProps = {
  children: ReactNode;
  params: { locale: string };
};

export const dynamic = 'force-dynamic';

const ServiceUnavailable = () => (
  <div className='flex min-h-[60vh] w-full items-center justify-center px-[24rem] py-[40rem]'>
    <div className='max-w-[420rem] text-center'>
      <h1 className='text-[24rem] font-semibold text-d-black'>Service temporarily unavailable</h1>
      <p className='mt-[12rem] text-[14rem] text-d-black/70'>Please try again in a few moments.</p>
    </div>
  </div>
);

export default async function ProtectedLayout({ children, params }: ProtectedLayoutProps) {
  const { locale } = params;
  let serviceUnavailable = false;
  let me: User | null = null;

  try {
    me = await getMe();
  } catch (error) {
    if (error instanceof UpstreamServiceError) {
      serviceUnavailable = true;
    } else {
      throw error;
    }
  }

  if (serviceUnavailable) {
    return <ServiceUnavailable />;
  }

  if (!me) {
    redirect(`/${locale}/login`);
  }

  const queryClient = new QueryClient();
  let subscription: IClientSubscription | null = null;
  let balance: IBillingBalance | null = null;

  const [subscriptionResult, balanceResult] = await Promise.allSettled([getSubscription(), getBalance()]);

  if (subscriptionResult.status === 'fulfilled') {
    subscription = subscriptionResult.value;
  } else if (subscriptionResult.reason instanceof UpstreamServiceError) {
    serviceUnavailable = true;
  } else {
    throw subscriptionResult.reason;
  }

  if (balanceResult.status === 'fulfilled') {
    balance = balanceResult.value;
  } else if (balanceResult.reason instanceof UpstreamServiceError) {
    serviceUnavailable = true;
  } else {
    throw balanceResult.reason;
  }

  if (serviceUnavailable) {
    return <ServiceUnavailable />;
  }

  if (!balance) {
    balance = {
      tenge_balance: 0,
      mock_balance: 0,
      practice_balance: 0,
    };
  }

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
  // NOTE: Keep hydration below intact when adding new fallback branches so prefetched queries continue to dehydrate.
  return <HydrateOnly state={dehydratedState}>{children}</HydrateOnly>;
}
