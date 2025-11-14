'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams, type ReadonlyURLSearchParams } from 'next/navigation';

import { TelemetryEvents, trackPageView } from '@/lib/telemetry/events';
import { telemetryReady } from '@/lib/telemetry';
import { TELEMETRY_READY_EVENT } from '@/lib/telemetry/constants';

const buildPath = (pathname: string, searchParams: ReadonlyURLSearchParams | null) => {
  const params = searchParams?.toString();
  if (!params) {
    return pathname;
  }
  return `${pathname}?${params}`;
};

export const usePageViewTracking = (enabled = true) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastTrackedPathRef = useRef<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !enabled) {
      return;
    }

    const trackIfReady = () => {
      if (!telemetryReady()) {
        return;
      }

      const currentPath = buildPath(pathname ?? '/', searchParams);

      if (lastTrackedPathRef.current === currentPath) {
        return;
      }

      const title = typeof document !== 'undefined' ? document.title : undefined;
      const referrer = typeof document !== 'undefined' ? document.referrer || undefined : undefined;
      const language = typeof navigator !== 'undefined' ? navigator.language : undefined;

      trackPageView({
        path: currentPath,
        title: title ?? TelemetryEvents.PAGE_VIEW,
        referrer,
        language,
      });

      lastTrackedPathRef.current = currentPath;
    };

    trackIfReady();

    window.addEventListener(TELEMETRY_READY_EVENT, trackIfReady);

    return () => {
      window.removeEventListener(TELEMETRY_READY_EVENT, trackIfReady);
    };
  }, [enabled, pathname, searchParams]);
};
