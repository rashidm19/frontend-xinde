import { cookies, headers } from 'next/headers';

import { API_URL } from '@/lib/config';
import type { ISubscriptionPlan } from '@/types/Billing';

const PLANS_ENDPOINT = '/billing/subscriptions/plans';
const AUTHORIZATION_HEADER = 'authorization';
const TOKEN_COOKIE_NAME = 'token';
const REQUEST_TIMEOUT_MS = 3000;

const buildAuthHeader = (authorizationHeader: string | null, tokenFromCookie: string | undefined) => {
  if (authorizationHeader && authorizationHeader.trim().length > 0) {
    return authorizationHeader;
  }

  if (tokenFromCookie && tokenFromCookie.trim().length > 0) {
    return `Bearer ${tokenFromCookie}`;
  }

  return null;
};

const unwrapData = <T>(payload: unknown): T | null => {
  if (payload === null || payload === undefined) {
    return null;
  }

  if (typeof payload === 'object' && 'data' in (payload as Record<string, unknown>)) {
    return unwrapData<T>((payload as { data?: unknown }).data);
  }

  return payload as T;
};

/**
 * Server-side fetch of subscription plans, used to PREFETCH the
 * `['/billing/subscriptions/plans']` query for the gated /paywall route so the
 * page renders the full plan set on first paint (no client-fetch flash).
 *
 * Returns `null` on missing auth / any failure so the caller can skip seeding
 * the query and let the client `useQuery` fetch normally (graceful fallback).
 * Never throws — the paywall must not 503 just because plan prefetch failed.
 */
export const getPlans = async (): Promise<ISubscriptionPlan[] | null> => {
  const incomingHeaders = headers();
  const cookieStore = cookies();

  const cookieHeader = incomingHeaders.get('cookie');
  const authorizationHeader = incomingHeaders.get(AUTHORIZATION_HEADER);
  const tokenFromCookie = cookieStore.get(TOKEN_COOKIE_NAME)?.value;

  const authHeader = buildAuthHeader(authorizationHeader, tokenFromCookie);

  const requestHeaders = new Headers({ Accept: 'application/json' });

  if (cookieHeader) {
    requestHeaders.set('Cookie', cookieHeader);
  } else if (tokenFromCookie) {
    requestHeaders.set('Cookie', `${TOKEN_COOKIE_NAME}=${tokenFromCookie}`);
  }

  if (authHeader) {
    requestHeaders.set('Authorization', authHeader);
  }

  const endpointUrl = new URL(PLANS_ENDPOINT, API_URL);
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(endpointUrl, {
      method: 'GET',
      headers: requestHeaders,
      cache: 'no-store',
      credentials: 'include',
      signal: controller.signal,
    });

    if (!response.ok) {
      return null;
    }

    const payload = await response.json().catch(() => null);
    const plans = unwrapData<ISubscriptionPlan[]>(payload);

    return Array.isArray(plans) ? plans : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
};
