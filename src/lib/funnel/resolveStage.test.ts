import { describe, it, expect } from 'vitest';
import { resolveFunnelStage, isEntitled } from './resolveStage';
import type { User } from '@/types/types';
import type { IClientSubscription, IBillingBalance } from '@/types/Billing';

const me = (over: Partial<User> = {}): User =>
  ({ id: 1, email: 'a@b.c', name: 'A', onboarding_completed: true, balance: 0, mock_balance: 0, practice_balance: 0, gotFreeWelcomeTest: false, ...over }) as User;

const activeSub = (): IClientSubscription =>
  ({ id: 1, status: 'active', current_period_start: null, current_period_end: new Date(Date.now() + 86_400_000).toISOString(), cancel_at_period_end: false, plan: null });

const bal = (over: Partial<IBillingBalance> = {}): IBillingBalance => ({ tenge_balance: 0, mock_balance: 0, practice_balance: 0, ...over });

describe('resolveFunnelStage', () => {
  it('unauthenticated when no me', () => {
    expect(resolveFunnelStage({ me: null, subscription: null, balance: null })).toBe('unauthenticated');
  });
  it('onboarding when not completed', () => {
    expect(resolveFunnelStage({ me: me({ onboarding_completed: false }), subscription: activeSub(), balance: bal() })).toBe('onboarding');
  });
  it('paywall when onboarded but not entitled', () => {
    expect(resolveFunnelStage({ me: me(), subscription: null, balance: bal() })).toBe('paywall');
  });
  it('app when entitled via active subscription', () => {
    expect(resolveFunnelStage({ me: me(), subscription: activeSub(), balance: bal() })).toBe('app');
  });
  it('app when entitled via practice credits', () => {
    expect(resolveFunnelStage({ me: me(), subscription: null, balance: bal({ practice_balance: 1 }) })).toBe('app');
  });
  it('app when entitled via mock credits', () => {
    expect(resolveFunnelStage({ me: me(), subscription: null, balance: bal({ mock_balance: 1 }) })).toBe('app');
  });
});

describe('isEntitled', () => {
  it('false for no sub and zero credits', () => {
    expect(isEntitled(null, bal())).toBe(false);
  });
});
