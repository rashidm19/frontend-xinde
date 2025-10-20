'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { refreshSubscriptionAndBalance } from '@/stores/subscriptionStore';
import { useCustomTranslations } from '@/hooks/useCustomTranslations';

export const SubscriptionPaymentStatusModal = () => {
  const searchParams = useSearchParams();
  const { t: tPrices, tActions } = useCustomTranslations('pricesModal');
  const [isOpen, setIsOpen] = React.useState(false);
  const [status, setStatus] = React.useState<'success' | 'failure' | null>(null);

  React.useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const statusParam = searchParams?.get('subscribePaymentStatus');
    if (!statusParam) {
      return;
    }

    const normalizedStatus = statusParam === 'true' || statusParam === 'success' ? 'success' : 'failure';
    setStatus(normalizedStatus);
    setIsOpen(true);

    const url = new URL(window.location.href);
    url.searchParams.delete('subscribePaymentStatus');
    window.history.replaceState(null, '', url.toString());

    if (normalizedStatus === 'success') {
      refreshSubscriptionAndBalance().catch(() => {
        // Background refresh; errors will be handled elsewhere by the app.
      });
    }
  }, [searchParams]);

  const handleOpenChange = React.useCallback(
    (open: boolean) => {
      if (!open) {
        setIsOpen(false);
        setStatus(null);
      }
    },
    []
  );

  if (!status) {
    return null;
  }

  const isSuccess = status === 'success';
  const title = isSuccess ? tPrices('promo.paymentSuccessTitle') : tPrices('promo.paymentFailureTitle');
  const description = isSuccess ? tPrices('promo.paymentSuccess') : tPrices('promo.paymentFailure');

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className='fixed -translate-x-1/2 -translate-y-1/2 left-[50%] top-[50%] flex w-[90vw] max-w-[420rem] flex-col gap-y-[16rem] rounded-[24rem] bg-white p-[32rem] text-center shadow-lg'>
        <DialogHeader>
          <DialogTitle className='text-[20rem] font-semibold'>{title}</DialogTitle>
          <DialogDescription className='text-[16rem] leading-tight text-d-black/80'>{description}</DialogDescription>
        </DialogHeader>
        <button
          type='button'
          onClick={() => handleOpenChange(false)}
          className='mx-auto mt-[8rem] flex h-[48rem] w-[180rem] items-center justify-center rounded-full bg-d-green text-[16rem] font-semibold text-black hover:bg-d-green/80'
        >
          {tActions('ok')}
        </button>
      </DialogContent>
    </Dialog>
  );
};
