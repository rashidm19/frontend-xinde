'use client';

import { HydrationBoundary, QueryClientProvider, type DehydratedState } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useEffect, type ReactNode } from 'react';

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
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') {
      return;
    }

    const flag = '__studybox_query_client_provider__';
    const globalScope = globalThis as Record<string, unknown>;

    if (globalScope[flag]) {
      console.warn('[Providers] Multiple QueryClientProvider instances detected. Ensure Providers is mounted once.');
    } else {
      globalScope[flag] = true;
    }

    return () => {
      if (globalScope[flag]) {
        delete globalScope[flag];
      }
    };
  }, []);

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
