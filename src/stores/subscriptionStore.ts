import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import axios from 'axios';

import { cancelSubscription, fetchBillingBalance, fetchCurrentSubscription, resumeSubscription } from '@/api/subscriptions';
import { IBillingBalance, IClientSubscription } from '@/types/Billing';

type SubscriptionFetchStatus = 'idle' | 'loading' | 'success' | 'error';
type AccessRequirement = 'subscription' | 'practice' | 'mock';

interface SubscriptionStore {
  subscription: IClientSubscription | null;
  status: SubscriptionFetchStatus;
  error: string | null;
  hasActiveSubscription: boolean;
  balance: IBillingBalance | null;
  balanceStatus: SubscriptionFetchStatus;
  balanceError: string | null;
  hasPracticeCredits: boolean;
  hasMockCredits: boolean;
  isPaywallOpen: boolean;
  fetchSubscription: (force?: boolean) => Promise<IClientSubscription | null>;
  setSubscription: (subscription: IClientSubscription | null) => void;
  fetchBalance: (force?: boolean) => Promise<IBillingBalance | null>;
  setBalance: (balance: IBillingBalance | null) => void;
  cancelCurrentSubscription: () => Promise<IClientSubscription | null>;
  resumeCurrentSubscription: () => Promise<IClientSubscription | null>;
  refreshSubscriptionAndBalance: () => Promise<void>;
  ensureAccess: (requirement?: AccessRequirement) => Promise<boolean>;
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

const computeBalanceFlags = (balance: IBillingBalance | null) => ({
  hasPracticeCredits: (balance?.practice_balance ?? 0) > 0,
  hasMockCredits: (balance?.mock_balance ?? 0) > 0,
});

const EMPTY_BALANCE: IBillingBalance = {
  tenge_balance: 0,
  mock_balance: 0,
  practice_balance: 0,
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
      balance: null,
      balanceStatus: 'idle',
      balanceError: null,
      hasPracticeCredits: false,
      hasMockCredits: false,
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
      fetchBalance: async (force = false) => {
        const balanceStatus = get().balanceStatus;

        if (!force && (balanceStatus === 'loading' || balanceStatus === 'success')) {
          return get().balance;
        }

        if (typeof window !== 'undefined') {
          const token = localStorage.getItem('token');
          if (!token) {
            const flags = computeBalanceFlags(EMPTY_BALANCE);
            set({ balance: EMPTY_BALANCE, balanceStatus: 'success', balanceError: null, ...flags });
            return EMPTY_BALANCE;
          }
        }

        set({ balanceStatus: 'loading', balanceError: null });

        try {
          const balance = await fetchBillingBalance();
          const flags = computeBalanceFlags(balance);
          set({ balance, balanceStatus: 'success', balanceError: null, ...flags });
          return balance;
        } catch (error) {
          if (axios.isAxiosError(error)) {
            const statusCode = error.response?.status;
            if (statusCode === 401 || statusCode === 404) {
              const flags = computeBalanceFlags(null);
              set({ balance: null, balanceStatus: 'success', balanceError: null, ...flags });
              return null;
            }
          }

          const flags = computeBalanceFlags(null);
          set({ balanceStatus: 'error', balanceError: parseError(error), balance: null, ...flags });
          throw error;
        }
      },
      setBalance: balance => {
        const flags = computeBalanceFlags(balance);
        set({ balance, balanceStatus: 'success', balanceError: null, ...flags });
      },
      cancelCurrentSubscription: async () => {
        set({ status: 'loading', error: null });
        try {
          const subscription = await cancelSubscription();
          const hasActiveSubscription = computeHasActiveSubscription(subscription);
          set({ subscription, hasActiveSubscription, status: 'success', error: null });
          await get().fetchBalance(true);
          return subscription;
        } catch (error) {
          set({ status: 'error', error: parseError(error) });
          throw error;
        }
      },
      resumeCurrentSubscription: async () => {
        set({ status: 'loading', error: null });
        try {
          const subscription = await resumeSubscription();
          const hasActiveSubscription = computeHasActiveSubscription(subscription);
          set({ subscription, hasActiveSubscription, status: 'success', error: null });
          await get().fetchBalance(true);
          return subscription;
        } catch (error) {
          set({ status: 'error', error: parseError(error) });
          throw error;
        }
      },
      refreshSubscriptionAndBalance: async () => {
        await Promise.all([get().fetchSubscription(true), get().fetchBalance(true)]);
      },
      ensureAccess: async (requirement: AccessRequirement = 'practice') => {
        try {
          const [subscription, balance] = await Promise.all([
            get().fetchSubscription(true),
            get().fetchBalance(true),
          ]);

          const hasActiveSubscription = computeHasActiveSubscription(subscription);
          const balanceFlags = computeBalanceFlags(balance);
          set({ hasActiveSubscription, ...balanceFlags });

          let hasAccess = false;

          if (requirement === 'mock') {
            hasAccess = balanceFlags.hasMockCredits;
          } else if (requirement === 'subscription') {
            hasAccess = hasActiveSubscription;
          } else {
            hasAccess = hasActiveSubscription || balanceFlags.hasPracticeCredits;
          }

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
          balance: null,
          balanceStatus: 'idle',
          balanceError: null,
          hasPracticeCredits: false,
          hasMockCredits: false,
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

export const fetchBalanceOnce = () => useSubscriptionStore.getState().fetchBalance();

export const refreshBalance = () => useSubscriptionStore.getState().fetchBalance(true);

export const refreshSubscriptionAndBalance = () => useSubscriptionStore.getState().refreshSubscriptionAndBalance();

export const cancelActiveSubscription = () => useSubscriptionStore.getState().cancelCurrentSubscription();

export const resumeActiveSubscription = () => useSubscriptionStore.getState().resumeCurrentSubscription();

export const ensureSubscriptionAccess = (requirement?: 'subscription' | 'practice' | 'mock') =>
  useSubscriptionStore.getState().ensureAccess(requirement);

export const openSubscriptionPaywall = () => useSubscriptionStore.getState().openPaywall();

export const closeSubscriptionPaywall = () => useSubscriptionStore.getState().closePaywall();

export const setSubscriptionPaywallOpen = (open: boolean) => useSubscriptionStore.getState().setPaywallOpen(open);

export const resetSubscriptionStore = () => useSubscriptionStore.getState().reset();
