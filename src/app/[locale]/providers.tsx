'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import { GlobalConfirmationModal } from '@/components/GlobalConfirmationModal';
import { GlobalSubscriptionPaywall } from '@/components/GlobalSubscriptionPaywall';
import { SubscriptionInitializer } from '@/components/SubscriptionInitializer';
import { SubscriptionPaymentStatusModal } from '@/components/SubscriptionPaymentStatusModal';
import { queryClient } from '@/lib/queryClient';

export default function Providers({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <QueryClientProvider client={queryClient}>
      <SubscriptionInitializer />
      {children}

      <GlobalConfirmationModal />
      <GlobalSubscriptionPaywall />
      <SubscriptionPaymentStatusModal />

      {process.env.NEXT_PUBLIC_ENVIROMENT === 'dev' && (
        <div className='text-[14rem]'>
          <ReactQueryDevtools initialIsOpen={false} />
        </div>
      )}
    </QueryClientProvider>
  );
}
