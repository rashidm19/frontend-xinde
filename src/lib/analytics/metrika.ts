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

/** Fire a manual Metrika pageview hit. No-ops unless the tag is loaded and the counter id is set. */
export const sendMetrikaHit = (url: string, options?: { title?: string; referer?: string }): void => {
  if (typeof window === 'undefined') return;
  if (!YANDEX_METRICS_ID || typeof window.ym !== 'function') return;
  window.ym(Number(YANDEX_METRICS_ID), 'hit', url, options);
};
