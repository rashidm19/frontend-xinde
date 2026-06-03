import type { FunnelStage } from './resolveStage';

export function withNext(path: string, next?: string | null): string {
  if (!next) return path;
  const sep = path.includes('?') ? '&' : '?';
  return `${path}${sep}next=${encodeURIComponent(next)}`;
}

export function pathForStage(stage: FunnelStage, locale: string, next?: string | null): string {
  switch (stage) {
    case 'unauthenticated':
      return withNext(`/${locale}/login`, next);
    case 'onboarding':
      return withNext(`/${locale}/onboarding`, next);
    case 'paywall':
      return withNext(`/${locale}/paywall`, next);
    case 'app':
      return next ?? `/${locale}/dashboard`;
  }
}

// originalUrl is the x-sb-original-url header, e.g. "/ru/paywall?next=...".
// Parse the segment AFTER the locale prefix; ignore the query string.
export function screenFromPath(originalUrl: string): 'onboarding' | 'paywall' | null {
  const pathname = originalUrl.split('?')[0] ?? '';
  const segments = pathname.split('/').filter(Boolean); // ['ru', 'paywall']
  const screen = segments[1];
  return screen === 'onboarding' || screen === 'paywall' ? screen : null;
}
