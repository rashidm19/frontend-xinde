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

// Display-only map (authoritative amount is enforced server-side). Keep in sync with contract §6.
const PLAN_DISPLAY: Record<string, { kzt: number; label: string }> = {
  '1mo': { kzt: 39000, label: '1 месяц' },
  '3mo': { kzt: 54000, label: '3 месяца' },
  '12mo': { kzt: 149000, label: '12 месяцев' },
};

const fmtKzt = (n: number) => new Intl.NumberFormat('ru-RU').format(n) + ' ₸';

const ensurePaymentScript = async (isSandbox?: boolean) => {
  const src = isSandbox ? EPAY_TEST_URL : EPAY_PROD_URL;
  if (typeof document === 'undefined') return;
  if (!document.querySelector(`script[src="${src}"]`)) {
    await new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => resolve();
      script.onerror = reject;
      document.body.appendChild(script);
    });
  }
};

const launchWidget = async (order: ICheckoutOrderResponse) => {
  await ensurePaymentScript(order.isSandbox);
  window.halyk?.pay({
    invoiceId: order.invoiceId,
    amount: order.amount,
    currency: order.currency,
    terminal: order.terminal,
    backLink: order.backLink,
    failureBackLink: order.failureBackLink,
    postLink: order.postLink,
    postLinkParams: order.postLinkParams,
    language: 'rus',
    description: `HSK Prep #${order.orderId}`,
    auth: order.token,
  });
};

function CheckoutInner() {
  const params = useSearchParams();
  const product = params.get('product') || '';
  const plan = params.get('plan') || '';
  const uid = params.get('uid') || '';
  const email = params.get('email') || '';
  const returnUrl = params.get('return') || '';
  const cancelUrl = params.get('cancel') || '';

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const valid = product === 'hsk' && !!PLAN_DISPLAY[plan] && !!uid && !!returnUrl && !!cancelUrl;
  const display = PLAN_DISPLAY[plan];

  const onPay = async () => {
    setError(null);
    setLoading(true);
    try {
      const order = await POST_hsk_checkout_order({
        product: 'hsk',
        plan,
        uid,
        return_url: returnUrl,
        cancel_url: cancelUrl,
      });
      await launchWidget(order);
    } catch (e) {
      setError('Не удалось начать оплату. Попробуйте ещё раз.');
      setLoading(false);
    }
  };

  if (!valid) {
    return (
      <main className='mx-auto flex min-h-[100dvh] max-w-md flex-col items-center justify-center gap-4 p-6 text-center'>
        <h1 className='text-xl font-semibold'>Некорректная ссылка оплаты</h1>
        <p className='text-sm text-slate-500'>Проверьте ссылку и попробуйте снова из приложения HSK Prep.</p>
      </main>
    );
  }

  return (
    <main className='mx-auto flex min-h-[100dvh] max-w-md flex-col justify-center gap-6 p-6'>
      <div className='rounded-2xl border border-slate-200 p-6 shadow-sm'>
        <h1 className='mb-1 text-lg font-semibold'>HSK Prep — Premium</h1>
        <p className='mb-4 text-sm text-slate-500'>{display.label}</p>
        <div className='mb-6 flex items-baseline justify-between'>
          <span className='text-sm text-slate-500'>К оплате</span>
          <span className='text-2xl font-bold'>{fmtKzt(display.kzt)}</span>
        </div>
        {email ? <p className='mb-4 truncate text-xs text-slate-400'>{email}</p> : null}
        <button
          onClick={onPay}
          disabled={loading}
          className='w-full rounded-xl bg-black py-3 text-center text-sm font-medium text-white disabled:opacity-60'
        >
          {loading ? 'Загрузка…' : 'Оплатить'}
        </button>
        {error ? <p className='mt-3 text-center text-sm text-red-600'>{error}</p> : null}
      </div>
    </main>
  );
}

// useSearchParams() must be under a Suspense boundary or Next 14 build fails (CSR bailout).
export default function HskCheckoutPage() {
  return (
    <React.Suspense fallback={<main className='min-h-[100dvh]' />}>
      <CheckoutInner />
    </React.Suspense>
  );
}
