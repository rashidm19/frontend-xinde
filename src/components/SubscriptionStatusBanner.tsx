'use client';

import { useMemo } from 'react';
import { useLocale, useTranslations } from 'next-intl';

import { formatDateTime } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import { useSubscriptionStore } from '@/stores/subscriptionStore';

interface SubscriptionStatusBannerProps {
  className?: string;
}

export const SubscriptionStatusBanner = ({ className }: SubscriptionStatusBannerProps = {}) => {
  const subscription = useSubscriptionStore(state => state.subscription);
  const t = useTranslations('subscription');
  const locale = useLocale();

  const warningMessage = useMemo(() => {
    if (!subscription?.cancel_at_period_end) {
      return null;
    }

    if (!subscription.current_period_end) {
      return null;
    }

    const formattedDate = formatDateTime(subscription.current_period_end, locale, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });

    if (!formattedDate) {
      return null;
    }

    return t('cancelWarning', { date: formattedDate });
  }, [subscription, locale, t]);

  if (!warningMessage) {
    return null;
  }

  return <div className={cn('rounded-[16rem] border border-d-yellow bg-d-yellow-secondary/40 px-[20rem] py-[16rem] text-[14rem] font-medium leading-tight text-d-black shadow-sm', className)}>{warningMessage}</div>;
};
