// Locale-only middleware ensuring routes are prefixed without performing network requests.
import { NextRequest, NextResponse } from 'next/server';
import { IS_PROD_BUILD } from '@/lib/config';

const SUPPORTED_LOCALES = ['en', 'ru', 'zh'] as const;
const DEFAULT_LOCALE = 'en';

const LOCALE_PREFIX_PATTERN = new RegExp(`^/(?:${SUPPORTED_LOCALES.join('|')})(?:/|$)`, 'i');
const MOBILE_USER_AGENT_PATTERN = /Android|iP(?:hone|ad|od)|webOS|BlackBerry|IEMobile|Opera Mini|Mobile/i;

const PROFILE_PATH = '/profile';
const MOBILE_STATS_PATH = '/m/stats';

function getLocaleFromRequest(request: NextRequest) {
  const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value;
  if (cookieLocale && SUPPORTED_LOCALES.includes(cookieLocale as (typeof SUPPORTED_LOCALES)[number])) {
    return cookieLocale as (typeof SUPPORTED_LOCALES)[number];
  }

  return DEFAULT_LOCALE;
}

function isMobileUserAgent(userAgent: string | null) {
  if (!userAgent) {
    return false;
  }
  return MOBILE_USER_AGENT_PATTERN.test(userAgent);
}

function maybeRedirectMobileProfile(request: NextRequest) {
  if (!isMobileUserAgent(request.headers.get('user-agent'))) {
    return null;
  }

  const pathname = request.nextUrl.pathname;
  const localeMatch = pathname.match(/^\/([^/]+)(\/.*)?$/);

  if (!localeMatch) {
    return null;
  }

  const rawLocale = localeMatch[1];
  const localeCandidate = rawLocale.toLowerCase();

  if (!SUPPORTED_LOCALES.includes(localeCandidate as (typeof SUPPORTED_LOCALES)[number])) {
    return null;
  }

  const locale = localeCandidate as (typeof SUPPORTED_LOCALES)[number];

  const restPath = localeMatch[2] ?? '';
  const normalizedRestPath = restPath.replace(/\/+$/, '').toLowerCase();

  if (normalizedRestPath !== PROFILE_PATH) {
    return null;
  }

  const redirectUrl = request.nextUrl.clone();
  redirectUrl.pathname = `/${locale}${MOBILE_STATS_PATH}`;

  return NextResponse.redirect(redirectUrl);
}

function maybeRedirectDesktopMobileRoutes(request: NextRequest) {
  if (isMobileUserAgent(request.headers.get('user-agent'))) {
    return null;
  }

  const pathname = request.nextUrl.pathname;
  const match = pathname.match(/^\/([^/]+)\/m(\/.+)$/i);

  if (!match) {
    return null;
  }

  const localeCandidate = match[1].toLowerCase();

  if (!SUPPORTED_LOCALES.includes(localeCandidate as (typeof SUPPORTED_LOCALES)[number])) {
    return null;
  }

  const locale = localeCandidate as (typeof SUPPORTED_LOCALES)[number];

  const redirectUrl = request.nextUrl.clone();
  redirectUrl.pathname = `/${locale}${PROFILE_PATH}`;

  return NextResponse.redirect(redirectUrl);
}

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return NextResponse.next();
  }

  const desktopRedirectResponse = maybeRedirectDesktopMobileRoutes(request);
  if (desktopRedirectResponse) {
    return desktopRedirectResponse;
  }

  const mobileRedirectResponse = maybeRedirectMobileProfile(request);
  if (mobileRedirectResponse) {
    return mobileRedirectResponse;
  }

  if (LOCALE_PREFIX_PATTERN.test(pathname)) {
    return NextResponse.next();
  }

  const locale = getLocaleFromRequest(request);
  const redirectURL = new URL(request.nextUrl.href);
  redirectURL.pathname = `/${locale}${pathname.startsWith('/') ? pathname : `/${pathname}`}`;
  redirectURL.search = search;

  const response = NextResponse.redirect(redirectURL);

  if (!request.cookies.get('NEXT_LOCALE')) {
    response.cookies.set('NEXT_LOCALE', locale, {
      path: '/',
      sameSite: 'lax',
      secure: IS_PROD_BUILD,
      maxAge: 60 * 60 * 24 * 180,
    });
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/|api/|trpc/|_vercel|favicon.ico|robots.txt|sitemap.xml|.*.(?:png|jpg|jpeg|gif|svg|webp|ico|css|js|map|txt|woff2?|ttf|otf)$).*)'],
};
