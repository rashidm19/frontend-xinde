"use client";

import { useCallback, useEffect, useRef } from 'react';

type Options = {
  message: string;
  enabled?: boolean;
};

type LeaveConfirmationController = {
  allowNextNavigation: () => void;
};

export function useLeaveConfirmation({ message, enabled = true }: Options): LeaveConfirmationController {
  const skipNextNavigationRef = useRef(false);

  const isEnabled = enabled && typeof window !== 'undefined';

  const allowNextNavigation = useCallback(() => {
    skipNextNavigationRef.current = true;
  }, []);

  const shouldProceed = useCallback(() => {
    if (!isEnabled) {
      return true;
    }

    if (skipNextNavigationRef.current) {
      skipNextNavigationRef.current = false;
      return true;
    }

    return window.confirm(message);
  }, [isEnabled, message]);

  useEffect(() => {
    if (!isEnabled) {
      return;
    }

    const cleanupFns: Array<() => void> = [];

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (skipNextNavigationRef.current) {
        skipNextNavigationRef.current = false;
        return;
      }

      event.preventDefault();
      event.returnValue = message;
      return message;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    cleanupFns.push(() => window.removeEventListener('beforeunload', handleBeforeUnload));

    const navigation = (window as any).navigation as
      | { addEventListener: (type: string, listener: (event: any) => void) => void; removeEventListener: (type: string, listener: (event: any) => void) => void }
      | undefined;

    if (navigation?.addEventListener) {
      const handleNavigate = (event: any) => {
        if (skipNextNavigationRef.current) {
          skipNextNavigationRef.current = false;
          return;
        }

        if (!shouldProceed()) {
          event.preventDefault();
        }
      };

      navigation.addEventListener('navigate', handleNavigate);
      cleanupFns.push(() => navigation.removeEventListener('navigate', handleNavigate));
    }

    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;

    const patchHistoryMethod = (
      method: typeof window.history.pushState | typeof window.history.replaceState
    ) => {
      return function patchedHistoryMethod(this: History, ...args: Parameters<typeof method>) {
        if (skipNextNavigationRef.current) {
          skipNextNavigationRef.current = false;
          return method.apply(this, args);
        }

        if (!shouldProceed()) {
          return undefined;
        }

        return method.apply(this, args);
      };
    };

    window.history.pushState = patchHistoryMethod(originalPushState);
    window.history.replaceState = patchHistoryMethod(originalReplaceState);

    cleanupFns.push(() => {
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
    });

    const handlePopState = (event: PopStateEvent) => {
      if (skipNextNavigationRef.current) {
        skipNextNavigationRef.current = false;
        return;
      }

      if (!shouldProceed()) {
        event.preventDefault?.();
        skipNextNavigationRef.current = true;
        window.history.go(1);
      }
    };

    window.addEventListener('popstate', handlePopState);
    cleanupFns.push(() => window.removeEventListener('popstate', handlePopState));

    const handleClickCapture = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const anchor = target?.closest?.('a[href]') as HTMLAnchorElement | null;

      if (!anchor) {
        return;
      }

      if (anchor.target && anchor.target !== '_self') {
        return;
      }

      if (anchor.hasAttribute('download')) {
        return;
      }

      const href = anchor.getAttribute('href');
      if (!href || href.startsWith('#')) {
        return;
      }

      const url = new URL(href, window.location.href);

      if (url.origin !== window.location.origin) {
        return;
      }

      if (!shouldProceed()) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation?.();
      }
    };

    document.addEventListener('click', handleClickCapture, true);
    cleanupFns.push(() => document.removeEventListener('click', handleClickCapture, true));

    return () => {
      cleanupFns.forEach(fn => fn());
    };
  }, [isEnabled, message, shouldProceed]);

  return {
    allowNextNavigation,
  };
}
