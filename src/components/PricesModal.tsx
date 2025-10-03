'use client';

import React from 'react';
import { DialogClose } from './ui/dialog';
import Image from 'next/image';
import { useCustomTranslations } from '@/hooks/useCustomTranslations';
import { useQuery } from '@tanstack/react-query';
import { ISubscriptionPlan } from '@/types/Billing';
import { fetchSubscriptionPlans } from '@/api/subscriptions';

interface PricesModalProps {
  onSelectPlan: (planId: string) => void;
  promoMessage?: string | null;
  promoError?: string | null;
  planDiscounts?: Record<string, { amount: number; discount: number; currency: string }>;
}

export const PricesModal = ({ onSelectPlan, promoMessage = null, promoError = null, planDiscounts = {} }: PricesModalProps) => {
  const { t, tImgAlts, tActions } = useCustomTranslations('pricesModal');

  const demoIncludes: string[] = t.raw('demo.includes');
  const premiumIncludes: string[] = t.raw('premium.includes');

  const { data: subscriptionPlans, status: subscriptionStatus } = useQuery<ISubscriptionPlan[]>({
    queryKey: ['/billing/subscriptions/plans'],
    queryFn: fetchSubscriptionPlans,
  });

  const activePlans = React.useMemo(() => (subscriptionPlans ?? []).filter(plan => plan.is_active), [subscriptionPlans]);

  const currencyFormatter = React.useMemo(() => new Intl.NumberFormat('ru-RU'), []);

  const getPlanMonths = React.useCallback((plan: ISubscriptionPlan) => {
    if (plan.is_period_manual && plan.period_start && plan.period_end) {
      const startDate = new Date(plan.period_start);
      const endDate = new Date(plan.period_end);
      const monthDiff = (endDate.getFullYear() - startDate.getFullYear()) * 12 + (endDate.getMonth() - startDate.getMonth());

      return monthDiff > 0 ? monthDiff : 1;
    }

    if (!plan.interval) {
      return 1;
    }

    const interval = plan.interval.toLowerCase();

    if (interval === 'year') {
      return Math.max(plan.interval_count, 1) * 12;
    }

    if (interval === 'month') {
      return Math.max(plan.interval_count, 1);
    }

    return Math.max(plan.interval_count, 1);
  }, []);

  const formatCurrency = React.useCallback((value: number, currency: string) => `${currencyFormatter.format(value / 100)} ${currency}`, [currencyFormatter]);

  return (
    // <ScrollArea className='tablet:h-[684rem] tablet:w-[96dvw] desktop:h-[726rem] desktop:w-[1280rem]'>
    <section className='relative flex flex-col overflow-auto rounded-[40rem] bg-white p-[16rem] tablet:p-[28rem] desktop:p-[36rem]'>
      <DialogClose className='absolute right-[24rem] top-[24rem] z-[200] shrink-0 desktop:right-[56rem] desktop:top-[56rem]'>
        <img src='/images/icon_close--black.svg' alt={tImgAlts('close')} className='size-[24rem] shrink-0' />
      </DialogClose>

      <div className='container relative z-10 flex flex-col items-center desktop:max-w-[1440rem]'>
        <div className='flex flex-col items-center'>
          <h1 className='m-0 text-[30rem] font-semibold leading-[120%] tablet:text-center tablet:text-[28rem] tablet:leading-[120%] desktop:text-[40rem] desktop:leading-[120%]'>
            Upgrade to Premium <br className='hidden tablet:block desktop:hidden' /> to get the unlimited access
          </h1>

          <div className='mb-[24rem] flex w-full flex-col items-center gap-y-[8rem] tablet:w-auto'>
            {promoMessage && (
              <p className='w-full rounded-[16rem] bg-d-green/10 px-[24rem] py-[12rem] text-center text-[14rem] font-medium text-d-green tablet:w-[360rem] tablet:text-start'>
                {promoMessage}
              </p>
            )}
            {promoError && (
              <p className='w-full rounded-[16rem] bg-d-red/10 px-[24rem] py-[12rem] text-center text-[14rem] font-medium text-d-red tablet:w-[360rem] tablet:text-start'>
                {promoError}
              </p>
            )}
          </div>

          <div className='flex flex-col gap-[24rem] tablet:flex-row tablet:gap-[12rem] desktop:gap-x-[24rem]'>
            <div className='flex h-[320rem] w-[342rem] flex-col gap-y-[12rem] rounded-[16rem] bg-d-light-gray p-[32rem] pb-[44rem] tablet:h-[500rem] tablet:w-[300rem] tablet:gap-y-[20rem] desktop:h-[500rem] desktop:w-[370rem] desktop:gap-y-[32rem]'>
              <h2 className='font-poppins text-[32rem] font-medium'>{t('demo.title')}</h2>

              <div className='flex flex-col gap-y-[12rem] tablet:gap-y-[16rem] desktop:gap-y-[20rem]'>
                {demoIncludes?.map((item, index) => (
                  <div key={index} className='flex items-center gap-x-[12rem]'>
                    <img src='/images/icon_check.svg' alt={tImgAlts('check')} className='size-[16rem]' />
                    <span className='text-[14rem] leading-[120%] tablet:text-[16rem] tablet:leading-[130%] desktop:leading-[120%]'>{item}</span>
                  </div>
                ))}
              </div>

              <div className='mt-auto flex flex-col'>
                <h3 className='mb-[12rem] text-center text-[32rem] font-medium tablet:mb-[24rem] tablet:text-start desktop:mb-[38rem]'>{t('demo.price')}</h3>
                <p className='mx-auto -mb-[10rem] text-center text-[14rem] font-semibold text-black/60 tablet:-mb-[0rem] desktop:mb-0'>{t('demo.about')}</p>
              </div>
            </div>

            {subscriptionStatus === 'success' &&
              activePlans.map((plan, index) => {
                const isPrimaryPlan = index === 0;
                const planFeatures = plan.features && plan.features.length ? plan.features : premiumIncludes;
                const priceLabel = `${currencyFormatter.format(plan.price)} ₸`;
                const monthCount = getPlanMonths(plan);
                const imageIndex = (index % 2) + 1;
                const planId = String(plan.id);

                return (
                  <div
                    key={plan.id}
                    className={`relative flex h-[430rem] w-[342rem] flex-col gap-y-[12rem] rounded-[16rem] ${isPrimaryPlan ? 'bg-d-violet' : 'bg-d-blue'} p-[32rem] text-white tablet:h-[500rem] tablet:w-[300rem] tablet:gap-y-[20rem] desktop:h-[500rem] desktop:w-[370rem] desktop:gap-y-[32rem]`}
                  >
                    <div className={`absolute -bottom-[0rem] right-0 ${isPrimaryPlan ? 'aspect-[462/428]' : 'aspect-[458/330]'} w-[213rem] mix-blend-soft-light`}>
                      <Image src={`/images/icon_subscription--0${imageIndex}.png`} alt={tImgAlts('premiumPlan')} className='rounded-br-[16rem] object-cover' fill />
                    </div>

                    <h2 className='font-poppins text-[32rem] font-medium'>{plan.name}</h2>

                    <div className='flex flex-col gap-y-[12rem] tablet:gap-y-[16rem] desktop:gap-y-[20rem]'>
                      {planFeatures.map((item, featureIndex) => (
                        <div key={`${plan.id}-${featureIndex}`} className='flex items-center gap-x-[12rem]'>
                          <img src='/images/icon_check--white.svg' alt={tImgAlts('check')} className='size-[16rem]' />
                          <span className='text-[14rem] leading-[120%] tablet:text-[16rem] tablet:leading-[130%] desktop:leading-[120%]'>{item}</span>
                        </div>
                      ))}
                    </div>

                    <div className='mt-auto'>
                      <h3 className='text-[32rem] font-medium'>
                        {t.rich('premium.price', {
                          price: priceLabel,
                          monthCount: String(monthCount),
                          span: chunks => <span className='text-[14rem] font-normal tablet:text-[16rem]'>{chunks}</span>,
                        })}
                      </h3>
                      <button
                        onClick={() => onSelectPlan(planId)}
                        className='relative z-[200] w-full rounded-full bg-d-green py-[16rem] text-[18rem] font-medium text-black hover:bg-d-green/90'
                      >
                        {tActions('upgrade')}
                      </button>
                      {planDiscounts[planId] && (
                        <div className='mt-[12rem] text-[14rem] font-medium leading-tight'>
                          {planDiscounts[planId].discount > 0 && (
                            <p className='text-d-green'>
                              {t('promo.discount', { amount: formatCurrency(planDiscounts[planId].discount, planDiscounts[planId].currency) })}
                            </p>
                          )}
                          <p>{t('promo.total', { amount: formatCurrency(planDiscounts[planId].amount, planDiscounts[planId].currency) })}</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </section>
    // </ScrollArea>
  );
};
