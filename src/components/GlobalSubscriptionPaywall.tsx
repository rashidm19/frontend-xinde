'use client';

import { Dialog, DialogContent } from './ui/dialog';
import { PricesModal } from './PricesModal';
import { PromoPromptModal } from './PromoPromptModal';

import React from 'react';
import { useSubscriptionStore } from '@/stores/subscriptionStore';
import { useMediaQuery } from 'usehooks-ts';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import Router from 'next/router';
import NProgress from 'nprogress';

export const GlobalSubscriptionPaywall = () => {
  const isOpen = useSubscriptionStore(state => state.isPaywallOpen);
  const setPaywallOpen = useSubscriptionStore(state => state.setPaywallOpen);

  const [isPromoModalOpen, setPromoModalOpen] = React.useState(false);
  const [selectedPlanId, setSelectedPlanId] = React.useState<string | null>(null);
  const [planDiscounts, setPlanDiscounts] = React.useState<Record<string, { amount: number; currency: string }>>({});
  const [promoError, setPromoError] = React.useState<string | null>(null);
  const isMobile = useMediaQuery('(max-width: 767px)');
  const router = useRouter();
  const locale = useLocale();

  React.useEffect(() => {
    const handleDone = () => {
      NProgress.done();
    };

    Router.events.on('routeChangeComplete', handleDone);
    Router.events.on('routeChangeError', handleDone);

    return () => {
      Router.events.off('routeChangeComplete', handleDone);
      Router.events.off('routeChangeError', handleDone);
    };
  }, []);

  React.useEffect(() => {
    if (isOpen && isMobile) {
      setPaywallOpen(false);
      NProgress.start();
      router.push(`/${locale}/pricing`);
    }
  }, [isOpen, isMobile, locale, router, setPaywallOpen]);

  const handlePlanSelect = (planId: string) => {
    setSelectedPlanId(planId);
    setPromoModalOpen(true);
    setPaywallOpen(false);
    setPromoError(null);
  };

  const handlePromoModalClose = () => {
    setPromoModalOpen(false);
    setSelectedPlanId(null);
  };

  return (
    <>
      {!isMobile ? (
        <Dialog
          open={isOpen}
          onOpenChange={open => {
            setPaywallOpen(open);

            if (open) {
              setPromoModalOpen(false);
              setPromoError(null);
            }
          }}
        >
          <DialogContent className='fixed left-1/2 top-1/2 flex h-auto w-[1280rem] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center [&_button[data-radix-dialog-close]]:hidden'>
            <PricesModal onSelectPlan={handlePlanSelect} promoError={promoError} planDiscounts={planDiscounts} />
          </DialogContent>
        </Dialog>
      ) : null}

      {!isMobile ? (
        <PromoPromptModal
          open={isPromoModalOpen}
          planId={selectedPlanId}
          onClose={handlePromoModalClose}
          onBackToPlans={() => {
            handlePromoModalClose();
            setPaywallOpen(true);
          }}
          onDiscountUpdate={(planId, info) => setPlanDiscounts(prev => ({ ...prev, [planId]: info }))}
          onErrorMessage={setPromoError}
        />
      ) : null}
    </>
  );
};
