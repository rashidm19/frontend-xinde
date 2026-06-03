'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';

import { BottomSheet, BottomSheetContent } from '@/components/ui/bottom-sheet';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { refreshSubscriptionAndBalance } from '@/stores/subscriptionStore';
import { useCustomTranslations } from '@/hooks/useCustomTranslations';
import { useMediaQuery } from 'usehooks-ts';
import { withHydrationGuard } from '@/hooks/useHasMounted';
import { BottomSheetHeader } from '@/components/mobile/MobilePageHeader';
import { GET_orders_id } from '@/api/GET_orders_id';

const ORDER_ID_KEY = 'sb_checkout_order_id';
const POLL_INTERVAL_MS = 1500;
const POLL_MAX_ATTEMPTS = 12;

const delay = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

async function pollOrderPaid(orderId: string): Promise<void> {
  for (let attempt = 0; attempt < POLL_MAX_ATTEMPTS; attempt++) {
    try {
      const order = await GET_orders_id(orderId);
      if (order.status === 'paid') return;
    } catch {
      // transient; keep polling
    }
    await delay(POLL_INTERVAL_MS);
  }
}

const SubscriptionPaymentStatusModalComponent = () => {
  const searchParams = useSearchParams();
  const { t: tPrices, tActions } = useCustomTranslations('pricesModal');
  const [isOpen, setIsOpen] = React.useState(false);
  const [status, setStatus] = React.useState<'success' | 'failure' | null>(null);
  const [isActivating, setIsActivating] = React.useState(false);
  const isMobile = useMediaQuery('(max-width: 767px)');

  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    const statusParam = searchParams?.get('subscribePaymentStatus');
    if (!statusParam) return;

    const normalizedStatus = statusParam === 'true' || statusParam === 'success' ? 'success' : 'failure';
    setStatus(normalizedStatus);
    setIsOpen(true);

    const url = new URL(window.location.href);
    url.searchParams.delete('subscribePaymentStatus');
    window.history.replaceState(null, '', url.toString());

    if (normalizedStatus !== 'success') return;

    let cancelled = false;
    const orderId = window.sessionStorage.getItem(ORDER_ID_KEY);

    (async () => {
      setIsActivating(true);
      try {
        if (orderId) await pollOrderPaid(orderId);
        if (!cancelled) await refreshSubscriptionAndBalance();
      } catch {
        // refresh errors are non-fatal; the (app) gate re-resolves on next nav
      } finally {
        window.sessionStorage.removeItem(ORDER_ID_KEY);
        if (!cancelled) setIsActivating(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [searchParams]);

  const handleOpenChange = React.useCallback((open: boolean) => {
    if (!open) {
      setIsOpen(false);
      setStatus(null);
    }
  }, []);

  if (!status) return null;

  const isSuccess = status === 'success';
  const title = isActivating
    ? tPrices('promo.activatingTitle')
    : isSuccess
      ? tPrices('promo.paymentSuccessTitle')
      : tPrices('promo.paymentFailureTitle');
  const description = isActivating
    ? tPrices('promo.activating')
    : isSuccess
      ? tPrices('promo.paymentSuccess')
      : tPrices('promo.paymentFailure');

  const confirmButton = isActivating ? null : (
    <button
      type='button'
      onClick={() => handleOpenChange(false)}
      className='mx-auto mt-[8rem] flex h-[48rem] w-[180rem] items-center justify-center rounded-full bg-d-green text-[16rem] font-semibold text-black transition hover:bg-d-green/80'
    >
      {tActions('ok')}
    </button>
  );

  if (isMobile) {
    return (
      <BottomSheet open={isOpen} onOpenChange={handleOpenChange}>
        <BottomSheetContent aria-labelledby='subscription-payment-status-title'>
          <div className='flex min-h-0 flex-1 flex-col overflow-hidden'>
            <BottomSheetHeader title={title} subtitle={description} closeLabel={tActions('ok')} onClose={() => handleOpenChange(false)} />
            <ScrollArea className='flex-1 px-[20rem]'>
              <div className='pb-[24rem] text-center'>
                <p className='text-[15rem] leading-tight text-d-black/80'>{description}</p>
              </div>
            </ScrollArea>
            <div className='border-t border-gray-100 bg-white/95 px-[20rem] pb-[calc(16rem+env(safe-area-inset-bottom))] pt-[16rem] shadow-[0_-4px_16px_rgba(15,23,42,0.08)]'>
              {confirmButton}
            </div>
          </div>
        </BottomSheetContent>
      </BottomSheet>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className='fixed left-[50%] top-[50%] flex w-[90vw] max-w-[420rem] -translate-x-1/2 -translate-y-1/2 flex-col gap-y-[16rem] rounded-[24rem] bg-white p-[32rem] text-center shadow-lg'>
        <DialogHeader>
          <DialogTitle className='text-[20rem] font-semibold'>{title}</DialogTitle>
          <DialogDescription className='text-[16rem] leading-tight text-d-black/80'>{description}</DialogDescription>
        </DialogHeader>
        {confirmButton}
      </DialogContent>
    </Dialog>
  );
};

export const SubscriptionPaymentStatusModal = withHydrationGuard(SubscriptionPaymentStatusModalComponent);
