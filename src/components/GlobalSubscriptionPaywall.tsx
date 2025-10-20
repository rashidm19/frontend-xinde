'use client';

import { Dialog, DialogContent } from './ui/dialog';
import { PricesModal } from './PricesModal';
import { PromoPromptModal } from './PromoPromptModal';

import React from 'react';
import { useSubscriptionStore } from '@/stores/subscriptionStore';

export const GlobalSubscriptionPaywall = () => {
  const isOpen = useSubscriptionStore(state => state.isPaywallOpen);
  const setPaywallOpen = useSubscriptionStore(state => state.setPaywallOpen);
  const fetchBalance = useSubscriptionStore(state => state.fetchBalance);

  const [isPromoModalOpen, setPromoModalOpen] = React.useState(false);
  const [selectedPlanId, setSelectedPlanId] = React.useState<string | null>(null);
  const [planDiscounts, setPlanDiscounts] = React.useState<Record<string, { amount: number; currency: string }>>({});
  const [promoMessage, setPromoMessage] = React.useState<string | null>(null);
  const [promoError, setPromoError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!isOpen) {
      return;
    }

    fetchBalance(true).catch(() => {
      // handled by store
    });
  }, [fetchBalance, isOpen]);

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

  const handleSuccessMessage = (message: string | null) => {
    setPromoMessage(message);
  };

  return (
    <>
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
          <PricesModal onSelectPlan={handlePlanSelect} promoMessage={promoMessage} promoError={promoError} planDiscounts={planDiscounts} />
      </DialogContent>
      </Dialog>

      <PromoPromptModal
        open={isPromoModalOpen}
        planId={selectedPlanId}
        onClose={handlePromoModalClose}
        onBackToPlans={() => {
          handlePromoModalClose();
          setPaywallOpen(true);
        }}
        onDiscountUpdate={(planId, info) => setPlanDiscounts(prev => ({ ...prev, [planId]: info }))}
        onSuccessMessage={handleSuccessMessage}
        onErrorMessage={setPromoError}
      />
    </>
  );
};
