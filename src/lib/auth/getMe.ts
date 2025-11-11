import { cookies, headers } from 'next/headers';

import { API_URL } from '@/lib/config';
import { userSchema, type User } from '@/types/types';

const AUTH_ME_ENDPOINT = '/api/me';
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

export const getMe = async (): Promise<User | null> => {
  const incomingHeaders = headers();
  const cookieStore = cookies();

  const cookieHeader = incomingHeaders.get('cookie');
  const authorizationHeader = incomingHeaders.get(AUTHORIZATION_HEADER);
  const userAgentHeader = incomingHeaders.get('user-agent');
  const forwardedForHeader = incomingHeaders.get('x-forwarded-for');
  const tokenFromCookie = cookieStore.get(TOKEN_COOKIE_NAME)?.value;

  const authHeader = buildAuthHeader(authorizationHeader, tokenFromCookie);

  if (!authHeader && !cookieHeader && !tokenFromCookie) {
    return null;
  }

  const requestHeaders = new Headers({ Accept: 'application/json' });

  if (cookieHeader) {
    requestHeaders.set('Cookie', cookieHeader);
  } else if (tokenFromCookie) {
    requestHeaders.set('Cookie', `${TOKEN_COOKIE_NAME}=${tokenFromCookie}`);
  }

  if (authHeader) {
    requestHeaders.set('Authorization', authHeader);
  }

  if (userAgentHeader) {
    requestHeaders.set('User-Agent', userAgentHeader);
  }

  if (forwardedForHeader) {
    requestHeaders.set('X-Forwarded-For', forwardedForHeader);
  }

  const endpointUrl = new URL(AUTH_ME_ENDPOINT, API_URL);
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

    if (!response.ok) {
      return null;
    }

    const payload = await response.json();
    return userSchema.parse(payload);
  } catch (error) {
    console.error('Failed to fetch current user', error);
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
};
