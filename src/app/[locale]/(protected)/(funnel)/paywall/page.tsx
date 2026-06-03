'use client';

import React, { useState } from 'react';
import { useMediaQuery } from 'usehooks-ts';

import { Dialog, DialogContent } from '@/components/ui/dialog';
import { PricesModal } from '@/components/PricesModal';
import { PricingPlansView } from '@/components/PricingPlansView';
import { PromoPromptModal } from '@/components/PromoPromptModal';
import { usePricingPlans } from '@/hooks/usePricingPlans';
import { useCustomTranslations } from '@/hooks/useCustomTranslations';
import { withHydrationGuard } from '@/hooks/useHasMounted';

const PaywallPageComponent = () => {
  const isMobile = useMediaQuery('(max-width: 767px)', { initializeWithValue: false });
  const { activePlans, status } = usePricingPlans();
  const { t } = useCustomTranslations('pricesModal');
  const demoIncludes = t.raw('demo.includes') as string[];
  const premiumIncludes = t.raw('premium.includes') as string[];

  const [isPromoModalOpen, setPromoModalOpen] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [planDiscounts, setPlanDiscounts] = useState<Record<string, { amount: number; currency: string }>>({});
  const [promoMessage, setPromoMessage] = useState<string | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);

  const handlePlanSelect = (planId: string) => {
    setSelectedPlanId(planId);
    setPromoModalOpen(true);
    setPromoMessage(null);
    setPromoError(null);
  };

  const handlePromoClose = () => {
    setPromoModalOpen(false);
    setSelectedPlanId(null);
  };

  const promoModal = (
    <PromoPromptModal
      open={isPromoModalOpen}
      planId={selectedPlanId}
      onClose={handlePromoClose}
      onBackToPlans={handlePromoClose}
      onDiscountUpdate={(planId, info) => setPlanDiscounts(prev => ({ ...prev, [planId]: info }))}
      onSuccessMessage={setPromoMessage}
      onErrorMessage={setPromoError}
    />
  );

  if (isMobile === undefined) return null;

  if (isMobile) {
    return (
      <>
        <PricingPlansView
          demoIncludes={demoIncludes}
          premiumIncludes={premiumIncludes}
          activePlans={activePlans}
          status={status}
          onPlanSelect={handlePlanSelect}
          planDiscounts={planDiscounts}
          promoMessage={promoMessage}
          promoError={promoError}
        />
        {promoModal}
      </>
    );
  }

  return (
    <>
      <Dialog open>
        <DialogContent className='fixed left-1/2 top-1/2 flex h-auto w-[1280rem] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center [&>button]:hidden'>
          <PricesModal showClose={false} onSelectPlan={handlePlanSelect} promoMessage={promoMessage} promoError={promoError} planDiscounts={planDiscounts} />
        </DialogContent>
      </Dialog>
      {promoModal}
    </>
  );
};

const PaywallPage = withHydrationGuard(PaywallPageComponent);

export default PaywallPage;
