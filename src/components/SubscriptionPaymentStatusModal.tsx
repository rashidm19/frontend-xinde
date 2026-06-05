'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { BottomSheet, BottomSheetContent } from '@/components/ui/bottom-sheet';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { refreshSubscriptionAndBalance, useSubscriptionStore } from '@/stores/subscriptionStore';
import { sanitizeNextPath } from '@/lib/auth/safeRedirect';
import { useCustomTranslations } from '@/hooks/useCustomTranslations';
import { useMediaQuery } from 'usehooks-ts';
import { withHydrationGuard } from '@/hooks/useHasMounted';
import { BottomSheetHeader } from '@/components/mobile/MobilePageHeader';
import { GET_orders_id } from '@/api/GET_orders_id';

const ORDER_ID_KEY = 'sb_checkout_order_id';
const POLL_INTERVAL_MS = 1500;
const POLL_MAX_ATTEMPTS = 12;

const delay = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

async function pollOrderPaid(orderId: string): Promise<boolean> {
  for (let attempt = 0; attempt < POLL_MAX_ATTEMPTS; attempt++) {
    try {
      const order = await GET_orders_id(orderId);
      if (order.status === 'paid') return true;
    } catch {
      // transient; keep polling
    }
    await delay(POLL_INTERVAL_MS);
  }
  return false;
}

const SubscriptionPaymentStatusModalComponent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { t: tPrices, tActions } = useCustomTranslations('pricesModal');
  const [isOpen, setIsOpen] = React.useState(false);
  const [status, setStatus] = React.useState<'success' | 'failure' | null>(null);
  const [isActivating, setIsActivating] = React.useState(false);
  const isMobile = useMediaQuery('(max-width: 767px)');

  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    // The payment-status param normally arrives top-level — EPay returns to the real landing page
    // (app root → /{locale}/dashboard?subscribePaymentStatus=true). But when the postLink webhook
    // lags, the (app) funnel gate bounces the not-yet-entitled payer to the hard-wall /paywall and
    // the param is preserved INSIDE the encoded `next` (sanitizeNextPath keeps the query string).
    // Read it from both so the gated bounce self-heals instead of stranding the user on the wall.
    const topLevelStatus = searchParams?.get('subscribePaymentStatus') ?? null;
    const nextParam = searchParams?.get('next') ?? null;
    const nestedStatus = nextParam ? new URLSearchParams(nextParam.split('?')[1] ?? '').get('subscribePaymentStatus') : null;
    const statusParam = topLevelStatus ?? nestedStatus;

    // True only when the sole signal is the one buried in `next` — i.e. we're mid-bounce on /paywall.
    const cameFromNext = !topLevelStatus && !!nestedStatus;
    const hasStashedOrder = Boolean(window.sessionStorage.getItem(ORDER_ID_KEY));

    // Nothing to do unless a status arrived (top-level or via `next`) or a checkout is in flight.
    if (!statusParam && !hasStashedOrder) return;

    // Strip ONLY the top-level param (reload-safety). Never touch `next` — it carries the
    // destination the (funnel) gate redirects to once we're entitled.
    if (topLevelStatus) {
      const url = new URL(window.location.href);
      url.searchParams.delete('subscribePaymentStatus');
      window.history.replaceState(null, '', url.toString());
    }

    // Consume the stashed orderId exactly once — clear it on EVERY path (success, failure, stale),
    // so a failed/abandoned payment can't leave an id that a later 100%-promo redemption (which
    // sets the success param but never re-stashes an id) would poll for ~18s.
    const orderId = window.sessionStorage.getItem(ORDER_ID_KEY);
    window.sessionStorage.removeItem(ORDER_ID_KEY);

    // Explicit failure → show it, no poll, no navigation (on /paywall the user stays to retry).
    if (statusParam === 'false' || statusParam === 'failure') {
      setStatus('failure');
      setIsOpen(true);
      return;
    }

    const hasExplicitSuccess = statusParam === 'true' || statusParam === 'success';

    // Param-driven success: surface the modal immediately (prior UX). The key-only backstop stays
    // silent until the poll actually confirms `paid` — we don't have EPay's word that it succeeded.
    if (hasExplicitSuccess) {
      setStatus('success');
      setIsOpen(true);
    }

    let cancelled = false;

    (async () => {
      setIsActivating(true);
      try {
        const paid = orderId ? await pollOrderPaid(orderId) : hasExplicitSuccess;
        if (cancelled) return;

        if (hasExplicitSuccess || paid) {
          await refreshSubscriptionAndBalance();
          if (cancelled) return;

          // Backstop confirmed paid → now reveal success.
          if (!hasExplicitSuccess) {
            setStatus('success');
            setIsOpen(true);
          }

          // If we were bounced to /paywall before the webhook landed, leave the wall — but ONLY once
          // entitlement is actually live. Gating on the real store state (not the success param)
          // prevents a /paywall<->destination bounce loop if a "success" return never materialises
          // into entitlement. router.refresh() alone re-renders without navigating (a layout
          // redirect during a refresh doesn't reliably navigate — verified against the live funnel),
          // so push to the gate-provided `next`; the (app) gate re-validates on arrival.
          if (cameFromNext) {
            const s = useSubscriptionStore.getState();
            const entitled = s.hasActiveSubscription || s.hasPracticeCredits || s.hasMockCredits;
            if (entitled) {
              const locale = window.location.pathname.split('/')[1] || 'en';
              const safe = sanitizeNextPath(nextParam, locale) ?? `/${locale}/dashboard`;
              // Settle to the success state now (the global modal keeps showing it across the soft
              // nav) and strip the one-shot status param from the destination so it doesn't re-fire
              // this modal — re-firing would orphan `isActivating` on a cancelled instance.
              const target = new URL(safe, window.location.origin);
              target.searchParams.delete('subscribePaymentStatus');
              setIsActivating(false);
              router.replace(`${target.pathname}${target.search}${target.hash}`);
            }
          }
        }
        // else: key-only backstop that never confirmed paid → stay silent; the (app) gate
        // re-resolves on the next navigation.
      } catch {
        // refresh/poll errors are non-fatal; the (app) gate re-resolves on next nav.
      } finally {
        // Always clear the activating flag — the modal is global and never unmounts, so a
        // post-cancel setState is safe. Guarding this with `!cancelled` orphaned "Activating…"
        // forever when the top-level param-strip (history.replaceState) triggered a spurious
        // effect re-run that cancelled this instance before the flag could reset.
        setIsActivating(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [searchParams, router]);

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
