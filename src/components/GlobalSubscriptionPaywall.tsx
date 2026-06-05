'use client';

import React from 'react';
import { useMediaQuery } from 'usehooks-ts';

import { Dialog, DialogContent, DialogTitle, DialogDescription } from './ui/dialog';
import { PricesModal } from './PricesModal';
import { PricingPlansView } from './PricingPlansView';
import { PromoPromptModal } from './PromoPromptModal';
import { useSubscriptionStore } from '@/stores/subscriptionStore';
import { usePricingPlans } from '@/hooks/usePricingPlans';
import { useCustomTranslations } from '@/hooks/useCustomTranslations';
import { withHydrationGuard } from '@/hooks/useHasMounted';

const GlobalSubscriptionPaywallComponent = () => {
  const isOpen = useSubscriptionStore(state => state.isPaywallOpen);
  const setPaywallOpen = useSubscriptionStore(state => state.setPaywallOpen);
  const isMobile = useMediaQuery('(max-width: 767px)');

  const { activePlans, status } = usePricingPlans();
  const { t } = useCustomTranslations('pricesModal');
  const premiumIncludes = t.raw('premium.includes') as string[];

  const [isPromoModalOpen, setPromoModalOpen] = React.useState(false);
  const [selectedPlanId, setSelectedPlanId] = React.useState<string | null>(null);
  const [planDiscounts, setPlanDiscounts] = React.useState<Record<string, { amount: number; currency: string }>>({});
  const [promoMessage, setPromoMessage] = React.useState<string | null>(null);
  const [promoError, setPromoError] = React.useState<string | null>(null);

  const handlePlanSelect = (planId: string) => {
    setSelectedPlanId(planId);
    setPromoModalOpen(true);
    setPaywallOpen(false);
    setPromoMessage(null);
    setPromoError(null);
  };

  const handlePromoModalClose = () => {
    setPromoModalOpen(false);
    setSelectedPlanId(null);
  };

  return (
    <>
      {isMobile && isOpen ? (
        <div className='fixed inset-0 z-[8889] bg-white'>
          <PricingPlansView
            premiumIncludes={premiumIncludes}
            activePlans={activePlans}
            status={status}
            onPlanSelect={handlePlanSelect}
            planDiscounts={planDiscounts}
            promoMessage={promoMessage}
            promoError={promoError}
            onBack={() => setPaywallOpen(false)}
          />
        </div>
      ) : null}

      {!isMobile ? (
        <Dialog
          open={isOpen}
          onOpenChange={open => {
            setPaywallOpen(open);
            if (open) {
              setPromoModalOpen(false);
              setPromoMessage(null);
              setPromoError(null);
            }
          }}
        >
          <DialogContent className='fixed left-1/2 top-1/2 flex h-auto w-[1280rem] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center [&_button[data-radix-dialog-close]]:hidden'>
            <DialogTitle className='sr-only'>{t('mobileHeader.choosePlan', { defaultValue: 'Choose your plan' })}</DialogTitle>
            <DialogDescription className='sr-only'>{t('mobileHeader.choosePlanSubtitle', { defaultValue: 'Upgrade to get full access' })}</DialogDescription>
            <PricesModal onSelectPlan={handlePlanSelect} promoMessage={promoMessage} promoError={promoError} planDiscounts={planDiscounts} />
          </DialogContent>
        </Dialog>
      ) : null}

      <PromoPromptModal
        open={isPromoModalOpen}
        planId={selectedPlanId}
        onClose={handlePromoModalClose}
        onBackToPlans={() => {
          handlePromoModalClose();
          setPaywallOpen(true);
        }}
        onDiscountUpdate={(planId, info) => setPlanDiscounts(prev => ({ ...prev, [planId]: info }))}
        onSuccessMessage={setPromoMessage}
        onErrorMessage={setPromoError}
      />
    </>
  );
};

export const GlobalSubscriptionPaywall = withHydrationGuard(GlobalSubscriptionPaywallComponent);
