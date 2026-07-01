'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import { POST_hsk_checkout_order } from '@/api/POST_hsk_checkout_order';
import { EPAY_PROD_URL, EPAY_TEST_URL } from '@/lib/config';
import { ICheckoutOrderResponse } from '@/types/Payments';

declare global {
  interface Window {
    halyk?: any;
  }
}

// Display-only (authoritative amount is enforced server-side). Keep in sync with contract §6.
const PLAN_DISPLAY: Record<string, { kzt: number; label: string }> = {
  '1mo': { kzt: 39000, label: '1 month' },
  '3mo': { kzt: 54000, label: '3 months' },
  '12mo': { kzt: 149000, label: '12 months' },
};
const ALLOWED_HOSTS = ['hskprep.cc', 'www.hskprep.cc'];

const fmtKzt = (n: number) => new Intl.NumberFormat('ru-RU').format(n) + ' ₸';

const isAllowedUrl = (url: string) => {
  try {
    const u = new URL(url);
    return u.protocol === 'https:' && ALLOWED_HOSTS.includes(u.hostname);
  } catch {
    return false;
  }
};

const ensurePaymentScript = async (isSandbox?: boolean) => {
  const src = isSandbox ? EPAY_TEST_URL : EPAY_PROD_URL;
  if (typeof document === 'undefined') return;
  if (!document.querySelector(`script[src="${src}"]`)) {
    await new Promise<void>((resolve, reject) => {
      const s = document.createElement('script');
      s.src = src;
      s.onload = () => resolve();
      s.onerror = reject;
      document.body.appendChild(s);
    });
  }
};

const launchWidget = (order: ICheckoutOrderResponse) => {
  // Full-page redirect to the ePay hosted page (not an overlay) — no user gesture needed.
  window.halyk?.pay({
    invoiceId: order.invoiceId,
    amount: order.amount,
    currency: order.currency,
    terminal: order.terminal,
    backLink: order.backLink,
    failureBackLink: order.failureBackLink,
    postLink: order.postLink,
    postLinkParams: order.postLinkParams,
    language: 'eng',
    description: `HSK Prep #${order.orderId}`,
    auth: order.token,
  });
};

function Wordmark() {
  return (
    <div style={{ fontWeight: 700, fontSize: 20, letterSpacing: '-0.01em' }}>
      HSK <span style={{ color: 'var(--muted)', fontWeight: 500 }}>Prep</span>
    </div>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main
      style={{
        minHeight: '100dvh',
        background: 'var(--bg)',
        color: 'var(--fg)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 22,
        padding: 24,
        textAlign: 'center',
      }}
    >
      {children}
    </main>
  );
}

function Loader({ display }: { display?: { kzt: number; label: string } }) {
  return (
    <Shell>
      <Wordmark />
      <div
        aria-hidden
        style={{
          width: 38,
          height: 38,
          borderRadius: '50%',
          border: '3px solid var(--sunken)',
          borderTopColor: 'var(--accent)',
          animation: 'hsk-spin 0.8s linear infinite',
        }}
      />
      <p style={{ fontSize: 15, margin: 0 }}>Redirecting to secure payment…</p>
      {display ? (
        <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0 }}>
          HSK Prep Premium · {display.label} · {fmtKzt(display.kzt)}
        </p>
      ) : null}
    </Shell>
  );
}

function ErrorScreen({ title, detail, onRetry }: { title: string; detail: string; onRetry?: () => void }) {
  return (
    <Shell>
      <Wordmark />
      <div style={{ maxWidth: 360, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
        <p style={{ fontSize: 17, fontWeight: 600, color: 'var(--err)', margin: 0 }}>{title}</p>
        <p style={{ fontSize: 14, color: 'var(--muted)', margin: 0 }}>{detail}</p>
        {onRetry ? (
          <button
            onClick={onRetry}
            style={{
              width: '100%',
              marginTop: 8,
              background: 'var(--accent)',
              color: '#fff',
              border: 'none',
              padding: '14px 22px',
              borderRadius: 12,
              fontFamily: 'inherit',
              fontSize: 15,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Pay
          </button>
        ) : null}
      </div>
    </Shell>
  );
}

function CheckoutInner() {
  const params = useSearchParams();
  const product = params.get('product') || '';
  const plan = params.get('plan') || '';
  const uid = params.get('uid') || '';
  const returnUrl = params.get('return') || '';
  const cancelUrl = params.get('cancel') || '';

  const display = PLAN_DISPLAY[plan];
  const valid = product === 'hsk' && !!display && !!uid && isAllowedUrl(returnUrl) && isAllowedUrl(cancelUrl);

  const [state, setState] = React.useState<'loading' | 'invalid' | 'error'>(valid ? 'loading' : 'invalid');
  const startedRef = React.useRef(false);

  const start = React.useCallback(async () => {
    setState('loading');
    try {
      const order = await POST_hsk_checkout_order({
        product: 'hsk',
        plan,
        uid,
        return_url: returnUrl,
        cancel_url: cancelUrl,
      });
      await ensurePaymentScript(order.isSandbox ?? undefined);
      if (typeof window === 'undefined' || !window.halyk?.pay) throw new Error('halyk unavailable');
      launchWidget(order); // redirects the whole page to ePay
    } catch {
      setState('error');
    }
  }, [plan, uid, returnUrl, cancelUrl]);

  React.useEffect(() => {
    // Auto-start exactly once per mount. The ref guard survives React re-renders and
    // StrictMode's double-invoked effect, so we never create two orders / two invoices.
    if (!valid || startedRef.current) return;
    startedRef.current = true;
    void start();
  }, [valid, start]);

  if (state === 'invalid') {
    return (
      <ErrorScreen
        title="Invalid payment link"
        detail="Please check the link and try again from the HSK Prep app."
      />
    );
  }
  if (state === 'error') {
    return (
      <ErrorScreen
        title="Couldn’t start payment"
        detail="Something went wrong. Please try again."
        onRetry={() => {
          void start();
        }}
      />
    );
  }
  return <Loader display={display} />;
}

export default function HskCheckoutPage() {
  // useSearchParams must sit under a Suspense boundary (Next 14 build requirement).
  return (
    <React.Suspense fallback={<main style={{ minHeight: '100dvh', background: 'var(--bg)' }} />}>
      <CheckoutInner />
    </React.Suspense>
  );
}
