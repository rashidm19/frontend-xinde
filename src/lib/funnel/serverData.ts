import 'server-only';
import { cache } from 'react';

import { getMe } from '@/lib/auth/getMe';
import { getSubscription } from '@/lib/subscription/getSubscription';
import { getBalance } from '@/lib/subscription/getBalance';

// Single shared references so the parent (protected) layout and the child gate
// layouts share one backend round-trip per request.
export const getMeCached = cache(getMe);
export const getSubscriptionCached = cache(getSubscription);
export const getBalanceCached = cache(getBalance);
