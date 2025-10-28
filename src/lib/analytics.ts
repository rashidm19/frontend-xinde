'use client';

type ScreenKey = 'stats' | 'practice' | 'history' | 'profile';

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: Array<Record<string, unknown>>;
    analytics?: { track?: (event: string, payload?: Record<string, unknown>) => void };
  }
}

export function trackScreenView(screen: ScreenKey) {
  if (typeof window === 'undefined') {
    return;
  }

  const payload = { screen_name: screen, screen_view_id: `${screen}-${Date.now()}` };

  if (typeof window.gtag === 'function') {
    window.gtag('event', 'screen_view', payload);
    return;
  }

  if (Array.isArray(window.dataLayer)) {
    window.dataLayer.push({ event: 'screen_view', ...payload });
  }

  if (window.analytics?.track) {
    window.analytics.track('screen_view', payload);
  }
}

export type { ScreenKey };
