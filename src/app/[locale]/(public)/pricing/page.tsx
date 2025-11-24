'use client';

import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useCustomTranslations } from '@/hooks/useCustomTranslations';
import { normalizeInterval } from '@/lib/pricing';
import { PromoPromptModal } from '@/components/PromoPromptModal';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { PricesModal } from '@/components/PricesModal';
import { usePricingPlans } from '@/hooks/usePricingPlans';
import { useMediaQuery } from 'usehooks-ts';
import { withHydrationGuard } from '@/hooks/useHasMounted';
import type { ISubscriptionPlan } from '@/types/Billing';
import { MobilePageHeader } from '@/components/mobile/MobilePageHeader';

interface PlanDiscounts {
  [planId: string]: { amount: number; currency: string };
}

const CURRENCY_FORMATTER = new Intl.NumberFormat('ru-RU', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

const formatCurrency = (value: number, currency: string) => `${CURRENCY_FORMATTER.format(value)} ${currency}`;

const getCardBackground = (index: number) => {
  if (index === 0) {
    return 'bg-gradient-to-br from-d-violet/15 via-white to-d-violet/5 border-d-violet/30';
  }

  if (index === 1) {
    return 'bg-gradient-to-br from-d-blue/12 via-white to-d-blue/4 border-d-blue/25';
  }

  return 'bg-white border-slate-200';
};

const PricingPageComponent = () => {
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

  if (isMobile === undefined) {
    return null;
  }

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
      <PricingMobileView
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
};

interface PricingMobileViewProps {
  demoIncludes: string[];
  premiumIncludes: string[];
  activePlans: ISubscriptionPlan[];
  status: 'pending' | 'error' | 'success';
  onPlanSelect: (planId: string) => void;
  planDiscounts: PlanDiscounts;
  promoMessage: string | null;
  promoError: string | null;
  onBack: () => void;
}

const PricingMobileView = ({
  demoIncludes,
  premiumIncludes,
  activePlans,
  status,
  onPlanSelect,
  planDiscounts,
  promoMessage,
  promoError,
  onBack,
}: PricingMobileViewProps) => {
  const { t, tActions, tImgAlts } = useCustomTranslations('pricesModal');

  const getIntervalLabel = (interval?: string) => {
    const intervalKey = normalizeInterval(interval);
    const translationKey = `billing.interval.${intervalKey}`;
    const translated = t(translationKey, { defaultValue: intervalKey });

    return translated || intervalKey;
  };

  const titleText = t('mobileHeader.choosePlan', { defaultValue: 'Choose your plan' });
  const subtitleText = t('mobileHeader.choosePlanSubtitle', { defaultValue: 'Upgrade to get full access' });

  const planCards = useMemo(
    () =>
      activePlans.map((plan, index) => {
        const planFeatures = plan.features && plan.features.length ? plan.features : premiumIncludes;
        const priceLabel = `${CURRENCY_FORMATTER.format(plan.price)} ${plan.currency}`;
        const intervalLabel = getIntervalLabel(plan.interval);
        const discount = planDiscounts[String(plan.id)];

        return (
          <article
            key={plan.id}
            className={`relative rounded-[24rem] border p-[24rem] shadow-[0_18rem_40rem_-32rem_rgba(15,23,42,0.45)] ${getCardBackground(index)} transition-transform hover:-translate-y-[2rem]`}
          >
            <div className='flex flex-col gap-[16rem]'>
              <header className='flex flex-col gap-[6rem]'>
                <h2 className='text-[20rem] font-semibold text-slate-900'>{plan.name}</h2>
                <div className='text-[28rem] font-bold text-slate-900'>
                  {priceLabel}
                  <span className='ml-[4rem] text-[14rem] font-medium text-slate-500'>/ {intervalLabel}</span>
                </div>
              </header>

              <ul className='flex flex-col gap-[10rem] text-[14rem] text-slate-600'>
                {planFeatures.map((feature, featureIndex) => (
                  <li key={`${plan.id}-${featureIndex}`} className='flex items-start gap-[12rem]'>
                    <img src='/images/icon_check.svg' alt={tImgAlts('check')} className='mt-[3rem] size-[16rem]' />
                    <span className='flex-1 text-[14rem] leading-[130%] text-slate-700'>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className='mt-[20rem] flex flex-col gap-[12rem]'>
              <button
                type='button'
                onClick={() => onPlanSelect(String(plan.id))}
                className='h-[48rem] rounded-full bg-d-green text-[16rem] font-semibold text-black transition hover:bg-d-green/90'
              >
                {tActions('upgrade')}
              </button>
              {discount ? (
                <p className='text-[13rem] font-medium text-slate-600'>{t('promo.total', { amount: formatCurrency(discount.amount, discount.currency) })}</p>
              ) : null}
            </div>
          </article>
        );
      }),
    [activePlans, planDiscounts, premiumIncludes, t, tActions, tImgAlts, onPlanSelect]
  );

  return (
    <motion.main
      className='flex min-h-dvh flex-col bg-gradient-to-b from-white via-white to-slate-50'
      initial={{ x: '100%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '-20%', opacity: 0 }}
      transition={{ type: 'spring', stiffness: 260, damping: 30 }}
    >
      <MobilePageHeader title={titleText} subtitle={subtitleText} back backLabel={tActions('back')} onBack={onBack} />

      {(promoMessage || promoError) && (
        <div className='px-[20rem] pt-[12rem]'>
          {promoMessage ? <p className='rounded-[16rem] bg-d-green/10 px-[16rem] py-[10rem] text-[13rem] font-medium text-d-green'>{promoMessage}</p> : null}
          {promoError ? <p className='mt-[12rem] rounded-[16rem] bg-d-red/10 px-[16rem] py-[10rem] text-[13rem] font-medium text-d-red'>{promoError}</p> : null}
        </div>
      )}

      <div className='flex-1 overflow-y-auto px-[20rem] pb-[calc(120rem+env(safe-area-inset-bottom))] pt-[20rem]'>
        <section className='flex flex-col gap-[20rem]'>
          <article className='rounded-[24rem] border border-slate-200 bg-white p-[24rem] shadow-[0_18rem_40rem_-32rem_rgba(15,23,42,0.1)]'>
            <header className='flex flex-col gap-[6rem]'>
              <h2 className='text-[20rem] font-semibold text-slate-900'>{t('demo.title')}</h2>
              <p className='text-[16rem] font-medium text-slate-700'>{t('demo.price')}</p>
            </header>
            <ul className='mt-[16rem] flex flex-col gap-[10rem]'>
              {demoIncludes.map((item, index) => (
                <li key={`demo-${index}`} className='flex items-start gap-[12rem]'>
                  <img src='/images/icon_check.svg' alt={tImgAlts('check')} className='mt-[3rem] size-[16rem]' />
                  <span className='flex-1 text-[14rem] leading-[130%] text-slate-700'>{item}</span>
                </li>
              ))}
            </ul>
            <p className='mt-[16rem] text-[13rem] text-slate-500'>{t('demo.about')}</p>
          </article>

          {status === 'success' ? planCards : null}

          {status === 'pending' ? (
            <div className='space-y-[16rem]'>
              {[0, 1].map(index => (
                <div key={index} className='h-[180rem] rounded-[24rem] bg-slate-100/70' />
              ))}
            </div>
          ) : null}

          {status === 'error' ? (
            <p className='rounded-[18rem] border border-d-red/30 bg-d-red/5 px-[20rem] py-[16rem] text-[14rem] font-medium text-d-red'>
              {t('errors.loadFailed', { defaultValue: 'Unable to load plans. Please try again later.' })}
            </p>
          ) : null}
        </section>
      </div>

      <footer className='fixed inset-x-0 bottom-0 z-30 flex flex-col items-center gap-[10rem] px-[20rem] pb-[calc(20rem+env(safe-area-inset-bottom))] pt-[16rem]'>
        <div className='flex items-center gap-[8rem] text-[13rem] font-medium text-slate-400'>
          <span aria-hidden>↑</span>
          <span>{t('cta.footerHint', { defaultValue: 'Choose any plan to continue' })}</span>
        </div>
      </footer>
    </motion.main>
  );
};

const PricingPage = withHydrationGuard(PricingPageComponent);

export default PricingPage;
