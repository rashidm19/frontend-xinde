
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import axios from 'axios';

import { cancelSubscription, fetchBillingBalance, fetchCurrentSubscription, resumeSubscription } from '@/api/subscriptions';
import { BALANCE_QUERY_KEY, SUBSCRIPTION_QUERY_KEY } from '@/lib/queryKeys';
import { queryClient } from '@/lib/queryClient';
import type { IBillingBalance, IClientSubscription } from '@/types/Billing';
import { computeBalanceFlags, computeHasActiveSubscription, EMPTY_BALANCE } from '@/lib/subscription/derive';

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
  setSubscription: (subscription: IClientSubscription | null) => void;
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
      setSubscription: subscription => {
        set({
          subscription,
          hasActiveSubscription: computeHasActiveSubscription(subscription),
          status: 'success',
          error: null,
        });
      },
      setBalance: balance => {
        const flags = computeBalanceFlags(balance);
        set({ balance, balanceStatus: 'success', balanceError: null, ...flags });
      },
      cancelCurrentSubscription: async () => {
        set({ status: 'loading', error: null });
        try {
          const subscription = await cancelSubscription();
          queryClient.setQueryData(SUBSCRIPTION_QUERY_KEY, subscription ?? null);
          set({
            subscription,
            hasActiveSubscription: computeHasActiveSubscription(subscription),
            status: 'success',
            error: null,
          });
          await get().refreshSubscriptionAndBalance();
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
          queryClient.setQueryData(SUBSCRIPTION_QUERY_KEY, subscription ?? null);
          set({
            subscription,
            hasActiveSubscription: computeHasActiveSubscription(subscription),
            status: 'success',
            error: null,
          });
          await get().refreshSubscriptionAndBalance();
          return subscription;
        } catch (error) {
          set({ status: 'error', error: parseError(error) });
          throw error;
        }
      },
      refreshSubscriptionAndBalance: async () => {
        set({
          status: 'loading',
          error: null,
          balanceStatus: 'loading',
          balanceError: null,
        });

        await Promise.all([
          queryClient.invalidateQueries({ queryKey: SUBSCRIPTION_QUERY_KEY, exact: true, refetchType: 'none' }),
          queryClient.invalidateQueries({ queryKey: BALANCE_QUERY_KEY, exact: true, refetchType: 'none' }),
        ]);

        const [subscriptionResult, balanceResult] = await Promise.allSettled([
          queryClient.fetchQuery({
            queryKey: SUBSCRIPTION_QUERY_KEY,
            queryFn: fetchCurrentSubscription,
          }),
          queryClient.fetchQuery({
            queryKey: BALANCE_QUERY_KEY,
            queryFn: fetchBillingBalance,
          }),
        ]);

        let subscription: IClientSubscription | null = null;
        let subscriptionStatus: SubscriptionFetchStatus = 'success';
        let subscriptionError: string | null = null;
        let firstError: unknown = null;

        if (subscriptionResult.status === 'fulfilled') {
          subscription = subscriptionResult.value;
          queryClient.setQueryData(SUBSCRIPTION_QUERY_KEY, subscription ?? null);
        } else {
          const reason = subscriptionResult.reason;
          if (axios.isAxiosError(reason)) {
            const statusCode = reason.response?.status;
            if (statusCode === 401 || statusCode === 404) {
              subscription = null;
            } else {
              subscriptionStatus = 'error';
              subscriptionError = parseError(reason);
              firstError = firstError ?? reason;
            }
          } else {
            subscriptionStatus = 'error';
            subscriptionError = parseError(reason);
            firstError = firstError ?? reason;
          }
        }

        let balance: IBillingBalance | null = null;
        let balanceStatus: SubscriptionFetchStatus = 'success';
        let balanceError: string | null = null;

        if (balanceResult.status === 'fulfilled') {
          balance = balanceResult.value ?? EMPTY_BALANCE;
          queryClient.setQueryData(BALANCE_QUERY_KEY, balance);
        } else {
          const reason = balanceResult.reason;
          if (axios.isAxiosError(reason)) {
            const statusCode = reason.response?.status;
            if (statusCode === 401 || statusCode === 404) {
              balance = EMPTY_BALANCE;
            } else {
              balanceStatus = 'error';
              balanceError = parseError(reason);
              firstError = firstError ?? reason;
            }
          } else {
            balanceStatus = 'error';
            balanceError = parseError(reason);
            firstError = firstError ?? reason;
          }
        }

        const hasActiveSubscription = computeHasActiveSubscription(subscription);
        const balanceFlags = computeBalanceFlags(balance);

        set({
          subscription,
          status: subscriptionStatus,
          error: subscriptionError,
          hasActiveSubscription,
          balance,
          balanceStatus,
          balanceError,
          ...balanceFlags,
        });

        if (firstError) {
          throw firstError;
        }
      },
      ensureAccess: async (requirement: AccessRequirement = 'practice') => {
        const subscriptionFromCache = queryClient.getQueryData<IClientSubscription | null>(SUBSCRIPTION_QUERY_KEY);
        const balanceFromCache = queryClient.getQueryData<IBillingBalance | null>(BALANCE_QUERY_KEY);

        const subscription = subscriptionFromCache ?? null;
        const balance = balanceFromCache ?? null;

        const hasActiveSubscription = computeHasActiveSubscription(subscription);
        const balanceFlags = computeBalanceFlags(balance);

        set({
          subscription,
          hasActiveSubscription,
          status: 'success',
          error: null,
          balance,
          balanceStatus: 'success',
          balanceError: null,
          ...balanceFlags,
        });

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

export const refreshSubscriptionAndBalance = () => useSubscriptionStore.getState().refreshSubscriptionAndBalance();

export const cancelActiveSubscription = () => useSubscriptionStore.getState().cancelCurrentSubscription();

export const resumeActiveSubscription = () => useSubscriptionStore.getState().resumeCurrentSubscription();

export const ensureSubscriptionAccess = (requirement?: 'subscription' | 'practice' | 'mock') =>
  useSubscriptionStore.getState().ensureAccess(requirement);

export const openSubscriptionPaywall = () => useSubscriptionStore.getState().openPaywall();

export const closeSubscriptionPaywall = () => useSubscriptionStore.getState().closePaywall();

export const setSubscriptionPaywallOpen = (open: boolean) => useSubscriptionStore.getState().setPaywallOpen(open);

export const resetSubscriptionStore = () => useSubscriptionStore.getState().reset();
