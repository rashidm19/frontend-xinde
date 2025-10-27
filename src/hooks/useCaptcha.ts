import { useCallback, useMemo, useRef, useState } from 'react';
import { CAPTCHA_PROVIDER, CAPTCHA_SITE_KEY, CAPTCHA_THRESHOLD, ENABLE_CAPTCHA } from '@/lib/config';

type CaptchaProvider = 'google' | 'hcaptcha';
type CaptchaMode = 'invisible' | 'challenge';
type CaptchaError = 'script' | 'network' | 'expired' | 'closed';
type ChallengeReason = 'low_score' | 'backend' | 'network' | 'manual' | 'too_many_failures';

export interface UseCaptchaOptions {
  action?: string;
  locale?: string;
  maxInvisibleRetries?: number;
  failureThreshold?: number;
}

export interface CaptchaExecutionOptions {
  action?: string;
  forceVisible?: boolean;
}

export interface CaptchaExecutionResult {
  token: string;
  mode: CaptchaMode;
}

interface CaptchaTokenState {
  value: string;
  mode: CaptchaMode;
  createdAt: number;
}

interface PendingResolver {
  resolve: (result: CaptchaExecutionResult | null) => void;
  reject: (reason?: unknown) => void;
}

const TOKEN_TTL_MS = 110_000;
const DEFAULT_FAILURE_THRESHOLD = 3;

const normalizeProvider = (raw: string | undefined): CaptchaProvider | null => {
  const value = raw?.toLowerCase().trim();
  if (!value) return null;
  if (value === 'google' || value === 'recaptcha' || value === 'recaptcha_v3') {
    return 'google';
  }
  if (value === 'hcaptcha') {
    return 'hcaptcha';
  }
  return null;
};

const parseBoolean = (value: string | undefined): boolean => value?.toLowerCase().trim() === 'true';

const parseNumber = (value: string | undefined, fallback: number): number => {
  if (!value) return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const resolveLocale = (explicit?: string): string | undefined => {
  if (explicit) return explicit;
  if (typeof document !== 'undefined') {
    return document.documentElement.lang || undefined;
  }
  return undefined;
};

export interface CaptchaController {
  enabled: boolean;
  provider: CaptchaProvider | null;
  siteKey: string | null;
  threshold: number;
  challengeVisible: boolean;
  loading: boolean;
  error: CaptchaError | null;
  mode: CaptchaMode | null;
  execute: (options?: CaptchaExecutionOptions) => Promise<CaptchaExecutionResult | null>;
  resetToken: () => void;
  requireChallenge: (reason?: ChallengeReason) => void;
  handleBackendResult: (success: boolean, reason?: ChallengeReason) => void;
  registerChallengeToken: (token: string) => void;
  registerChallengeError: (error: CaptchaError) => void;
  loadScript: () => Promise<void>;
}

declare global {
  interface Window {
    grecaptcha?: {
      ready: (callback: () => void) => void;
      execute: (siteKey: string, options?: { action?: string }) => Promise<string>;
      render: (
        container: HTMLElement,
        parameters: {
          sitekey: string;
          size?: 'normal' | 'compact' | 'invisible';
          theme?: 'light' | 'dark';
          callback?: (token: string) => void;
          'expired-callback'?: () => void;
          'error-callback'?: () => void;
        }
      ) => number;
      reset: (widgetId?: number) => void;
    };
    hcaptcha?: {
      execute: (siteKey: string, options?: { async?: boolean; action?: string }) => Promise<string>;
      render: (
        container: HTMLElement,
        parameters: {
          sitekey: string;
          size?: 'invisible' | 'compact' | 'normal';
          theme?: 'light' | 'dark';
          callback?: (token: string) => void;
          'expired-callback'?: () => void;
          'error-callback'?: () => void;
        }
      ) => string;
      reset: (widgetId?: string) => void;
    };
  }
}

export const useCaptcha = ({ action = 'submit', locale, maxInvisibleRetries = 2, failureThreshold = DEFAULT_FAILURE_THRESHOLD }: UseCaptchaOptions = {}): CaptchaController => {
  const provider = useMemo(() => normalizeProvider(CAPTCHA_PROVIDER), []);
  const enabled = useMemo(() => parseBoolean(ENABLE_CAPTCHA) && !!provider, [provider]);
  const siteKey = useMemo(() => {
    if (!enabled) return null;
    const key = CAPTCHA_SITE_KEY?.trim();
    return key && key.length > 0 ? key : null;
  }, [enabled]);

  const [challengeVisible, setChallengeVisible] = useState(false);
  const [error, setError] = useState<CaptchaError | null>(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<CaptchaMode | null>(null);
  const tokenState = useRef<CaptchaTokenState | null>(null);
  const pendingResolvers = useRef<PendingResolver[]>([]);
  const scriptPromiseRef = useRef<Promise<void> | null>(null);
  const scriptStatusRef = useRef<'idle' | 'loading' | 'ready' | 'failed'>('idle');
  const invisibleRetriesRef = useRef(0);
  const failureCountRef = useRef(0);

  const threshold = useMemo(() => parseNumber(CAPTCHA_THRESHOLD, 0.5), []);
  const resolvedLocale = useMemo(() => resolveLocale(locale), [locale]);

  const resetToken = useCallback(() => {
    tokenState.current = null;
    setMode(null);
  }, []);

  const resolvePending = useCallback((result: CaptchaExecutionResult | null, rejectReason?: unknown) => {
    if (result) {
      tokenState.current = {
        value: result.token,
        mode: result.mode,
        createdAt: Date.now(),
      };
      setMode(result.mode);
    }

    if (rejectReason !== undefined) {
      pendingResolvers.current.forEach(({ reject }) => reject(rejectReason));
    } else {
      pendingResolvers.current.forEach(({ resolve }) => resolve(result));
    }

    pendingResolvers.current = [];
  }, []);

  const loadScript = useCallback(async () => {
    if (!enabled || !siteKey || scriptStatusRef.current === 'ready') {
      if (scriptStatusRef.current === 'ready') {
        return;
      }
      if (!enabled || !siteKey) {
        throw new Error('Captcha disabled or misconfigured');
      }
    }

    if (scriptStatusRef.current === 'loading' && scriptPromiseRef.current) {
      return scriptPromiseRef.current;
    }

    scriptStatusRef.current = 'loading';

    scriptPromiseRef.current = new Promise<void>((resolve, reject) => {
      if (typeof window === 'undefined') {
        scriptStatusRef.current = 'failed';
        reject(new Error('Captcha unavailable in SSR'));
        return;
      }

      const existingScript = document.querySelector<HTMLScriptElement>(`script[data-captcha-provider="${provider ?? 'none'}"]`);
      if (existingScript) {
        if (existingScript.dataset.loaded === 'true') {
          scriptStatusRef.current = 'ready';
          resolve();
          return;
        }

        existingScript.addEventListener('load', () => {
          existingScript.dataset.loaded = 'true';
          scriptStatusRef.current = 'ready';
          resolve();
        });
        existingScript.addEventListener('error', () => {
          scriptStatusRef.current = 'failed';
          reject(new Error('Captcha script failed to load'));
        });
        return;
      }

      const script = document.createElement('script');
      script.async = true;
      script.defer = true;
      script.dataset.captchaProvider = provider ?? 'none';
      script.dataset.loaded = 'false';

      const localeParam = resolvedLocale ? `&hl=${encodeURIComponent(resolvedLocale)}` : '';

      if (provider === 'google') {
        script.src = `https://www.google.com/recaptcha/api.js?render=${encodeURIComponent(siteKey)}${localeParam}`;
      } else if (provider === 'hcaptcha') {
        script.src = `https://js.hcaptcha.com/1/api.js?render=explicit${localeParam}`;
      } else {
        scriptStatusRef.current = 'failed';
        reject(new Error('Unsupported captcha provider'));
        return;
      }

      script.onload = () => {
        script.dataset.loaded = 'true';
        scriptStatusRef.current = 'ready';
        resolve();
      };

      script.onerror = () => {
        scriptStatusRef.current = 'failed';
        reject(new Error('Captcha script failed to load'));
      };

      document.head.appendChild(script);
    });

    return scriptPromiseRef.current;
  }, [enabled, provider, resolvedLocale, siteKey]);

  const ensureTokenIsFresh = useCallback(() => {
    if (!tokenState.current) return;
    if (Date.now() - tokenState.current.createdAt > TOKEN_TTL_MS) {
      tokenState.current = null;
      setMode(null);
    }
  }, []);

  const executeInvisibleGoogle = useCallback(
    async (selectedAction: string) => {
      if (!siteKey) {
        throw new Error('Missing site key');
      }

      await loadScript();

      const api = window.grecaptcha;
      if (!api?.execute || !api.ready) {
        throw new Error('reCAPTCHA not ready');
      }

      return new Promise<string>((resolve, reject) => {
        api.ready(() => {
          api
            .execute(siteKey, { action: selectedAction })
            .then(resolve)
            .catch(reject);
        });
      });
    },
    [loadScript, siteKey]
  );

  const executeInvisibleHCaptcha = useCallback(
    async (selectedAction: string) => {
      if (!siteKey) {
        throw new Error('Missing site key');
      }

      await loadScript();

      const api = window.hcaptcha;
      if (!api?.execute) {
        throw new Error('hCaptcha not ready');
      }

      return api.execute(siteKey, { async: true, action: selectedAction });
    },
    [loadScript, siteKey]
  );

  const execute = useCallback<CaptchaController['execute']>(
    async (options = {}) => {
      if (!enabled || !siteKey || !provider) {
        return null;
      }

      ensureTokenIsFresh();

      if (!options.forceVisible && !challengeVisible && tokenState.current?.mode === 'invisible' && tokenState.current.value) {
        return { token: tokenState.current.value, mode: tokenState.current.mode };
      }

      if (challengeVisible || options.forceVisible) {
        setChallengeVisible(true);
        return new Promise<CaptchaExecutionResult | null>((resolve, reject) => {
          pendingResolvers.current.push({ resolve, reject });
        });
      }

      setLoading(true);
      setError(null);

      const selectedAction = options.action ?? action;

      try {
        const token = provider === 'google' ? await executeInvisibleGoogle(selectedAction) : await executeInvisibleHCaptcha(selectedAction);
        invisibleRetriesRef.current = 0;
        const result: CaptchaExecutionResult = { token, mode: 'invisible' };
        resolvePending(result);
        setLoading(false);
        return result;
      } catch (execError) {
        invisibleRetriesRef.current += 1;
        setError('network');

        if (invisibleRetriesRef.current >= maxInvisibleRetries) {
          setChallengeVisible(true);
        }

        setLoading(false);

        return new Promise<CaptchaExecutionResult | null>((resolve, reject) => {
          pendingResolvers.current.push({ resolve, reject });
        });
      }
    },
    [action, challengeVisible, enabled, ensureTokenIsFresh, executeInvisibleGoogle, executeInvisibleHCaptcha, maxInvisibleRetries, provider, resolvePending, siteKey]
  );

  const requireChallenge = useCallback<CaptchaController['requireChallenge']>(
    reason => {
      if (!enabled || !siteKey || !provider) {
        return;
      }

      if (reason === 'low_score') {
        setError(null);
      }

      setChallengeVisible(true);
      resetToken();
    },
    [enabled, provider, resetToken, siteKey]
  );

  const handleBackendResult = useCallback<CaptchaController['handleBackendResult']>(
    (success, reason) => {
      if (success) {
        failureCountRef.current = 0;
        resetToken();
        setChallengeVisible(false);
        setError(null);
        return;
      }

      failureCountRef.current += 1;

      if (reason === 'low_score' || reason === 'backend') {
        requireChallenge(reason ?? 'backend');
        return;
      }

      if (failureCountRef.current >= failureThreshold) {
        requireChallenge('too_many_failures');
      }
    },
    [failureThreshold, requireChallenge, resetToken]
  );

  const registerChallengeToken = useCallback<CaptchaController['registerChallengeToken']>(token => {
    const result: CaptchaExecutionResult = { token, mode: 'challenge' };
    resolvePending(result);
    setError(null);
    setChallengeVisible(false);
  }, [resolvePending]);

  const registerChallengeError = useCallback<CaptchaController['registerChallengeError']>(challengeError => {
    setError(challengeError);
    resolvePending(null, new Error(`Captcha challenge failed: ${challengeError}`));
  }, [resolvePending]);

  return useMemo<CaptchaController>(() => ({
    enabled: Boolean(enabled && siteKey && provider),
    provider: provider ?? null,
    siteKey,
    threshold,
    challengeVisible,
    loading,
    error,
    mode,
    execute,
    resetToken,
    requireChallenge,
    handleBackendResult,
    registerChallengeToken,
    registerChallengeError,
    loadScript,
  }), [challengeVisible, enabled, error, execute, handleBackendResult, loadScript, mode, provider, registerChallengeError, registerChallengeToken, requireChallenge, resetToken, siteKey, threshold, loading]);
};
