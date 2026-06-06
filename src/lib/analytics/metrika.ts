import { YANDEX_METRICS_ID } from '@/lib/config';

declare global {
  interface Window {
    ym?: (counterId: number, action: string, ...params: unknown[]) => void;
  }
}

/** Build the URL Metrika should record for a hit. Pure — unit-tested. */
export const buildMetrikaHitUrl = (pathname: string | null, params: string | null | undefined): string => {
  const path = pathname || '/';
  return params ? `${path}?${params}` : path;
};

/**
 * Decide whether a route change should emit a Metrika hit.
 * - First render never sends: ym('init') (no `defer`) already counted the entry page.
 * - Identical consecutive URLs are deduped (e.g. a searchParams reference change).
 * Pure + unit-tested so the no-double-count invariant can't be refactored away.
 */
export const shouldSendMetrikaHit = (isFirstRender: boolean, lastUrl: string | null, nextUrl: string): boolean =>
  !isFirstRender && lastUrl !== nextUrl;

/** Fire a manual Metrika pageview hit. No-ops unless the tag is loaded and the counter id is set. */
export const sendMetrikaHit = (url: string, options?: { title?: string; referer?: string }): void => {
  if (typeof window === 'undefined') return;
  if (!YANDEX_METRICS_ID || typeof window.ym !== 'function') return;
  window.ym(Number(YANDEX_METRICS_ID), 'hit', url, options);
};
