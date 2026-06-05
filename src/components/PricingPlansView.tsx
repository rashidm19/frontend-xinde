'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useCustomTranslations } from '@/hooks/useCustomTranslations';
import { formatPeriod, perMonthPrice, savingsPct } from '@/lib/pricing';
import { MobilePageHeader } from '@/components/mobile/MobilePageHeader';
import type { ISubscriptionPlan } from '@/types/Billing';

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

export interface PricingPlansViewProps {
  premiumIncludes: string[];
  activePlans: ISubscriptionPlan[];
  status: 'pending' | 'error' | 'success';
  onPlanSelect: (planId: string) => void;
  planDiscounts: PlanDiscounts;
  promoMessage: string | null;
  promoError: string | null;
  onBack?: () => void;
}

export const PricingPlansView = ({
  premiumIncludes,
  activePlans,
  status,
  onPlanSelect,
  planDiscounts,
  promoMessage,
  promoError,
  onBack,
}: PricingPlansViewProps) => {
  const { t, tActions, tImgAlts } = useCustomTranslations('pricesModal');

  const titleText = t('mobileHeader.choosePlan', { defaultValue: 'Choose your plan' });
  const subtitleText = t('mobileHeader.choosePlanSubtitle', { defaultValue: 'Upgrade to get full access' });

  const bestPlanId = activePlans.length
    ? String(activePlans.reduce((a, b) => (savingsPct(b, activePlans) > savingsPct(a, activePlans) ? b : a)).id)
    : null;

  const planCards = useMemo(
    () =>
      activePlans.map((plan, index) => {
        const planFeatures = plan.features && plan.features.length ? plan.features : premiumIncludes;
        const priceLabel = `${CURRENCY_FORMATTER.format(plan.price)} ${plan.currency}`;
        const planId = String(plan.id);
        const intervalLabel = formatPeriod(plan.interval, plan.interval_count, t);
        const pct = savingsPct(plan, activePlans);
        const discount = planDiscounts[planId];
        const isBest = planId === bestPlanId;

        return (
          <article
            key={plan.id}
            className={`relative rounded-[24rem] border p-[24rem] shadow-[0_18rem_40rem_-32rem_rgba(15,23,42,0.45)] ${getCardBackground(index)} transition-transform hover:-translate-y-[2rem]${isBest ? ' ring-2 ring-d-violet' : ''}`}
          >
            <div className='flex flex-col gap-[16rem]'>
              <header className='flex flex-col gap-[6rem]'>
                <h2 className='text-[20rem] font-semibold text-slate-900'>{plan.name}</h2>
                <div className='text-[28rem] font-bold text-slate-900'>
                  {priceLabel}
                  <span className='ml-[4rem] text-[14rem] font-medium text-slate-500'>/ {intervalLabel}</span>
                </div>
                {pct > 0 && !discount && (
                  <p className='text-[13rem] font-medium text-d-green'>
                    {t('perMonth', { amount: CURRENCY_FORMATTER.format(perMonthPrice(plan)), currency: plan.currency })} · {t('save', { percent: pct })}
                  </p>
                )}
                {isBest && <p className='text-[13rem] font-semibold text-d-violet'>{t('bestValue')}</p>}
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
    [activePlans, planDiscounts, premiumIncludes, t, tActions, tImgAlts, onPlanSelect, bestPlanId]
  );

  return (
    <motion.main
      className='flex min-h-dvh flex-col bg-gradient-to-b from-white via-white to-slate-50'
      initial={{ x: '100%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '-20%', opacity: 0 }}
      transition={{ type: 'spring', stiffness: 260, damping: 30 }}
    >
      <MobilePageHeader title={titleText} subtitle={subtitleText} {...(onBack ? { back: true, backLabel: tActions('back'), onBack } : { back: false })} />

      {(promoMessage || promoError) && (
        <div className='px-[20rem] pt-[12rem]'>
          {promoMessage ? <p className='rounded-[16rem] bg-d-green/10 px-[16rem] py-[10rem] text-[13rem] font-medium text-d-green'>{promoMessage}</p> : null}
          {promoError ? <p className='mt-[12rem] rounded-[16rem] bg-d-red/10 px-[16rem] py-[10rem] text-[13rem] font-medium text-d-red'>{promoError}</p> : null}
        </div>
      )}

      <div className='flex-1 overflow-y-auto px-[20rem] pb-[calc(120rem+env(safe-area-inset-bottom))] pt-[20rem]'>
        <section className='flex flex-col gap-[20rem]'>
          {status === 'success' ? planCards : null}

          {status === 'pending' ? (
            <div className='space-y-[16rem]'>
              {[0, 1, 2].map(index => (
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
