import axiosInstance from '@/lib/axiosInstance';
import { IClientSubscription, ISubscriptionPlan } from '@/types/Billing';

const CURRENT_SUBSCRIPTION_ENDPOINT = '/billing/subscriptions/current';
const SUBSCRIPTION_PLANS_ENDPOINT = '/billing/subscriptions/plans';

type ApiPayload<T> = { data?: T } | T | null | undefined;

const unwrapData = <T>(payload: ApiPayload<T>): T | null => {
  if (payload === null || payload === undefined) {
    return null;
  }

  if (typeof payload === 'object' && 'data' in (payload as Record<string, unknown>)) {
    return unwrapData<T>((payload as { data?: T }).data ?? null);
  }

  return payload as T;
};

const normalizeSubscription = (subscription: IClientSubscription | null): IClientSubscription | null => {
  if (!subscription) {
    return null;
  }

  const plan = (subscription.plan ?? subscription.subscription_plan) ?? null;

  return {
    ...subscription,
    cancel_at_period_end: Boolean(subscription.cancel_at_period_end),
    current_period_end: subscription.current_period_end ?? null,
    current_period_start: subscription.current_period_start ?? null,
    plan,
    subscription_plan: plan,
  } as IClientSubscription;
};

export const fetchCurrentSubscription = async (): Promise<IClientSubscription | null> => {
  const response = await axiosInstance.get(CURRENT_SUBSCRIPTION_ENDPOINT, {
    validateStatus: status => status === 200 || status === 204,
  });

  if (response.status === 204) {
    return null;
  }

  const payload = unwrapData<IClientSubscription>(response.data);

  return normalizeSubscription(payload ?? null);
};

export const fetchSubscriptionPlans = async (): Promise<ISubscriptionPlan[]> => {
  const response = await axiosInstance.get(SUBSCRIPTION_PLANS_ENDPOINT);

  const payload = unwrapData<ISubscriptionPlan[]>(response.data);

  if (!payload) {
    return [];
  }

  if (Array.isArray(payload)) {
    return payload;
  }

  return [];
};
