'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

import { buildMetrikaHitUrl, sendMetrikaHit, shouldSendMetrikaHit } from '@/lib/analytics/metrika';
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
    const isFirst = isFirstRef.current;
    const prevUrl = lastUrlRef.current;

    // Advance state first. ym('init') (no `defer`) already auto-sent the entry pageview, so the
    // first render must NOT send; identical consecutive URLs are deduped. The decision lives in
    // shouldSendMetrikaHit (unit-tested) so it can't be "simplified" into a double-count.
    // (Yandex SPA doc: https://yandex.com/support/metrica/en/code/counter-spa-setup.html)
    isFirstRef.current = false;
    lastUrlRef.current = url;

    if (!shouldSendMetrikaHit(isFirst, prevUrl, url)) {
      return;
    }

    // Previous in-app URL as referer → SPA navigations chain in entry-page/flow reports.
    // Session SOURCE stays locked to the first (UTM-carrying) hit.
    const title = typeof document !== 'undefined' ? document.title : undefined;
    const referer = prevUrl ? window.location.origin + prevUrl : undefined;
    sendMetrikaHit(url, { title, referer });
  }, [enabled, pathname, searchParams]);
};
