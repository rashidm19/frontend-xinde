'use client';

import React from 'react';

import { motion, useReducedMotion } from 'framer-motion';

import { cn } from '@/lib/utils';

declare global {
  interface Window {
    google?: {
      accounts?: {
        id?: {
          initialize: (config: { client_id: string; callback: (response: { credential?: string | null }) => void }) => void;
          renderButton: (element: HTMLElement, options?: Record<string, unknown>) => void;
          cancel: () => void;
          disableAutoSelect?: () => void;
        };
      };
    };
  }
}

const GOOGLE_SCRIPT_SRC = 'https://accounts.google.com/gsi/client';

interface GoogleLoginButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  onCredential: (credential: string) => void;
  disabled?: boolean;
  onError?: (errorKey: string) => void;
  label: string;
  className?: string;
  loading?: boolean;
}

export const GoogleLoginButton: React.FC<GoogleLoginButtonProps> = ({
  onCredential,
  disabled = false,
  onError,
  label,
  className,
  loading = false,
  ...buttonProps
}) => {
  const prefersReducedMotion = useReducedMotion();
  const [scriptLoaded, setScriptLoaded] = React.useState(false);
  const googleIdRef = React.useRef<Window['google']['accounts']['id'] | null>(null);
  const hasInitializedRef = React.useRef(false);

  const clientId = React.useMemo(() => process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? '514580412925-knbr7l1t0hkjp8llohr23mb8qm84c6pa.apps.googleusercontent.com', []);

  React.useEffect(() => {
    if (!clientId) {
      onError?.('missing_client');
      return;
    }

    if (typeof window === 'undefined') {
      return;
    }

    if (window.google?.accounts?.id) {
      setScriptLoaded(true);
      return;
    }

    const existingScript = document.querySelector(`script[src="${GOOGLE_SCRIPT_SRC}"]`);

    if (existingScript) {
      if ((existingScript as HTMLScriptElement).dataset.loaded === 'true') {
        setScriptLoaded(true);
      } else {
        existingScript.addEventListener('load', () => setScriptLoaded(true));
        existingScript.addEventListener('error', () => onError?.('script_error'));
      }
      return;
    }

    const script = document.createElement('script');
    script.src = GOOGLE_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.dataset.loaded = 'false';
    script.onload = () => {
      script.dataset.loaded = 'true';
      setScriptLoaded(true);
    };
    script.onerror = () => {
      onError?.('script_error');
    };

    document.head.appendChild(script);
  }, [clientId, onError]);

  React.useEffect(() => {
    if (!scriptLoaded || !clientId) {
      return;
    }

    const googleId = window.google?.accounts?.id;

    if (!googleId) {
      onError?.('script_error');
      return;
    }

    if (hasInitializedRef.current) {
      googleIdRef.current = googleId;
      return;
    }

    googleId.initialize({
      client_id: clientId,
      callback: response => {
        if (response.credential) {
          onCredential(response.credential);
        }
      },
      auto_select: false,
    });

    googleId.disableAutoSelect?.();
    googleIdRef.current = googleId;
    hasInitializedRef.current = true;

    return () => {
      googleId.cancel();
    };
  }, [clientId, onCredential, onError, scriptLoaded]);

  const handleClick = () => {
    if (!scriptLoaded || !googleIdRef.current) {
      onError?.('script_error');
      return;
    }

    try {
      googleIdRef.current.prompt(notification => {
        if (notification.isNotDisplayed?.()) {
          onError?.('google_prompt_blocked');
        }
      });
    } catch (error) {
      onError?.('script_error');
    }
  };

  return (
    <motion.button
      type="button"
      whileTap={prefersReducedMotion || disabled ? undefined : { scale: 0.97 }}
      onClick={handleClick}
      disabled={disabled || !scriptLoaded || loading}
      className={cn(
        'relative inline-flex items-center justify-center gap-[12rem] rounded-[18rem] border border-gray-200 bg-white px-[16rem] py-[14rem] text-[16rem] font-medium text-gray-800 transition hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 disabled:cursor-not-allowed disabled:opacity-60',
        className
      )}
      aria-label="Continue with Google"
      aria-busy={loading || undefined}
      {...buttonProps}
    >
      <span className={cn('pointer-events-none inline-flex items-center gap-[12rem]', loading && 'opacity-0')}>
        <img src="/images/icon_google.svg" alt="" className="size-[20rem]" aria-hidden="true" />
        <span>{label}</span>
      </span>
      {loading ? (
        <span className="absolute inset-0 flex items-center justify-center" aria-hidden="true">
          <span className="size-[18rem] animate-spin rounded-full border-[3rem] border-blue-200 border-t-blue-500" />
        </span>
      ) : null}
    </motion.button>
  );
};
