'use client';

import { useRef, useState, type KeyboardEvent } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useCustomTranslations } from '@/hooks/useCustomTranslations';
import { discountedPrice, monthsInPlan, savingsPct } from '@/lib/pricing';
import { MobilePageHeader } from '@/components/mobile/MobilePageHeader';
import { OfferCountdown } from '@/components/OfferCountdown';
import { useOffer } from '@/hooks/useOffer';
import { cn } from '@/lib/utils';
import type { ISubscriptionPlan } from '@/types/Billing';

interface PlanDiscounts {
  [planId: string]: { amount: number; currency: string };
}

const CURRENCY_FORMATTER = new Intl.NumberFormat('ru-RU', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

const formatCurrency = (value: number, currency: string) => `${CURRENCY_FORMATTER.format(value)} ${currency}`;

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

export const PricingPlansView = ({ premiumIncludes, activePlans, status, onPlanSelect, planDiscounts, promoMessage, promoError, onBack }: PricingPlansViewProps) => {
  const { t, tActions, tImgAlts } = useCustomTranslations('pricesModal');
  const prefersReducedMotion = useReducedMotion();
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  const offer = useOffer();
  const [expired, setExpired] = useState(false);
  const offerActive = offer.active && Boolean(offer.expiresAt) && !expired;
  const livePriceOf = (plan: ISubscriptionPlan) =>
    offerActive && (plan.launch_discount_pct ?? 0) > 0 ? discountedPrice(plan.price, plan.launch_discount_pct ?? 0) : plan.price;

  const titleText = t('mobileHeader.choosePlan', { defaultValue: 'Choose your plan' });
  const subtitleText = t('mobileHeader.choosePlanSubtitle', { defaultValue: 'Upgrade to get full access' });

  const bestPlanId = activePlans.length ? String(activePlans.reduce((a, b) => (savingsPct(b, activePlans) > savingsPct(a, activePlans) ? b : a)).id) : null;

  const selectedId = selectedPlanId ?? bestPlanId;
  const selectedPlan = activePlans.find(plan => String(plan.id) === selectedId) ?? null;
  // The shared "what's included" block describes the Premium tier itself, so it must not
  // change as the user taps between durations — key it off any plan that defines features
  // (all durations share them), falling back to the i18n list.
  const includedFeatures = activePlans.find(plan => plan.features && plan.features.length)?.features ?? premiumIncludes;

  // Roving-tabindex keyboard nav for the radio group (WAI-ARIA radiogroup pattern).
  const radioRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const moveSelection = (fromIndex: number, dir: 1 | -1) => {
    const count = activePlans.length;
    if (!count) return;
    const next = (fromIndex + dir + count) % count;
    setSelectedPlanId(String(activePlans[next].id));
    radioRefs.current[next]?.focus();
  };
  const handleRadioKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
      event.preventDefault();
      moveSelection(index, 1);
    } else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
      event.preventDefault();
      moveSelection(index, -1);
    }
  };

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
          {promoMessage ? <p className='rounded-[16rem] bg-d-green/15 px-[16rem] py-[10rem] text-[13rem] font-medium text-d-black'>{promoMessage}</p> : null}
          {promoError ? <p className='mt-[12rem] rounded-[16rem] bg-d-red/10 px-[16rem] py-[10rem] text-[13rem] font-medium text-d-red'>{promoError}</p> : null}
        </div>
      )}

      {status === 'success' && offerActive && offer.expiresAt ? (
        <div className='mx-[20rem] mt-[14rem] flex justify-center'>
          <OfferCountdown expiresAt={offer.expiresAt} discountPct={offer.discountPct} onExpire={() => setExpired(true)} className='w-full' />
        </div>
      ) : null}

      <div className='flex-1 overflow-y-auto px-[20rem] pb-[calc(140rem+env(safe-area-inset-bottom))] pt-[22rem]'>
        {status === 'success' ? (
          <>
            <section role='radiogroup' aria-label={titleText} className='flex flex-col gap-[26rem]'>
              {activePlans.map((plan, index) => {
                const planId = String(plan.id);
                const isSelected = planId === selectedId;
                const isBest = planId === bestPlanId;
                const months = monthsInPlan(plan.interval, plan.interval_count);
                const isMultiMonth = months > 1;
                const discount = planDiscounts[planId];
                const pct = offerActive ? plan.launch_discount_pct ?? 0 : 0;
                const showDiscount = pct > 0;
                const livePrice = showDiscount ? discountedPrice(plan.price, pct) : plan.price;
                const finalPrice = CURRENCY_FORMATTER.format(livePrice);
                const oldPrice = CURRENCY_FORMATTER.format(plan.price);
                const perMonthAmount = CURRENCY_FORMATTER.format(Math.round(livePrice / months));

                return (
                  <motion.button
                    key={plan.id}
                    ref={el => {
                      radioRefs.current[index] = el;
                    }}
                    type='button'
                    role='radio'
                    aria-checked={isSelected}
                    tabIndex={isSelected ? 0 : -1}
                    onClick={() => setSelectedPlanId(planId)}
                    onKeyDown={event => handleRadioKeyDown(event, index)}
                    whileTap={prefersReducedMotion ? undefined : { scale: 0.99 }}
                    initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
                    animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: index * 0.07 }}
                    className={cn(
                      'relative flex w-full items-center gap-[14rem] rounded-[20rem] border px-[18rem] py-[18rem] text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200 focus-visible:ring-offset-2',
                      isSelected
                        ? 'border-blue-500 bg-blue-50/60 shadow-[0_18rem_48rem_-42rem_rgba(37,99,235,0.55)]'
                        : 'border-slate-200 bg-white hover:border-blue-200 hover:bg-blue-50/30'
                    )}
                  >
                    {isBest && (
                      <span className='absolute -top-[12rem] left-[18rem] inline-flex items-center gap-[5rem] whitespace-nowrap rounded-full bg-blue-600 px-[12rem] py-[4rem] text-[11rem] font-semibold uppercase tracking-[0.06em] text-white shadow-[0_12rem_26rem_-14rem_rgba(37,99,235,0.9)]'>
                        <img src='/images/icon_star.svg' alt='' aria-hidden className='size-[11rem] brightness-0 invert' />
                        {t('bestValue')}
                      </span>
                    )}

                    <span
                      aria-hidden
                      className={cn('flex size-[24rem] shrink-0 items-center justify-center rounded-full border-2 transition', isSelected ? 'border-blue-600 bg-blue-600' : 'border-slate-300 bg-white')}
                    >
                      {isSelected ? <img src='/images/icon_check--white.svg' alt='' className='size-[13rem]' /> : null}
                    </span>

                    <span className='flex min-w-0 flex-1 flex-col gap-[3rem]'>
                      <span className='truncate text-[16rem] font-semibold leading-[125%] text-slate-900'>{plan.name}</span>
                      {isMultiMonth ? (
                        <span className='text-[13rem] font-medium text-slate-500'>{t('perMonth', { amount: perMonthAmount, currency: plan.currency })}</span>
                      ) : null}
                    </span>

                    <span className='flex shrink-0 flex-col items-end gap-[3rem]'>
                      {showDiscount ? (
                        <span className='rounded-full bg-d-green px-[9rem] py-[2rem] text-[11rem] font-bold text-d-black'>
                          <span aria-hidden='true'>{t('discountBadge', { percent: pct })}</span>
                          <span className='sr-only'>{t('discountA11y', { percent: pct })}</span>
                        </span>
                      ) : null}
                      {showDiscount ? (
                        <s className='text-[12rem] text-slate-400'>
                          <span className='sr-only'>{t('oldPriceLabel')}: </span>
                          {oldPrice} {plan.currency}
                        </s>
                      ) : null}
                      <span className='font-poppins text-[19rem] font-bold leading-none text-slate-900'>
                        {finalPrice} {plan.currency}
                      </span>
                      {discount ? <span className='text-[11rem] font-medium text-slate-500'>{t('promo.total', { amount: formatCurrency(discount.amount, discount.currency) })}</span> : null}
                    </span>
                  </motion.button>
                );
              })}
            </section>

            <section className='mt-[24rem] rounded-[22rem] border border-slate-200 bg-white p-[22rem] shadow-[0_18rem_50rem_-46rem_rgba(15,23,42,0.5)]'>
              <h3 className='font-poppins text-[15rem] font-semibold text-slate-900'>{t('includedTitle')}</h3>
              <ul className='mt-[16rem] flex flex-col gap-[13rem]'>
                {includedFeatures.map((feature, featureIndex) => (
                  <li key={featureIndex} className='flex items-start gap-[12rem]'>
                    <span className='mt-[1rem] flex size-[20rem] shrink-0 items-center justify-center rounded-full bg-d-green/25'>
                      <img src='/images/icon_check.svg' alt={tImgAlts('check')} className='size-[11rem]' />
                    </span>
                    <span className='flex-1 text-[14rem] leading-[135%] text-slate-700'>{feature}</span>
                  </li>
                ))}
              </ul>
            </section>
          </>
        ) : null}

        {status === 'pending' ? (
          <div className='space-y-[18rem]'>
            {[0, 1, 2].map(index => (
              <div key={index} className='h-[92rem] rounded-[20rem] bg-slate-100/80' />
            ))}
            <div className='h-[200rem] rounded-[22rem] bg-slate-100/60' />
          </div>
        ) : null}

        {status === 'error' ? (
          <p className='rounded-[18rem] border border-d-red/30 bg-d-red/5 px-[20rem] py-[16rem] text-[14rem] font-medium text-d-red'>
            {t('errors.loadFailed', { defaultValue: 'Unable to load plans. Please try again later.' })}
          </p>
        ) : null}
      </div>

      <footer className='fixed inset-x-0 bottom-0 z-30 border-t border-slate-100 bg-white/95 px-[20rem] pb-[calc(18rem+env(safe-area-inset-bottom))] pt-[14rem] backdrop-blur-[12rem]'>
        <button
          type='button'
          disabled={!selectedId}
          onClick={() => {
            if (selectedId) onPlanSelect(selectedId);
          }}
          className='flex h-[54rem] w-full items-center justify-center gap-[8rem] rounded-full bg-d-green text-[17rem] font-semibold text-d-black shadow-[0_18rem_40rem_-20rem_rgba(201,255,85,1)] transition active:scale-[0.99] disabled:opacity-50'
        >
          {tActions('continue')}
          {selectedPlan ? (
            <span className='opacity-65'>
              · {CURRENCY_FORMATTER.format(livePriceOf(selectedPlan))} {selectedPlan.currency}
            </span>
          ) : null}
        </button>
      </footer>
    </motion.main>
  );
};
