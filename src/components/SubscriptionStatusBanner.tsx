'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';

import { cn } from '@/lib/utils';
import { useSubscriptionStore } from '@/stores/subscriptionStore';

interface SubscriptionStatusBannerProps {
  className?: string;
}

export const SubscriptionStatusBanner = ({ className }: SubscriptionStatusBannerProps = {}) => {
  const subscription = useSubscriptionStore(state => state.subscription);
  const t = useTranslations('subscription');

  const warningMessage = useMemo(() => {
    if (!subscription?.cancel_at_period_end) {
      return null;
    }

    if (!subscription.current_period_end) {
      return null;
    }

    const periodEnd = new Date(subscription.current_period_end);

    if (Number.isNaN(periodEnd.getTime())) {
      return null;
    }

    const formattedDate = new Intl.DateTimeFormat(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(periodEnd);

    return t('cancelWarning', { date: formattedDate });
  }, [subscription, t]);

  if (!warningMessage) {
    return null;
  }

  return <div className={cn('rounded-[16rem] border border-d-yellow bg-d-yellow-secondary/40 px-[20rem] py-[16rem] text-[14rem] font-medium leading-tight text-d-black shadow-sm', className)}>{warningMessage}</div>;
};
