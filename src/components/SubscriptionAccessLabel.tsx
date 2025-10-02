'use client';

import { useTranslations } from 'next-intl';

import { cn } from '@/lib/utils';

interface SubscriptionAccessLabelProps {
  className?: string;
}

export const SubscriptionAccessLabel = ({ className }: SubscriptionAccessLabelProps) => {
  const t = useTranslations('subscription');

  return <p className={cn('text-[12rem] font-medium uppercase tracking-wide text-d-black/60', className)}>{t('availableLabel')}</p>;
};
