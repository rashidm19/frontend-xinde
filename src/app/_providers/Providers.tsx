'use client';

import { type DehydratedState, HydrationBoundary, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { type ReactNode, useEffect } from 'react';

import { GlobalConfirmationModal } from '@/components/GlobalConfirmationModal';
import { GlobalSubscriptionPaywall } from '@/components/GlobalSubscriptionPaywall';
import { SubscriptionInitializer } from '@/components/SubscriptionInitializer';
import { TelemetryInitializer } from '@/components/TelemetryInitializer';
import { SubscriptionPaymentStatusModal } from '@/components/SubscriptionPaymentStatusModal';
import { UiModalManager } from '@/components/modals/UiModalManager';
import { queryClient } from '@/lib/queryClient';
import { IS_PROD_ENV } from '@/lib/config';

type ProvidersProps = {
  children: ReactNode;
  dehydratedState?: DehydratedState;
};

export default function Providers({ children, dehydratedState }: ProvidersProps) {
  useEffect(() => {
    if (IS_PROD_ENV) {
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
        <TelemetryInitializer />
        <SubscriptionInitializer />
        {children}

        <GlobalConfirmationModal />
        <GlobalSubscriptionPaywall />
        <SubscriptionPaymentStatusModal />
        <UiModalManager />

        {!IS_PROD_ENV && (
          <div className='text-[14rem]'>
            <ReactQueryDevtools initialIsOpen={false} />
          </div>
        )}
      </HydrationBoundary>
    </QueryClientProvider>
  );
}
