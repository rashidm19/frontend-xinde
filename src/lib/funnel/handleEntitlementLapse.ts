import axios from 'axios';

import { refreshSubscriptionAndBalance, useSubscriptionStore, openSubscriptionPaywall } from '@/stores/subscriptionStore';

// Exact backend strings: practice/views.py:574,823,1026,1315 ; mock/views.py:206
const LAPSE_MESSAGES = new Set<string>([
  'Practice requires active subscription or practice balance',
  'Mock access requires available mock balance',
]);

type Pushable = { push: (href: string) => void };

export async function handleEntitlementLapse(signal: { status?: number; message?: unknown }, router: Pushable): Promise<boolean> {
  if (signal.status !== 400 || typeof signal.message !== 'string' || !LAPSE_MESSAGES.has(signal.message)) {
    return false;
  }
  try {
    await refreshSubscriptionAndBalance();
  } catch {
    // refresh failure is non-fatal; fall through with current flags
  }
  const { hasActiveSubscription, hasPracticeCredits, hasMockCredits } = useSubscriptionStore.getState();
  if (hasActiveSubscription || hasPracticeCredits || hasMockCredits) {
    openSubscriptionPaywall();
  } else {
    router.push('/paywall');
  }
  return true;
}

export async function handleEntitlementLapseFromError(error: unknown, router: Pushable): Promise<boolean> {
  if (!axios.isAxiosError(error)) return false;
  const data = error.response?.data as { message?: unknown } | undefined;
  return handleEntitlementLapse({ status: error.response?.status, message: data?.message }, router);
}
