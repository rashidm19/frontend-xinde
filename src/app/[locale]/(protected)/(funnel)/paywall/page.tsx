'use client';

import { useState } from 'react';

import { PricesModal } from '@/components/PricesModal';
import { PricingPlansView } from '@/components/PricingPlansView';
import { PromoPromptModal } from '@/components/PromoPromptModal';
import { usePricingPlans } from '@/hooks/usePricingPlans';
import { useCustomTranslations } from '@/hooks/useCustomTranslations';

// Hard-wall paywall. Plans are server-prefetched by the sibling layout, so the
// full plan set is present on first paint. The desktop/mobile split is done with
// CSS (`tablet:` = 768px, matching the old `max-width:767px` boundary) instead of
// a JS media query, so there is no hydration guard, no blank frame, and no
// desktop→mobile swap. No Dialog: the wall is a normal centered page (no overlay,
// no dismiss affordance).
export default function PaywallPage() {
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

  return (
    <>
      {/* Desktop (≥768px): centered card grid, no modal chrome */}
      <div className='hidden min-h-dvh w-full items-center justify-center overflow-auto bg-gradient-to-b from-white via-white to-slate-50 p-[40rem] tablet:flex'>
        <PricesModal showClose={false} onSelectPlan={handlePlanSelect} promoMessage={promoMessage} promoError={promoError} planDiscounts={planDiscounts} />
      </div>

      {/* Mobile (<768px): full-screen stacked view */}
      <div className='tablet:hidden'>
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
      </div>

      <PromoPromptModal
        open={isPromoModalOpen}
        planId={selectedPlanId}
        onClose={handlePromoClose}
        onBackToPlans={handlePromoClose}
        onDiscountUpdate={(planId, info) => setPlanDiscounts(prev => ({ ...prev, [planId]: info }))}
        onSuccessMessage={setPromoMessage}
        onErrorMessage={setPromoError}
      />
    </>
  );
}
