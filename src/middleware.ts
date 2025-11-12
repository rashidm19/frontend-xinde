// Locale-only middleware ensuring routes are prefixed without performing network requests.
import { NextRequest, NextResponse } from 'next/server';

const SUPPORTED_LOCALES = ['en', 'ru', 'zh'] as const;
const DEFAULT_LOCALE = 'en';

const LOCALE_PREFIX_PATTERN = new RegExp(`^/(?:${SUPPORTED_LOCALES.join('|')})(?:/|$)`, 'i');

function getLocaleFromRequest(request: NextRequest) {
  const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value;
  if (cookieLocale && SUPPORTED_LOCALES.includes(cookieLocale as (typeof SUPPORTED_LOCALES)[number])) {
    return cookieLocale as (typeof SUPPORTED_LOCALES)[number];
  }

  return DEFAULT_LOCALE;
}

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return NextResponse.next();
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
    response.cookies.set('NEXT_LOCALE', locale, { path: '/' });
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/|api/|trpc/|_vercel|favicon.ico|robots.txt|sitemap.xml|.*\.(?:png|jpg|jpeg|gif|svg|webp|ico|css|js|map|txt|woff2?|ttf|otf)$).*)',
  ],
};
