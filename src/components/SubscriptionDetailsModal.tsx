'use client';

import React from 'react';
import { format, parseISO } from 'date-fns';

import { BottomSheet, BottomSheetContent } from '@/components/ui/bottom-sheet';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useCustomTranslations } from '@/hooks/useCustomTranslations';
import { useSubscription } from '@/hooks/useSubscription';
import { useMediaQuery } from 'usehooks-ts';
import { BottomSheetHeader } from '@/components/mobile/MobilePageHeader';
import { refreshSubscriptionAndBalance } from '@/stores/subscriptionStore';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SubscriptionDetailsModal = ({ open, onOpenChange }: Props) => {
  const isMobile = useMediaQuery('(max-width: 767px)');

  if (isMobile) {
    return (
      <BottomSheet open={open} onOpenChange={onOpenChange}>
        <SubscriptionDetailsMobileContent />
      </BottomSheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='fixed left-[50%] top-[50%] flex w-[90vw] max-w-[520rem] -translate-x-1/2 -translate-y-1/2 flex-col gap-y-[16rem] rounded-[24rem] bg-white p-[32rem] shadow-[0_24rem_48rem_rgba(0,0,0,0.12)] transition-all duration-300'>
        <SubscriptionDetailsContent />
      </DialogContent>
    </Dialog>
  );
};

const useSubscriptionDetailsViewModel = () => {
  const { t } = useCustomTranslations('subscriptionModal');
  const { subscription, status, error, balance, balanceStatus, balanceError, hasActiveSubscription } = useSubscription();

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

  return {
    t,
    title: t('title'),
    description: t('description'),
    isLoading,
    statusLabel,
    planName,
    renewalLabel,
    hasActiveSubscription,
    practiceBalance,
    balanceError,
    error,
    handleRetry,
  };
};

type SubscriptionDetailsViewModel = ReturnType<typeof useSubscriptionDetailsViewModel>;

const SubscriptionDetailsBody = ({ vm, className }: { vm: SubscriptionDetailsViewModel; className?: string }) => {
  if (vm.isLoading) {
    return (
      <div className={cn('flex flex-col gap-y-[16rem]', className)}>
        <Skeleton className='h-[20rem] w-[60%]' />
        <Skeleton className='h-[20rem] w-[50%]' />
        <Skeleton className='h-[20rem] w-[40%]' />
        <Skeleton className='h-[48rem] w-full rounded-[12rem]' />
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col gap-y-[20rem]', className)}>
      <section className='rounded-[16rem] border border-d-light-gray/80 px-[20rem] pt-[20rem]'>
        <dl className='flex flex-col gap-y-[12rem] text-[14rem] text-d-black'>
          <div className='flex items-center justify-between'>
            <dt className='font-medium uppercase tracking-[0.14rem]'>{vm.t('labels.status')}</dt>
            <dd className='font-semibold'>{vm.statusLabel}</dd>
          </div>
          <div className='flex items-center justify-between'>
            <dt className='font-medium uppercase tracking-[0.14rem]'>{vm.t('labels.plan')}</dt>
            <dd className='font-semibold'>{vm.planName ?? vm.t('plan.none')}</dd>
          </div>
          <div className='flex items-center justify-between'>
            <dt className='font-medium uppercase tracking-[0.14rem]'>{vm.t('labels.renewal')}</dt>
            <dd className='text-right font-semibold'>{vm.renewalLabel}</dd>
          </div>
        </dl>
      </section>

      {/*{!vm.hasActiveSubscription && (*/}
      {/*  <section className='rounded-[16rem] border border-d-light-gray/80 p-[20rem]'>*/}
      {/*    <div className='flex items-center justify-between'>*/}
      {/*      <div>*/}
      {/*        <div className='text-[12rem] font-medium uppercase tracking-[0.16rem] text-d-black/60'>{vm.t('balance.label')}</div>*/}
      {/*        <div className='text-[18rem] font-semibold text-d-black'>*/}
      {/*          {vm.practiceBalance > 0 ? vm.t('balance.count', { count: vm.practiceBalance }) : vm.t('balance.none')}*/}
      {/*        </div>*/}
      {/*      </div>*/}
      {/*      <button*/}
      {/*        type='button'*/}
      {/*        onClick={vm.handleRetry}*/}
      {/*        className='rounded-[32rem] border border-d-light-gray px-[16rem] py-[8rem] text-[13rem] font-semibold text-d-black transition-all duration-200 hover:-translate-y-[1rem] hover:border-d-black/40'*/}
      {/*      >*/}
      {/*        {vm.t('actions.refresh')}*/}
      {/*      </button>*/}
      {/*    </div>*/}
      {/*    {vm.balanceError ? <p className='mt-[12rem] text-[12rem] leading-tight text-red-500'>{vm.t('error.balance')}</p> : null}*/}
      {/*  </section>*/}
      {/*)}*/}

      <div className='flex flex-col gap-y-[12rem] text-[12rem] leading-tight text-d-black/70'>
        {vm.error ? <p className='rounded-[12rem] bg-red-50 px-[16rem] py-[12rem] text-red-600'>{vm.t('error.subscription')}</p> : null}
        {!vm.hasActiveSubscription && !vm.planName ? <p className='text-center rounded-[12rem] bg-d-light-gray/40 px-[16rem] py-[12rem]'>{vm.t('empty.description')}</p> : null}
      </div>
    </div>
  );
};

const SubscriptionDetailsMobileContent = () => {
  const vm = useSubscriptionDetailsViewModel();

  return (
    <BottomSheetContent>
      <div className='flex min-h-0 flex-1 flex-col overflow-hidden'>
        <BottomSheetHeader
          title={vm.title}
          subtitle={vm.description}
          closeButton
          closeLabel={vm.t('actions.close', { defaultValue: 'Close' })}
        />
        <ScrollArea className='flex-1 px-[20rem]'>
          <div className='pb-[24rem]'>
            <SubscriptionDetailsBody vm={vm} className='gap-y-[20rem]' />
          </div>
        </ScrollArea>
      </div>
    </BottomSheetContent>
  );
};

export const SubscriptionDetailsContent = () => {
  const vm = useSubscriptionDetailsViewModel();

  return (
    <>
      <DialogHeader className='text-left'>
        <DialogTitle className='text-[24rem] font-semibold leading-tight text-d-black'>{vm.title}</DialogTitle>
        <DialogDescription className='text-[14rem] leading-tight text-d-black/70'>{vm.description}</DialogDescription>
      </DialogHeader>

      <SubscriptionDetailsBody vm={vm} />
    </>
  );
};
