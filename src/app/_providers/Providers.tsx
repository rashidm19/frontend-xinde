'use client';

import { HydrationBoundary, QueryClientProvider, type DehydratedState } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import type { ReactNode } from 'react';

import { GlobalConfirmationModal } from '@/components/GlobalConfirmationModal';
import { GlobalSubscriptionPaywall } from '@/components/GlobalSubscriptionPaywall';
import { SubscriptionInitializer } from '@/components/SubscriptionInitializer';
import { SubscriptionPaymentStatusModal } from '@/components/SubscriptionPaymentStatusModal';
import { queryClient } from '@/lib/queryClient';

type ProvidersProps = {
  children: ReactNode;
  dehydratedState?: DehydratedState;
};

export default function Providers({ children, dehydratedState }: ProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <HydrationBoundary state={dehydratedState}>
        <SubscriptionInitializer />
        {children}

        <GlobalConfirmationModal />
        <GlobalSubscriptionPaywall />
        <SubscriptionPaymentStatusModal />

        {process.env.NEXT_PUBLIC_ENVIRONMENT === 'dev' && (
          <div className='text-[14rem]'>
            <ReactQueryDevtools initialIsOpen={false} />
          </div>
        )}
      </HydrationBoundary>
    </QueryClientProvider>
  );
}
