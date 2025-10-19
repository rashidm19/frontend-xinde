'use client';

// import { useLeaveConfirmation } from '@/hooks/useLeaveConfirmation';
import { useCustomTranslations } from '@/hooks/useCustomTranslations';
import React from 'react';

type Props = {
  enabled?: boolean;
  children: React.ReactNode;
};

export function PracticeLeaveGuard({ enabled = true, children }: Props) {
  const { t } = useCustomTranslations('practice.common');

  // useLeaveConfirmation({ message: t('leaveConfirmation'), enabled });

  return <>{children}</>;
}
