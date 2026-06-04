'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCustomTranslations } from '@/hooks/useCustomTranslations';
import { PromoPromptModal } from '@/components/PromoPromptModal';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { PricesModal } from '@/components/PricesModal';
import { usePricingPlans } from '@/hooks/usePricingPlans';
import { useMediaQuery } from 'usehooks-ts';
import { PricingPlansView } from '@/components/PricingPlansView';

interface PlanDiscounts {
  [planId: string]: { amount: number; currency: string };
}

export default function PricingPage() {
  const router = useRouter();
  const isMobile = useMediaQuery('(max-width: 767px)', { initializeWithValue: false });
  const { t } = useCustomTranslations('pricesModal');
  const demoIncludes: string[] = t.raw('demo.includes');
  const premiumIncludes: string[] = t.raw('premium.includes');
  const { activePlans, status } = usePricingPlans();

  const [isPromoModalOpen, setPromoModalOpen] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [planDiscounts, setPlanDiscounts] = useState<PlanDiscounts>({});
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

  if (!isMobile) {
    return (
      <>
        <Dialog
          open
          onOpenChange={open => {
            if (!open) {
              router.back();
            }
          }}
        >
          <DialogContent className='fixed left-1/2 top-1/2 flex h-auto w-[1280rem] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center backdrop-brightness-90'>
            <PricesModal onSelectPlan={handlePlanSelect} promoMessage={promoMessage} promoError={promoError} planDiscounts={planDiscounts} />
          </DialogContent>
        </Dialog>
        {promoModal}
      </>
    );
  }

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
        onBack={() => router.back()}
      />
      {promoModal}
    </>
  );
}
