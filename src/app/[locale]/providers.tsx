'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import { GlobalConfirmationModal } from '@/components/GlobalConfirmationModal';

const queryClient = new QueryClient();

export default function Providers({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}

      <GlobalConfirmationModal />

      {process.env.NEXT_PUBLIC_ENVIROMENT === 'dev' && (
        <div className='text-[14rem]'>
          <ReactQueryDevtools initialIsOpen={false} />
        </div>
      )}
    </QueryClientProvider>
  );
}
