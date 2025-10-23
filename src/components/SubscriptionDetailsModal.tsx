'use client';

import React from 'react';
import { format, parseISO } from 'date-fns';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useCustomTranslations } from '@/hooks/useCustomTranslations';
import { useSubscription } from '@/hooks/useSubscription';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SubscriptionDetailsModal = ({ open, onOpenChange }: Props) => {
  const { t } = useCustomTranslations('subscriptionModal');
  const { subscription, status, error, balance, balanceStatus, balanceError, refreshSubscriptionAndBalance, hasActiveSubscription } = useSubscription();

  const isLoading = status === 'loading' || balanceStatus === 'loading';
  const planName = subscription?.plan?.name ?? subscription?.subscription_plan?.name ?? null;
  const renewalDate = subscription?.current_period_end ?? null;
  const cancelAtPeriodEnd = Boolean(subscription?.cancel_at_period_end);
  const practiceBalance = balance?.practice_balance ?? 0;

  const formattedRenewalDate = React.useMemo(() => {
    if (!renewalDate) {
      return null;
    }

    try {
      return format(parseISO(renewalDate), 'dd MMM yyyy');
    } catch (err) {
      return renewalDate;
    }
  }, [renewalDate]);

  const statusLabel = hasActiveSubscription ? t('status.active') : t('status.inactive');

  const renewalLabel = React.useMemo(() => {
    if (!renewalDate) {
      return t('renewal.unknown');
    }

    const target = formattedRenewalDate ?? renewalDate;
    return cancelAtPeriodEnd ? t('renewal.cancelsOn', { date: target }) : t('renewal.renewsOn', { date: target });
  }, [cancelAtPeriodEnd, formattedRenewalDate, renewalDate, t]);

  const handleRetry = React.useCallback(() => {
    refreshSubscriptionAndBalance().catch(() => {
      /* silently handled */
    });
  }, [refreshSubscriptionAndBalance]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='fixed left-[50%] top-[50%] flex w-[90vw] max-w-[520rem] -translate-x-1/2 -translate-y-1/2 flex-col gap-y-[16rem] rounded-[24rem] bg-white p-[32rem] shadow-[0_24rem_48rem_rgba(0,0,0,0.12)] transition-all duration-300'>
        <DialogHeader className='text-left'>
          <DialogTitle className='text-[24rem] font-semibold leading-tight text-d-black'>{t('title')}</DialogTitle>
          <DialogDescription className='text-[14rem] leading-tight text-d-black/70'>{t('description')}</DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className='flex flex-col gap-y-[16rem]'>
            <Skeleton className='h-[20rem] w-[60%]' />
            <Skeleton className='h-[20rem] w-[50%]' />
            <Skeleton className='h-[20rem] w-[40%]' />
            <Skeleton className='h-[48rem] w-full rounded-[12rem]' />
          </div>
        ) : (
          <div className='flex flex-col gap-y-[20rem]'>
            <section className='rounded-[16rem] border border-d-light-gray/80 p-[20rem]'>
              <dl className='flex flex-col gap-y-[12rem] text-[14rem] text-d-black'>
                <div className='flex items-center justify-between'>
                  <dt className='font-medium uppercase tracking-[0.14rem]'>{t('labels.status')}</dt>
                  <dd className='font-semibold'>{statusLabel}</dd>
                </div>
                <div className='flex items-center justify-between'>
                  <dt className='font-medium uppercase tracking-[0.14rem]'>{t('labels.plan')}</dt>
                  <dd className='font-semibold'>{planName ?? t('plan.none')}</dd>
                </div>
                <div className='flex items-center justify-between'>
                  <dt className='font-medium uppercase tracking-[0.14rem]'>{t('labels.renewal')}</dt>
                  <dd className='text-right font-semibold'>{renewalLabel}</dd>
                </div>
              </dl>
            </section>

            {!hasActiveSubscription && (
              <section className='rounded-[16rem] border border-d-light-gray/80 p-[20rem]'>
                <div className='flex items-center justify-between'>
                  <div>
                    <div className='text-[12rem] font-medium uppercase tracking-[0.16rem] text-d-black/60'>{t('balance.label')}</div>
                    <div className='text-[18rem] font-semibold text-d-black'>
                      {practiceBalance > 0 ? t('balance.count', { count: practiceBalance }) : t('balance.none')}
                    </div>
                  </div>
                  <button
                    type='button'
                    onClick={handleRetry}
                    className='rounded-[32rem] border border-d-light-gray px-[16rem] py-[8rem] text-[13rem] font-semibold text-d-black transition-all duration-200 hover:-translate-y-[1rem] hover:border-d-black/40'
                  >
                    {t('actions.refresh')}
                  </button>
                </div>
                {balanceError ? <p className='mt-[12rem] text-[12rem] leading-tight text-red-500'>{t('error.balance')}</p> : null}
              </section>
            )}

            <div className='flex flex-col gap-y-[12rem] text-[12rem] leading-tight text-d-black/70'>
              {error ? <p className='rounded-[12rem] bg-red-50 px-[16rem] py-[12rem] text-red-600'>{t('error.subscription')}</p> : null}
              {!hasActiveSubscription && !planName ? <p className='rounded-[12rem] bg-d-light-gray/40 px-[16rem] py-[12rem]'>{t('empty.description')}</p> : null}
            </div>

            {/*<div className='flex flex-col gap-y-[12rem] tablet:flex-row tablet:gap-x-[12rem] tablet:gap-y-0'>*/}
            {/*  <button*/}
            {/*    type='button'*/}
            {/*    onClick={() => {}}*/}
            {/*    className='flex h-[48rem] flex-1 items-center justify-center rounded-full bg-d-green text-[14rem] font-semibold text-black transition-all duration-200 hover:bg-d-green/80 hover:-translate-y-[2rem]'*/}
            {/*  >*/}
            {/*    {t('actions.manage')}*/}
            {/*  </button>*/}
            {/*  <button*/}
            {/*    type='button'*/}
            {/*    onClick={() => {}}*/}
            {/*    className='flex h-[48rem] flex-1 items-center justify-center rounded-full border border-d-light-gray text-[14rem] font-semibold text-d-black transition-all duration-200 hover:border-d-black/40 hover:-translate-y-[2rem]'*/}
            {/*  >*/}
            {/*    {t('actions.history')}*/}
            {/*  </button>*/}
            {/*</div>*/}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
