import { useCallback, useEffect, useRef, useState, useTransition } from 'react';

interface SubmitTransitionOptions {
  extraDelayMs?: number;
}

interface SubmitAsyncOptions {
  triggerCooldownOnError?: boolean;
}

interface UseMobileSheetSubmitOptions {
  cooldownMs?: number;
  errorMessage?: string;
  fallbackMs?: number;
}

const DEFAULT_ERROR_MESSAGE = 'Something went wrong — try again';
const DEFAULT_FALLBACK_MS = 5000;

export function useMobileSheetSubmit(options?: UseMobileSheetSubmitOptions) {
  const { cooldownMs = 340, errorMessage = DEFAULT_ERROR_MESSAGE, fallbackMs = DEFAULT_FALLBACK_MS } = options ?? {};

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isCoolingDown, setIsCoolingDown] = useState(false);

  const cooldownRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fallbackRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);

  const [isPending, startTransition] = useTransition();
  const pendingRef = useRef(isPending);

  useEffect(() => {
    pendingRef.current = isPending;
  }, [isPending]);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (cooldownRef.current) {
        clearTimeout(cooldownRef.current);
      }
      if (fallbackRef.current) {
        clearTimeout(fallbackRef.current);
      }
    };
  }, []);

  const clearFallback = useCallback(() => {
    if (fallbackRef.current) {
      clearTimeout(fallbackRef.current);
      fallbackRef.current = null;
    }
  }, []);

  const clearCooldownTimer = useCallback(() => {
    if (cooldownRef.current) {
      clearTimeout(cooldownRef.current);
      cooldownRef.current = null;
    }
    if (mountedRef.current) {
      setIsCoolingDown(false);
    }
  }, []);

  const waitForTransition = useCallback(() => {
    return new Promise<void>(resolve => {
      if (!pendingRef.current) {
        resolve();
        return;
      }

      const step = () => {
        if (!pendingRef.current) {
          resolve();
          return;
        }
        requestAnimationFrame(step);
      };

      step();
    });
  }, []);

  const beginCooldown = useCallback(() => {
    clearCooldownTimer();
    if (!mountedRef.current) {
      return;
    }
    setIsCoolingDown(true);
    cooldownRef.current = setTimeout(() => {
      if (!mountedRef.current) {
        return;
      }
      setIsCoolingDown(false);
      cooldownRef.current = null;
    }, cooldownMs);
  }, [clearCooldownTimer, cooldownMs]);

  const startFallbackTimer = useCallback(() => {
    clearFallback();
    fallbackRef.current = setTimeout(() => {
      if (!mountedRef.current) {
        return;
      }
      setIsSubmitting(false);
      setIsCoolingDown(false);
      setSubmitError(errorMessage);
    }, fallbackMs);
  }, [clearFallback, errorMessage, fallbackMs]);

  const clearLoadingState = useCallback(
    (triggerCooldown: boolean) => {
      if (!mountedRef.current) {
        return;
      }

      clearFallback();
      setIsSubmitting(false);
      if (triggerCooldown) {
        beginCooldown();
      } else {
        clearCooldownTimer();
      }
    },
    [beginCooldown, clearCooldownTimer, clearFallback]
  );

  const submitTransition = useCallback(
    async (fn: () => void, options?: SubmitTransitionOptions) => {
      if (isSubmitting || isCoolingDown) {
        return;
      }

      setSubmitError(null);
      setIsSubmitting(true);
      startFallbackTimer();

      let syncError: unknown = null;
      startTransition(() => {
        try {
          fn();
        } catch (error) {
          syncError = error;
        }
      });

      if (syncError) {
        if (!mountedRef.current) {
          return;
        }
        console.error(syncError);
        clearLoadingState(false);
        setSubmitError(errorMessage);
        return;
      }

      try {
        await waitForTransition();
        const extraDelay = options?.extraDelayMs ?? 180;
        if (extraDelay > 0) {
          await new Promise(resolve => setTimeout(resolve, extraDelay));
        }
        clearLoadingState(true);
      } catch (error) {
        if (!mountedRef.current) {
          return;
        }
        console.error(error);
        clearLoadingState(false);
        setSubmitError(errorMessage);
      }
    },
    [clearLoadingState, errorMessage, isCoolingDown, isSubmitting, startFallbackTimer, startTransition, waitForTransition]
  );

  const submitAsync = useCallback(
    async (fn: () => Promise<void> | void, options: SubmitAsyncOptions = {}) => {
      if (isSubmitting || isCoolingDown) {
        return;
      }

      setSubmitError(null);
      setIsSubmitting(true);
      startFallbackTimer();

      try {
        await fn();
        await new Promise(resolve => setTimeout(resolve, 180));
        clearLoadingState(true);
      } catch (error) {
        if (!mountedRef.current) {
          return;
        }
        console.error(error);
        clearLoadingState(options.triggerCooldownOnError ?? false);
        setSubmitError(errorMessage);
      }
    },
    [clearLoadingState, errorMessage, isCoolingDown, isSubmitting, startFallbackTimer]
  );

  const resetError = useCallback(() => setSubmitError(null), []);
  const resetSubmission = useCallback(() => {
    if (!mountedRef.current) {
      return;
    }
    clearFallback();
    if (cooldownRef.current) {
      clearTimeout(cooldownRef.current);
      cooldownRef.current = null;
    }
    setIsSubmitting(false);
    setIsCoolingDown(false);
    setSubmitError(null);
  }, [clearFallback]);
  console.log(isSubmitting);
  return {
    isSubmitting,
    submitError,
    isCoolingDown,
    submitTransition,
    submitAsync,
    resetError,
    resetSubmission,
    ariaBusy: isSubmitting,
  };
}
