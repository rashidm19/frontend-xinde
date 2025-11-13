import type { IBillingBalance, IClientSubscription } from '@/types/Billing';

export const computeHasActiveSubscription = (subscription: IClientSubscription | null): boolean => {
  if (!subscription) {
    return false;
  }

  const status = typeof subscription.status === 'string' ? subscription.status.toLowerCase() : '';
  const activeStatuses = new Set(['active', 'trialing', 'pending_cancel']);

  if (!activeStatuses.has(status)) {
    return false;
  }

  if (!subscription.current_period_end) {
    return false;
  }

  const periodEnd = new Date(subscription.current_period_end);

  if (Number.isNaN(periodEnd.getTime())) {
    return false;
  }

  return periodEnd.getTime() >= Date.now();
};

export const computeBalanceFlags = (balance: IBillingBalance | null) => ({
  hasPracticeCredits: (balance?.practice_balance ?? 0) > 0,
  hasMockCredits: (balance?.mock_balance ?? 0) > 0,
});

export const EMPTY_BALANCE: IBillingBalance = {
  tenge_balance: 0,
  mock_balance: 0,
  practice_balance: 0,
};
