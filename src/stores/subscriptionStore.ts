import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import axios from 'axios';

import { fetchCurrentSubscription } from '@/api/subscriptions';
import { IClientSubscription } from '@/types/Billing';

type SubscriptionFetchStatus = 'idle' | 'loading' | 'success' | 'error';

interface SubscriptionStore {
  subscription: IClientSubscription | null;
  status: SubscriptionFetchStatus;
  error: string | null;
  hasActiveSubscription: boolean;
  isPaywallOpen: boolean;
  fetchSubscription: (force?: boolean) => Promise<IClientSubscription | null>;
  setSubscription: (subscription: IClientSubscription | null) => void;
  ensureAccess: () => Promise<boolean>;
  openPaywall: () => void;
  closePaywall: () => void;
  setPaywallOpen: (open: boolean) => void;
  reset: () => void;
}

const computeHasActiveSubscription = (subscription: IClientSubscription | null): boolean => {
  if (!subscription) {
    return false;
  }

  const status = typeof subscription.status === 'string' ? subscription.status.toLowerCase() : '';

  if (status !== 'active') {
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

const parseError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message ?? error.message;
    return typeof message === 'string' && message.length > 0 ? message : 'Request failed';
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Unknown error';
};

export const useSubscriptionStore = create<SubscriptionStore>()(
  devtools(
    (set, get) => ({
      subscription: null,
      status: 'idle',
      error: null,
      hasActiveSubscription: false,
      isPaywallOpen: false,
      fetchSubscription: async (force = false) => {
        const { status } = get();

        if (!force && (status === 'loading' || status === 'success')) {
          return get().subscription;
        }

        if (typeof window !== 'undefined') {
          const token = localStorage.getItem('token');
          if (!token) {
            set({ subscription: null, hasActiveSubscription: false, status: 'success', error: null });
            return null;
          }
        }

        set({ status: 'loading', error: null });

        try {
          const subscription = await fetchCurrentSubscription();
          const hasActiveSubscription = computeHasActiveSubscription(subscription);
          set({ subscription, hasActiveSubscription, status: 'success', error: null });
          return subscription;
        } catch (error) {
          if (axios.isAxiosError(error)) {
            const statusCode = error.response?.status;
            if (statusCode === 401 || statusCode === 404) {
              set({ subscription: null, hasActiveSubscription: false, status: 'success', error: null });
              return null;
            }
          }

          set({ status: 'error', error: parseError(error), subscription: null, hasActiveSubscription: false });
          throw error;
        }
      },
      setSubscription: subscription => {
        set({
          subscription,
          hasActiveSubscription: computeHasActiveSubscription(subscription),
          status: 'success',
          error: null,
        });
      },
      ensureAccess: async () => {
        try {
          const subscription = await get().fetchSubscription(true);
          const hasAccess = computeHasActiveSubscription(subscription);

          if (!hasAccess) {
            set({ isPaywallOpen: true });
          }

          return hasAccess;
        } catch (error) {
          set({ isPaywallOpen: true });
          return false;
        }
      },
      openPaywall: () => set({ isPaywallOpen: true }),
      closePaywall: () => set({ isPaywallOpen: false }),
      setPaywallOpen: open => set({ isPaywallOpen: open }),
      reset: () =>
        set({
          subscription: null,
          status: 'idle',
          error: null,
          hasActiveSubscription: false,
          isPaywallOpen: false,
        }),
    }),
    {
      name: 'subscription-store',
      anonymousActionType: 'SUBSCRIPTION_STORE',
    }
  )
);

export const fetchSubscriptionOnce = () => useSubscriptionStore.getState().fetchSubscription();

export const refreshSubscription = () => useSubscriptionStore.getState().fetchSubscription(true);

export const ensureSubscriptionAccess = () => useSubscriptionStore.getState().ensureAccess();

export const openSubscriptionPaywall = () => useSubscriptionStore.getState().openPaywall();

export const closeSubscriptionPaywall = () => useSubscriptionStore.getState().closePaywall();

export const setSubscriptionPaywallOpen = (open: boolean) => useSubscriptionStore.getState().setPaywallOpen(open);

export const resetSubscriptionStore = () => useSubscriptionStore.getState().reset();
