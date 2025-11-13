'use server';

import { cookies, headers } from 'next/headers';

import { API_URL } from '@/lib/config';
import { UpstreamServiceError } from '@/lib/api/errors';
import type { IBillingBalance } from '@/types/Billing';

const BALANCE_ENDPOINT = '/billing/balance';
const AUTHORIZATION_HEADER = 'authorization';
const TOKEN_COOKIE_NAME = 'token';
const REQUEST_TIMEOUT_MS = 3000;

const EMPTY_BALANCE: IBillingBalance = {
  tenge_balance: 0,
  mock_balance: 0,
  practice_balance: 0,
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

const normalizeBalance = (balance: IBillingBalance | null): IBillingBalance => {
  if (!balance) {
    return EMPTY_BALANCE;
  }

  return {
    tenge_balance: typeof balance.tenge_balance === 'number' ? balance.tenge_balance : 0,
    mock_balance: typeof balance.mock_balance === 'number' ? balance.mock_balance : 0,
    practice_balance: typeof balance.practice_balance === 'number' ? balance.practice_balance : 0,
  } satisfies IBillingBalance;
};

export const getBalance = async (): Promise<IBillingBalance> => {
  const incomingHeaders = headers();
  const cookieStore = cookies();

  const cookieHeader = incomingHeaders.get('cookie');
  const authorizationHeader = incomingHeaders.get(AUTHORIZATION_HEADER);
  const userAgentHeader = incomingHeaders.get('user-agent');
  const forwardedForHeader = incomingHeaders.get('x-forwarded-for');
  const tokenFromCookie = cookieStore.get(TOKEN_COOKIE_NAME)?.value;

  if (!cookieHeader && !tokenFromCookie && !authorizationHeader) {
    return EMPTY_BALANCE;
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

  const endpointUrl = new URL(BALANCE_ENDPOINT, API_URL);
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
      return EMPTY_BALANCE;
    }

    if (!response.ok) {
      if (response.status >= 500) {
        throw UpstreamServiceError.fromStatus(response.status, 'Failed to fetch balance');
      }

      return EMPTY_BALANCE;
    }

    const payload = await response
      .json()
      .catch(() => null);

    const balance = unwrapData<IBillingBalance>(payload);

    return normalizeBalance(balance);
  } catch (error) {
    if (error instanceof UpstreamServiceError) {
      throw error;
    }

    console.error('Failed to fetch balance', error);
    throw UpstreamServiceError.fromStatus(503, 'Balance service unavailable');
  } finally {
    clearTimeout(timeoutId);
  }
};
