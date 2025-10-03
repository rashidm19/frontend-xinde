'use client';

import React from 'react';

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

interface GoogleLoginButtonProps {
  onCredential: (credential: string) => void;
  disabled?: boolean;
  onError?: (errorKey: string) => void;
  label: string;
}

export const GoogleLoginButton: React.FC<GoogleLoginButtonProps> = ({ onCredential, disabled = false, onError, label }) => {
  const buttonHostRef = React.useRef<HTMLDivElement>(null);
  const [scriptLoaded, setScriptLoaded] = React.useState(false);
  const [buttonRendered, setButtonRendered] = React.useState(false);

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
    if (!scriptLoaded || !clientId || !buttonHostRef.current) {
      return;
    }

    const googleId = window.google?.accounts?.id;

    if (!googleId) {
      onError?.('script_error');
      return;
    }

    const hostElement = buttonHostRef.current;

    hostElement.innerHTML = '';

    googleId.initialize({
      client_id: clientId,
      callback: response => {
        if (response.credential) {
          onCredential(response.credential);
        }
      },
    });

    googleId.renderButton(hostElement, {
      type: 'standard',
      theme: 'outline',
      shape: 'pill',
      size: 'large',
      width: 428,
      text: 'signin_with',
      logo_alignment: 'center',
    });

    googleId.disableAutoSelect?.();
    setButtonRendered(true);

    return () => {
      googleId.cancel();
      hostElement.innerHTML = '';
      setButtonRendered(false);
    };
  }, [clientId, onCredential, onError, scriptLoaded]);

  return (
    <div className='flex flex-col items-center gap-y-[12rem]'>
      <div className={cn('relative flex w-[428rem] justify-center', (disabled || !scriptLoaded) && 'pointer-events-none opacity-60')}>
        <div ref={buttonHostRef} className='flex justify-center' />
        {!buttonRendered && (
          <button
            type='button'
            className='flex h-[54rem] w-[428rem] items-center justify-center gap-x-[24rem] rounded-full bg-d-light-gray font-medium text-[18rem] leading-none text-d-black'
            disabled
          >
            <img src='/images/icon_google.svg' alt='Google' className='size-[20rem]' />
            {label}
          </button>
        )}
      </div>
    </div>
  );
};
