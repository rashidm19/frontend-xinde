'use server';

import { cookies, headers } from 'next/headers';

import { API_URL } from '@/lib/config';
import { UpstreamServiceError } from '@/lib/api/errors';
import type { IClientSubscription, ISubscriptionPlan } from '@/types/Billing';

const SUBSCRIPTION_ENDPOINT = '/billing/subscriptions/current';
const AUTHORIZATION_HEADER = 'authorization';
const TOKEN_COOKIE_NAME = 'token';
const REQUEST_TIMEOUT_MS = 3000;

const unwrapData = <T>(payload: unknown): T | null => {
  if (payload === null || payload === undefined) {
    return null;
  }

  if (typeof payload === 'object' && 'data' in (payload as Record<string, unknown>)) {
    return unwrapData<T>((payload as { data?: unknown }).data);
  }

  return payload as T;
};

const normalizeSubscription = (subscription: IClientSubscription | null): IClientSubscription | null => {
  if (!subscription) {
    return null;
  }

  const plan: ISubscriptionPlan | null = (subscription.plan ?? subscription.subscription_plan) ?? null;

  return {
    ...subscription,
    cancel_at_period_end: Boolean(subscription.cancel_at_period_end),
    current_period_start: subscription.current_period_start ?? null,
    current_period_end: subscription.current_period_end ?? null,
    plan,
    subscription_plan: plan,
  } as IClientSubscription;
};

export const getSubscription = async (): Promise<IClientSubscription | null> => {
  const incomingHeaders = headers();
  const cookieStore = cookies();

  const cookieHeader = incomingHeaders.get('cookie');
  const authorizationHeader = incomingHeaders.get(AUTHORIZATION_HEADER);
  const userAgentHeader = incomingHeaders.get('user-agent');
  const forwardedForHeader = incomingHeaders.get('x-forwarded-for');
  const tokenFromCookie = cookieStore.get(TOKEN_COOKIE_NAME)?.value;

  if (!cookieHeader && !tokenFromCookie && !authorizationHeader) {
    return null;
  }

  const requestHeaders = new Headers({ Accept: 'application/json' });

  if (cookieHeader) {
    requestHeaders.set('Cookie', cookieHeader);
  } else if (tokenFromCookie) {
    requestHeaders.set('Cookie', `${TOKEN_COOKIE_NAME}=${tokenFromCookie}`);
  }

  if (authorizationHeader) {
    requestHeaders.set('Authorization', authorizationHeader);
  }

  if (userAgentHeader) {
    requestHeaders.set('User-Agent', userAgentHeader);
  }

  if (forwardedForHeader) {
    requestHeaders.set('X-Forwarded-For', forwardedForHeader);
  }

  const endpointUrl = new URL(SUBSCRIPTION_ENDPOINT, API_URL);
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(endpointUrl, {
      method: 'GET',
      headers: requestHeaders,
      cache: 'no-store',
      credentials: 'include',
      signal: controller.signal,
    });

    if (response.status === 204) {
      return null;
    }

    if (!response.ok) {
      if (response.status >= 500) {
        throw UpstreamServiceError.fromStatus(response.status, 'Failed to fetch subscription');
      }

      return null;
    }

    const payload = await response
      .json()
      .catch(() => null);

    const subscription = unwrapData<IClientSubscription>(payload);

    return normalizeSubscription(subscription ?? null);
  } catch (error) {
    if (error instanceof UpstreamServiceError) {
      throw error;
    }

    console.error('Failed to fetch subscription', error);
    throw UpstreamServiceError.fromStatus(503, 'Subscription service unavailable');
  } finally {
    clearTimeout(timeoutId);
  }
};
