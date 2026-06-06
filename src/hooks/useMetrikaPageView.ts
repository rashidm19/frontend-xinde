'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

import { buildMetrikaHitUrl, sendMetrikaHit } from '@/lib/analytics/metrika';
import { YANDEX_METRICS_ID } from '@/lib/config';

/** Fire a Metrika 'hit' on client-side route changes. The initial page is counted by ym('init'). */
export const useMetrikaPageView = (enabled = true) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isFirstRef = useRef(true);
  const lastUrlRef = useRef<string | null>(null);

  useEffect(() => {
    if (!enabled || !YANDEX_METRICS_ID || typeof window === 'undefined') {
      return;
    }

    const url = buildMetrikaHitUrl(pathname, searchParams?.toString());

    // Skip the first render — ym('init') (no `defer`) already auto-sent the entry pageview.
    // Do NOT "simplify" this away: dropping skip-first double-counts every session's landing
    // page. (Yandex SPA doc: https://yandex.com/support/metrica/en/code/counter-spa-setup.html)
    if (isFirstRef.current) {
      isFirstRef.current = false;
      lastUrlRef.current = url;
      return;
    }

    if (lastUrlRef.current === url) {
      return;
    }

    const prevUrl = lastUrlRef.current;
    lastUrlRef.current = url;

    // Pass the previous in-app URL as referer so SPA navigations chain correctly in the
    // entry-page/flow reports. Session SOURCE stays locked to the first (UTM-carrying) hit.
    const title = typeof document !== 'undefined' ? document.title : undefined;
    const referer = prevUrl ? window.location.origin + prevUrl : undefined;
    sendMetrikaHit(url, { title, referer });
  }, [enabled, pathname, searchParams]);
};
