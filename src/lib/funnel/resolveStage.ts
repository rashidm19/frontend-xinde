import { computeHasActiveSubscription, computeBalanceFlags } from '@/lib/subscription/derive';
import type { IBillingBalance, IClientSubscription } from '@/types/Billing';
import type { User } from '@/types/types';

export type FunnelStage = 'unauthenticated' | 'onboarding' | 'paywall' | 'app';

export function isEntitled(subscription: IClientSubscription | null, balance: IBillingBalance | null): boolean {
  const { hasPracticeCredits, hasMockCredits } = computeBalanceFlags(balance);
  return computeHasActiveSubscription(subscription) || hasPracticeCredits || hasMockCredits;
}

export interface FunnelStageInput {
  me: User | null;
  subscription: IClientSubscription | null;
  balance: IBillingBalance | null;
}

export function resolveFunnelStage({ me, subscription, balance }: FunnelStageInput): FunnelStage {
  if (!me) return 'unauthenticated';
  if (!me.onboarding_completed) return 'onboarding';
  if (!isEntitled(subscription, balance)) return 'paywall';
  return 'app';
}
