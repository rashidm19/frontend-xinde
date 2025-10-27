'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Loader2, RefreshCw } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';

import type { CaptchaController } from '@/hooks/useCaptcha';
import { cn } from '@/lib/utils';

type CaptchaTheme = 'light' | 'dark';

const detectTheme = (): CaptchaTheme => {
  if (typeof document === 'undefined') {
    return 'light';
  }

  if (document.documentElement.classList.contains('dark')) {
    return 'dark';
  }

  if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }

  return 'light';
};

interface CaptchaGateProps {
  controller: CaptchaController;
  className?: string;
}

export const CaptchaGate: React.FC<CaptchaGateProps> = ({ controller, className }) => {
  const {
    enabled,
    provider,
    siteKey,
    challengeVisible,
    error,
    loading,
    registerChallengeToken,
    registerChallengeError,
    loadScript,
    resetToken,
  } = controller;

  const prefersReducedMotion = useReducedMotion();
  const t = useTranslations('auth.captcha');
  const containerRef = useRef<HTMLDivElement>(null);
  const googleWidgetIdRef = useRef<number | null>(null);
  const hcaptchaWidgetIdRef = useRef<string | null>(null);
  const initializingRef = useRef(false);
  const [theme, setTheme] = useState<CaptchaTheme>('light');
  const [initializing, setInitializing] = useState(false);

  const resetWidgets = useCallback(() => {
    if (provider === 'google' && googleWidgetIdRef.current !== null) {
      window.grecaptcha?.reset(googleWidgetIdRef.current);
    }

    if (provider === 'hcaptcha' && hcaptchaWidgetIdRef.current) {
      window.hcaptcha?.reset(hcaptchaWidgetIdRef.current);
    }

    googleWidgetIdRef.current = null;
    hcaptchaWidgetIdRef.current = null;
  }, [provider]);

  const renderGoogleWidget = useCallback((resolvedTheme: CaptchaTheme) => {
    if (!containerRef.current || !window.grecaptcha?.render || !siteKey) {
      registerChallengeError('script');
      return;
    }

    window.grecaptcha.ready(() => {
      googleWidgetIdRef.current = window.grecaptcha!.render(containerRef.current as HTMLElement, {
        sitekey: siteKey,
        size: 'normal',
        theme: resolvedTheme,
        callback: token => {
          registerChallengeToken(token);
          window.grecaptcha?.reset(googleWidgetIdRef.current ?? undefined);
        },
        'expired-callback': () => {
          registerChallengeError('expired');
          window.grecaptcha?.reset(googleWidgetIdRef.current ?? undefined);
        },
        'error-callback': () => {
          registerChallengeError('network');
          window.grecaptcha?.reset(googleWidgetIdRef.current ?? undefined);
        },
      });
    });
  }, [registerChallengeError, registerChallengeToken, siteKey]);

  const renderHCaptchaWidget = useCallback((resolvedTheme: CaptchaTheme) => {
    if (!containerRef.current || !window.hcaptcha?.render || !siteKey) {
      registerChallengeError('script');
      return;
    }

    hcaptchaWidgetIdRef.current = window.hcaptcha.render(containerRef.current, {
      sitekey: siteKey,
      size: 'normal',
      theme: resolvedTheme,
      callback: token => {
        registerChallengeToken(token);
        if (hcaptchaWidgetIdRef.current) {
          window.hcaptcha?.reset(hcaptchaWidgetIdRef.current);
        }
      },
      'expired-callback': () => {
        registerChallengeError('expired');
        if (hcaptchaWidgetIdRef.current) {
          window.hcaptcha?.reset(hcaptchaWidgetIdRef.current);
        }
      },
      'error-callback': () => {
        registerChallengeError('network');
        if (hcaptchaWidgetIdRef.current) {
          window.hcaptcha?.reset(hcaptchaWidgetIdRef.current);
        }
      },
    });
  }, [registerChallengeError, registerChallengeToken, siteKey]);

  const initializeWidget = useCallback(async () => {
    if (!enabled || !siteKey || !provider || !challengeVisible) {
      return;
    }

    initializingRef.current = true;
    setInitializing(true);
    try {
      await loadScript();
      const resolvedTheme = detectTheme();
      setTheme(resolvedTheme);
      resetWidgets();
      if (provider === 'google') {
        renderGoogleWidget(resolvedTheme);
      } else {
        renderHCaptchaWidget(resolvedTheme);
      }
    } catch (scriptError) {
      registerChallengeError('script');
    } finally {
      initializingRef.current = false;
      setInitializing(false);
    }
  }, [challengeVisible, enabled, loadScript, provider, registerChallengeError, renderGoogleWidget, renderHCaptchaWidget, resetWidgets, siteKey]);

  useEffect(() => {
    if (!challengeVisible) {
      resetWidgets();
      setInitializing(false);
      return;
    }

    initializeWidget();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [challengeVisible]);

  useEffect(() => {
    if (!challengeVisible || !enabled) {
      return;
    }

    const observer = new MutationObserver(() => {
      setTheme(detectTheme());
    });

    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, [challengeVisible, enabled]);

  useEffect(() => {
    if (!challengeVisible || initializingRef.current) {
      return;
    }

    initializeWidget();
  }, [challengeVisible, initializeWidget, theme]);

  const handleRefresh = () => {
    resetToken();
    resetWidgets();
    initializeWidget();
  };

  const errorMessage = useMemo(() => {
    if (!error) return null;
    switch (error) {
      case 'expired':
        return t('errors.expired');
      case 'network':
        return t('errors.network');
      case 'script':
        return t('errors.unavailable');
      case 'closed':
        return t('errors.closed');
      default:
        return null;
    }
  }, [error, t]);

  if (!enabled || !siteKey || !provider) {
    return null;
  }

  return (
    <AnimatePresence initial={false}>
      {challengeVisible ? (
        <motion.div
          key='captcha-gate'
          initial={prefersReducedMotion ? undefined : { opacity: 0, y: 8 }}
          animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
          exit={prefersReducedMotion ? undefined : { opacity: 0, y: -8 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
          className={cn(
            'rounded-[18rem] border border-gray-200 bg-gray-50 p-[16rem] text-[13rem] text-gray-700 shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200',
            className
          )}
        >
          <div className='flex flex-col gap-[12rem]'>
            <div className='flex items-center gap-[8rem] text-[14rem] font-semibold text-gray-700 dark:text-gray-100'>
              <span>{t('title')}</span>
            </div>
            <p className='text-[13rem] leading-relaxed text-gray-600 dark:text-gray-300'>{t('description')}</p>

            <div
              ref={containerRef}
              className='flex min-h-[78rem] items-center justify-center rounded-[12rem] bg-white p-[8rem] dark:bg-gray-900'
            />

            <div className='flex flex-wrap items-center justify-between gap-[12rem]'>
              <div className='flex items-center gap-[8rem] text-[12rem] text-gray-500 dark:text-gray-400'>
                {(loading || initializing) && <Loader2 className='size-[14rem] animate-spin' aria-hidden='true' />}
                <span>{loading || initializing ? t('status.loading') : t('status.ready')}</span>
              </div>

              <button
                type='button'
                onClick={handleRefresh}
                className='inline-flex items-center gap-[6rem] rounded-[12rem] border border-gray-200 px-[12rem] py-[6rem] text-[12rem] font-medium text-gray-600 transition hover:border-blue-200 hover:text-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200 dark:border-gray-700 dark:text-gray-300 dark:hover:border-blue-400 dark:hover:text-blue-400'
              >
                <RefreshCw className='size-[14rem]' aria-hidden='true' />
                {t('actions.refresh')}
              </button>
            </div>

            {errorMessage ? <p className='text-[12rem] font-medium text-rose-500'>{errorMessage}</p> : null}
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};
