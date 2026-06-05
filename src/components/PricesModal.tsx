'use client';

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { DialogClose } from './ui/dialog';
import { OfferCountdown } from './OfferCountdown';
import { useCustomTranslations } from '@/hooks/useCustomTranslations';
import { discountedPrice, formatPeriod, monthsInPlan, savingsPct } from '@/lib/pricing';
import { usePricingPlans } from '@/hooks/usePricingPlans';
import { useOffer } from '@/hooks/useOffer';
import { cn } from '@/lib/utils';

interface PricesModalProps {
  onSelectPlan: (planId: string) => void;
  promoMessage?: string | null;
  promoError?: string | null;
  planDiscounts?: Record<string, { amount: number; currency: string }>;
  showClose?: boolean;
}

export const PricesModal = ({ onSelectPlan, promoMessage = null, promoError = null, planDiscounts = {}, showClose = true }: PricesModalProps) => {
  const { t, tImgAlts, tActions } = useCustomTranslations('pricesModal');
  const prefersReducedMotion = useReducedMotion();

  const premiumIncludes: string[] = t.raw('premium.includes');

  const { activePlans, status: subscriptionStatus } = usePricingPlans();

  const currencyFormatter = React.useMemo(
    () =>
      new Intl.NumberFormat('ru-RU', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }),
    []
  );

  const formatCurrency = React.useCallback((value: number, currency: string) => `${currencyFormatter.format(value)} ${currency}`, [currencyFormatter]);

  const bestPlanId = activePlans.length
    ? String(activePlans.reduce((a, b) => (savingsPct(b, activePlans) > savingsPct(a, activePlans) ? b : a)).id)
    : null;

  const offer = useOffer();
  const [expired, setExpired] = React.useState(false);
  const offerActive = offer.active && Boolean(offer.expiresAt) && !expired;

  return (
    <section className='relative flex w-full flex-col overflow-auto rounded-[40rem] bg-white p-[24rem] tablet:p-[32rem] desktop:p-[44rem]'>
      {showClose && (
        <DialogClose className='absolute right-[24rem] top-[24rem] z-[200] shrink-0 rounded-full p-[6rem] transition hover:bg-slate-100 desktop:right-[40rem] desktop:top-[40rem]'>
          <img src='/images/icon_close--black.svg' alt={tImgAlts('close')} className='size-[24rem] shrink-0' />
        </DialogClose>
      )}

      <div className='relative z-10 mx-auto flex w-full max-w-[1180rem] flex-col items-center'>
        <div className='flex flex-col items-center gap-[18rem]'>
          {offerActive && offer.expiresAt ? (
            <OfferCountdown expiresAt={offer.expiresAt} discountPct={offer.discountPct} onExpire={() => setExpired(true)} />
          ) : null}
          <h1 className='m-0 max-w-[760rem] text-center font-poppins text-[30rem] font-semibold leading-[118%] text-slate-900 tablet:text-[34rem] desktop:text-[44rem] desktop:leading-[112%]'>
            {t('title')}
          </h1>
        </div>

        <div className='mb-[28rem] mt-[16rem] flex w-full flex-col items-center gap-y-[8rem] tablet:w-auto'>
          {promoMessage && (
            <p className='w-full rounded-[16rem] bg-d-green/15 px-[24rem] py-[12rem] text-center text-[14rem] font-medium text-d-black tablet:w-[420rem] tablet:text-start'>{promoMessage}</p>
          )}
          {promoError && <p className='w-full rounded-[16rem] bg-d-red/10 px-[24rem] py-[12rem] text-center text-[14rem] font-medium text-d-red tablet:w-[420rem] tablet:text-start'>{promoError}</p>}
        </div>

        <div className='flex w-full flex-col items-stretch justify-center gap-[20rem] pt-[12rem] tablet:flex-row tablet:gap-[16rem] desktop:gap-[20rem]'>
          {subscriptionStatus === 'pending' &&
            [0, 1, 2].map(index => (
              <div
                key={`plan-skeleton-${index}`}
                className='h-[520rem] w-full animate-pulse rounded-[28rem] bg-slate-100 tablet:w-[300rem] desktop:w-[372rem]'
              />
            ))}

          {subscriptionStatus === 'success' &&
            activePlans.map((plan, index) => {
              const planId = String(plan.id);
              const isPrimaryPlan = planId === bestPlanId;
              const intervalLabel = formatPeriod(plan.interval, plan.interval_count, t);
              const hasPromo = Boolean(planDiscounts[planId]);
              const planFeatures = plan.features && plan.features.length ? plan.features : premiumIncludes;
              const months = monthsInPlan(plan.interval, plan.interval_count);
              const isMultiMonth = months > 1;
              const pct = offerActive ? plan.launch_discount_pct ?? 0 : 0;
              const showDiscount = pct > 0;
              const livePrice = showDiscount ? discountedPrice(plan.price, pct) : plan.price;
              const finalPrice = currencyFormatter.format(livePrice);
              const oldPrice = currencyFormatter.format(plan.price);
              const perMonthAmount = currencyFormatter.format(Math.round(livePrice / months));

              return (
                <motion.div
                  key={plan.id}
                  initial={prefersReducedMotion ? false : { opacity: 0, y: 26 }}
                  animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: index * 0.09 }}
                  className={cn(
                    'group relative flex w-full flex-col rounded-[28rem] p-[28rem] transition-all duration-300 tablet:w-[300rem] desktop:w-[372rem]',
                    'bg-white ring-1 ring-slate-200/80 shadow-[0_30rem_70rem_-58rem_rgba(15,23,42,0.5)] hover:-translate-y-[6rem] hover:shadow-[0_46rem_90rem_-56rem_rgba(15,23,42,0.5)]',
                    isPrimaryPlan && 'bg-blue-50/40 ring-2 ring-blue-500 shadow-[0_44rem_90rem_-54rem_rgba(37,99,235,0.55)] tablet:scale-[1.035]'
                  )}
                >
                  {isPrimaryPlan && (
                    <span className='absolute -top-[15rem] left-1/2 inline-flex -translate-x-1/2 items-center gap-[6rem] whitespace-nowrap rounded-full bg-blue-600 px-[18rem] py-[7rem] text-[12rem] font-semibold uppercase tracking-[0.08em] text-white shadow-[0_16rem_34rem_-18rem_rgba(37,99,235,0.9)]'>
                      <img src='/images/icon_star.svg' alt='' aria-hidden className='size-[13rem] brightness-0 invert' />
                      {t('bestValue')}
                    </span>
                  )}

                  <header className='flex items-start justify-between gap-[12rem]'>
                    <h2 className='font-poppins text-[23rem] font-semibold leading-[120%] text-slate-900'>{plan.name}</h2>
                    {showDiscount ? (
                      <span className='shrink-0 rounded-full bg-d-green px-[11rem] py-[5rem] text-[13rem] font-bold text-d-black'>
                        <span aria-hidden='true'>{t('discountBadge', { percent: pct })}</span>
                        <span className='sr-only'>{t('discountA11y', { percent: pct })}</span>
                      </span>
                    ) : null}
                  </header>

                  <div className='mt-[18rem]'>
                    {showDiscount ? (
                      <s className='text-[16rem] font-medium text-slate-400'>
                        <span className='sr-only'>{t('oldPriceLabel')}: </span>
                        {oldPrice} {plan.currency}
                      </s>
                    ) : null}
                    <div className='mt-[2rem] flex items-baseline gap-[8rem]'>
                      <span className='font-poppins text-[40rem] font-semibold leading-none text-slate-900'>{finalPrice}</span>
                      <span className='text-[15rem] font-medium text-slate-500'>
                        {plan.currency} / {intervalLabel}
                      </span>
                    </div>
                    {isMultiMonth && !hasPromo && (
                      <p className='mt-[8rem] text-[14rem] font-medium text-slate-500'>
                        {t('perMonth', { amount: perMonthAmount, currency: plan.currency })}
                      </p>
                    )}
                  </div>

                  <div className='my-[22rem] h-px w-full bg-slate-200/70' />

                  <ul className='flex flex-1 flex-col gap-[14rem]'>
                    {planFeatures.map((item, featureIndex) => (
                      <li key={`${plan.id}-${featureIndex}`} className='flex items-start gap-[12rem]'>
                        <span className='mt-[1rem] flex size-[20rem] shrink-0 items-center justify-center rounded-full bg-d-green/25'>
                          <img src='/images/icon_check.svg' alt='' aria-hidden className='size-[11rem]' />
                        </span>
                        <span className='text-[15rem] leading-[135%] text-slate-700'>{item}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => onSelectPlan(planId)}
                    className={cn(
                      'relative z-[200] mt-[24rem] w-full rounded-full py-[16rem] text-[17rem] font-semibold transition-transform duration-200 hover:scale-[1.015] active:scale-[0.99]',
                      'bg-d-green text-d-black shadow-[0_18rem_40rem_-22rem_rgba(201,255,85,1)] hover:bg-d-green/90'
                    )}
                  >
                    {tActions('upgrade')}
                  </button>

                  {planDiscounts[planId] && (
                    <p className='mt-[12rem] text-center text-[14rem] font-medium leading-tight text-slate-700'>
                      {t('promo.total', { amount: formatCurrency(planDiscounts[planId].amount, planDiscounts[planId].currency) })}
                    </p>
                  )}
                </motion.div>
              );
            })}
        </div>
      </div>
    </section>
  );
};
