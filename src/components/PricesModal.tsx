'use client';

import React from 'react';
import { DialogClose } from './ui/dialog';
import Image from 'next/image';
import { ScrollArea } from './ui/scroll-area';
import { useCustomTranslations } from '@/hooks/useCustomTranslations';
import { useMutation, useQuery } from '@tanstack/react-query';
import { EPAY_PROD_URL, EPAY_TEST_URL } from '@/lib/config';
import { ISubscriptionPlan } from '@/types/Billing';
import { IPaymentOrder } from '@/types/Payments';
import { POST_payment_checkout_order } from '@/api/POST_payment_checkout_order';
import { fetchSubscriptionPlans } from '@/api/subscriptions';
import axios from 'axios';
import { refreshSubscription } from '@/stores/subscriptionStore';

declare global {
  interface Window {
    halyk?: any;
  }
}

export const PricesModal = () => {
  const { t, tImgAlts, tActions } = useCustomTranslations('pricesModal');

  const demoIncludes: string[] = t.raw('demo.includes');
  const premiumIncludes: string[] = t.raw('premium.includes');

  const { data: subscriptionPlans, status: subscriptionStatus } = useQuery<ISubscriptionPlan[]>({
    queryKey: ['/billing/subscriptions/plans'],
    queryFn: fetchSubscriptionPlans,
  });

  const activePlans = React.useMemo(() => (subscriptionPlans ?? []).filter(plan => plan.is_active), [subscriptionPlans]);

  const currencyFormatter = React.useMemo(() => new Intl.NumberFormat('ru-RU'), []);

  const [promoCode, setPromoCode] = React.useState('');
  const [promoMessage, setPromoMessage] = React.useState<string | null>(null);
  const [promoError, setPromoError] = React.useState<string | null>(null);
  const [processingPlanId, setProcessingPlanId] = React.useState<string | null>(null);
  const [planDiscounts, setPlanDiscounts] = React.useState<Record<string, { amount: number; discount: number; currency: string }>>({});

  // const getPlanPeriodLabel = React.useCallback((plan: ISubscriptionPlan) => {
  //   if (plan.is_period_manual && plan.period_start && plan.period_end) {
  //     const startDate = new Date(plan.period_start).toLocaleDateString();
  //     const endDate = new Date(plan.period_end).toLocaleDateString();
  //     return `${startDate} - ${endDate}`;
  //   }
  //
  //   if (!plan.interval) {
  //     return '';
  //   }
  //
  //   const interval = plan.interval.toLowerCase();
  //   if (plan.interval_count <= 1) {
  //     return interval;
  //   }
  //
  //   const pluralInterval = interval.endsWith('s') ? interval : `${interval}s`;
  //
  //   return `${plan.interval_count} ${pluralInterval}`;
  // }, []);

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

  const mutation = useMutation({
    mutationFn: POST_payment_checkout_order,
  });

  async function pay(order: IPaymentOrder) {
    if (!order.invoiceId || !order.token || !order.postLink || !order.postLinkParams || !order.terminal || !order.backLink || !order.failureBackLink) {
      throw new Error(t('promo.missingPaymentData'));
    }

    // 1) Подключаем скрипт
    const src = order.isSandbox ? EPAY_TEST_URL : EPAY_PROD_URL;
    if (!document.querySelector(`script[src="${src}"]`)) {
      await new Promise<void>((res, rej) => {
        const s = document.createElement('script');
        s.src = src;
        s.onload = () => res();
        s.onerror = rej;
        document.body.appendChild(s);
      });
    }

    // 2) Вызываем платёжную страницу
    window.halyk?.pay({
      invoiceId: order.invoiceId,
      amount: order.amount, // в тиынах
      currency: order.currency, // "KZT"
      terminal: order.terminal, // UUID терминала
      backLink: order.backLink,
      failureBackLink: order.failureBackLink,
      postLink: order.postLink,
      postLinkParams: order.postLinkParams, // { auth: "HelloWorld123#" }
      language: 'rus',
      description: `Покупка услуги #${order.orderId}`,
      auth: order.token,
    });
  }

  const formatCurrency = React.useCallback((value: number, currency: string) => `${currencyFormatter.format(value)} ${currency}`, [currencyFormatter]);

  const handleSubmit = async (subscription_plan_id: string) => {
    setProcessingPlanId(subscription_plan_id);
    setPromoError(null);
    setPromoMessage(null);

    try {
      const response = await mutation.mutateAsync({ subscription_plan_id, promo_code: promoCode });
      const { requiresPayment, ...order } = response;

      if (order?.amount !== undefined && order?.currency) {
        setPlanDiscounts(prev => ({
          ...prev,
          [subscription_plan_id]: {
            amount: order.amount,
            discount: order.discount_amount ?? 0,
            currency: order.currency,
          },
        }));
      }

      if (!requiresPayment) {
        await refreshSubscription();
        setPromoMessage(t('promo.accessGranted'));
        setPromoCode('');
        return;
      }

      if (!order) {
        setPromoError(t('promo.missingPaymentData'));
        return;
      }

      await pay(order);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const statusCode = error.response?.status;
        const message = error.response?.data?.message;

        if (statusCode === 400 && typeof message === 'string') {
          setPromoError(message);
        } else {
          setPromoError((typeof message === 'string' && message.length > 0 ? message : null) ?? t('promo.errorDefault'));
        }
      } else if (error instanceof Error) {
        setPromoError(error.message || t('promo.errorDefault'));
      } else {
        setPromoError(t('promo.errorDefault'));
      }
    } finally {
      setProcessingPlanId(null);
    }
  };

  return (
    <ScrollArea className='h-[100dvh] tablet:h-[684rem] tablet:w-[96dvw] desktop:h-[726rem] desktop:w-[1280rem]'>
      <section className='relative flex flex-col overflow-auto rounded-[40rem] bg-white p-[24rem] tablet:p-[32rem] desktop:p-[56rem]'>
        <DialogClose className='absolute right-[24rem] top-[24rem] z-[200] shrink-0 desktop:right-[56rem] desktop:top-[56rem]'>
          <img src='/images/icon_close--black.svg' alt={tImgAlts('close')} className='size-[24rem] shrink-0' />
        </DialogClose>

        <div className='container relative z-10 flex flex-col items-center desktop:max-w-[1440rem]'>
          <div className='flex flex-col items-center'>
            <h1 className='mb-[24rem] mr-[50rem] text-[30rem] font-semibold leading-[120%] tablet:text-center tablet:text-[28rem] tablet:leading-[120%] desktop:mb-[64rem] desktop:text-[40rem] desktop:leading-[120%]'>
              Upgrade to Premium <br className='hidden tablet:block desktop:hidden' /> to get the unlimited access
            </h1>

            <div className='mb-[24rem] flex w-full flex-col items-center gap-y-[8rem] tablet:w-auto'>
              <label className='w-full text-center text-[16rem] font-medium leading-tight text-d-black/80 tablet:w-[360rem] tablet:text-start'>{t('promo.label')}</label>
              <input
                value={promoCode}
                onChange={event => {
                  setPromoCode(event.target.value);
                  setPromoError(null);
                  setPromoMessage(null);
                }}
                placeholder={t('promo.placeholder')}
                className='w-full rounded-full border border-d-light-gray bg-white px-[24rem] py-[12rem] text-[16rem] font-medium leading-tight text-d-black outline-none focus:border-d-green tablet:w-[360rem]'
              />
              {promoError && <p className='w-full text-center text-[14rem] font-medium text-d-red tablet:w-[360rem] tablet:text-start'>{promoError}</p>}
              {promoMessage && <p className='w-full text-center text-[14rem] font-medium text-d-green tablet:w-[360rem] tablet:text-start'>{promoMessage}</p>}
            </div>

            <div className='flex flex-col gap-[24rem] tablet:flex-row tablet:gap-[12rem] desktop:gap-x-[24rem]'>
              {/* Demo/Free Plan */}
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

              {/* Subscription Plans */}
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
                        {/*{plan.is_period_manual && periodLabel && (*/}
                        {/*  <p className='mt-[8rem] text-[14rem] font-normal tablet:text-[16rem]'>{periodLabel}</p>*/}
                        <button
                          onClick={() => handleSubmit(planId)}
                          disabled={processingPlanId === planId}
                          className='relative z-[200] w-full rounded-full bg-d-green py-[16rem] text-[18rem] font-medium text-black hover:bg-d-green/90 disabled:cursor-not-allowed disabled:bg-d-gray/60 disabled:text-d-black/60'
                        >
                          {processingPlanId === planId ? (
                            <svg className='mx-auto size-[20rem] animate-spin text-black' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'>
                              <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' />
                              <path
                                className='opacity-75'
                                fill='currentColor'
                                d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                              />
                            </svg>
                          ) : (
                            tActions('upgrade')
                          )}
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
    </ScrollArea>
  );
};
