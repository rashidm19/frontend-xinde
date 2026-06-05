import { describe, it, expect, vi, beforeEach } from 'vitest';

const refreshMock = vi.fn().mockResolvedValue(undefined);
const openPaywallMock = vi.fn();
let flags = { hasActiveSubscription: false, hasPracticeCredits: false, hasMockCredits: false };

vi.mock('@/stores/subscriptionStore', () => ({
  refreshSubscriptionAndBalance: () => refreshMock(),
  openSubscriptionPaywall: () => openPaywallMock(),
  useSubscriptionStore: { getState: () => flags },
}));

import { handleEntitlementLapse } from './handleEntitlementLapse';

const PRACTICE = 'Practice requires active subscription or practice balance';

beforeEach(() => {
  refreshMock.mockClear();
  openPaywallMock.mockClear();
  flags = { hasActiveSubscription: false, hasPracticeCredits: false, hasMockCredits: false };
});

describe('handleEntitlementLapse', () => {
  it('ignores a non-lapse 400 (returns false, no nav)', async () => {
    const router = { push: vi.fn() };
    expect(await handleEntitlementLapse({ status: 400, message: 'Unsupported part value' }, router)).toBe(false);
    expect(router.push).not.toHaveBeenCalled();
    expect(openPaywallMock).not.toHaveBeenCalled();
  });

  it('routes a genuinely-unentitled user to /paywall', async () => {
    const router = { push: vi.fn() };
    flags = { hasActiveSubscription: false, hasPracticeCredits: false, hasMockCredits: false };
    expect(await handleEntitlementLapse({ status: 400, message: PRACTICE }, router)).toBe(true);
    expect(router.push).toHaveBeenCalledWith('/paywall');
    expect(openPaywallMock).not.toHaveBeenCalled();
  });

  it('opens the voluntary modal (no wall bounce) when still entitled via other credits', async () => {
    const router = { push: vi.fn() };
    flags = { hasActiveSubscription: false, hasPracticeCredits: false, hasMockCredits: true };
    expect(await handleEntitlementLapse({ status: 400, message: PRACTICE }, router)).toBe(true);
    expect(openPaywallMock).toHaveBeenCalledTimes(1);
    expect(router.push).not.toHaveBeenCalled();
  });
});
