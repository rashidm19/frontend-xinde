'use client';

import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { useCustomTranslations } from '@/hooks/useCustomTranslations';
import { useMutation } from '@tanstack/react-query';
import { POST_payment_checkout_order } from '@/api/POST_payment_checkout_order';
import { refreshSubscriptionAndBalance } from '@/stores/subscriptionStore';
import { EPAY_PROD_URL, EPAY_TEST_URL } from '@/lib/config';
import { IPaymentOrder } from '@/types/Payments';
import axios from 'axios';
import { useRouter } from 'next/navigation';

declare global {
  interface Window {
    halyk?: any;
  }
}

interface DiscountInfo {
  amount: number;
  currency: string;
}

interface PromoPromptModalProps {
  open: boolean;
  planId: string | null;
  onClose: () => void;
  onBackToPlans?: () => void;
  onDiscountUpdate?: (planId: string, info: DiscountInfo) => void;
  onSuccessMessage?: (message: string | null) => void;
  onErrorMessage?: (message: string | null) => void;
}

export const PromoPromptModal = ({ open, planId, onClose, onBackToPlans, onDiscountUpdate, onSuccessMessage, onErrorMessage }: PromoPromptModalProps) => {
  const { t, tActions } = useCustomTranslations('pricesModal');
  const router = useRouter();

  const [step, setStep] = React.useState<'prompt' | 'input'>('prompt');
  const [promoCode, setPromoCode] = React.useState('');
  const [promoError, setPromoError] = React.useState<string | null>(null);
  const [processingPlanId, setProcessingPlanId] = React.useState<string | null>(null);
  const [isAnswerNoPending, setIsAnswerNoPending] = React.useState(false);

  const mutation = useMutation({
    mutationFn: POST_payment_checkout_order,
  });

  const resetState = React.useCallback(() => {
    setStep('prompt');
    setPromoCode('');
    setPromoError(null);
    setProcessingPlanId(null);
    setIsAnswerNoPending(false);
  }, []);

  const closeModal = React.useCallback(() => {
    resetState();
    onErrorMessage?.(null);
    onClose();
  }, [onClose, onErrorMessage, resetState]);

  React.useEffect(() => {
    if (open) {
      resetState();
    }
  }, [open, planId, resetState]);

  const ensurePaymentScript = async (order: IPaymentOrder) => {
    const src = order.isSandbox ? EPAY_TEST_URL : EPAY_PROD_URL;

    if (typeof document === 'undefined') {
      return;
    }

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

  const pay = async (order: IPaymentOrder) => {
    const invoiceId = order.invoiceId ?? null;
    const token = order.token ?? null;
    const postLink = order.postLink ?? null;
    const postLinkParams = order.postLinkParams ?? null;
    const terminal = order.terminal ?? null;

    if (!invoiceId || !token || !postLink || !postLinkParams || !terminal) {
      throw new Error(t('promo.missingPaymentData'));
    }

    let backLink = order.backLink ?? null;
    let failureBackLink = order.failureBackLink ?? null;

    if (typeof window !== 'undefined') {
      const successUrl = new URL(window.location.href);
      successUrl.searchParams.set('subscribePaymentStatus', 'true');
      const failureUrl = new URL(window.location.href);
      failureUrl.searchParams.set('subscribePaymentStatus', 'false');

      backLink = backLink ?? successUrl.toString();
      failureBackLink = failureBackLink ?? failureUrl.toString();
    } else {
      backLink = backLink ?? '/profile?subscribePaymentStatus=true';
      failureBackLink = failureBackLink ?? '/profile?subscribePaymentStatus=false';
    }

    await ensurePaymentScript(order);

    window.halyk?.pay({
      invoiceId,
      amount: order.amount,
      currency: order.currency,
      terminal,
      backLink,
      failureBackLink,
      postLink,
      postLinkParams,
      language: 'rus',
      description: `Покупка услуги #${order.orderId}`,
      auth: token,
    });
  };

  const handleSubmit = async (code?: string) => {
    if (!planId) {
      return false;
    }

    const parsedPlanId = Number(planId);

    if (!Number.isFinite(parsedPlanId)) {
      const message = t('promo.errorDefault');
      setPromoError(message);
      onErrorMessage?.(message);
      return false;
    }

    setProcessingPlanId(planId);
    setPromoError(null);
    onErrorMessage?.(null);

    try {
      const response = await mutation.mutateAsync({
        plan_id: parsedPlanId,
        promo_code: code?.trim() ? code.trim() : undefined,
      });

      const { requiresPayment, ...order } = response;

      if (order?.amount !== undefined && order?.currency) {
        onDiscountUpdate?.(planId, {
          amount: order.amount,
          currency: order.currency,
        });
      }

      if (!requiresPayment) {
        await refreshSubscriptionAndBalance();
        onSuccessMessage?.(t('promo.accessGranted'));

        const discountCoveredTotal = order?.amount !== undefined ? order.amount <= 0 : true;
        if (discountCoveredTotal && code?.trim() && typeof window !== 'undefined') {
          const url = new URL(window.location.href);
          url.searchParams.set('subscribePaymentStatus', 'true');
          router.replace(`${url.pathname}${url.search}${url.hash}`, { scroll: false });
        }

        return true;
      }

      if (!order) {
        const message = t('promo.missingPaymentData');
        setPromoError(message);
        onErrorMessage?.(message);
        return false;
      }

      await pay(order);
      return true;
    } catch (error) {
      let message: string | null;

      if (axios.isAxiosError(error)) {
        const statusCode = error.response?.status;
        const responseMessage = error.response?.data?.message;

        if (statusCode === 400 && typeof responseMessage === 'string') {
          message = responseMessage;
        } else {
          message = (typeof responseMessage === 'string' && responseMessage.length > 0 ? responseMessage : null) ?? t('promo.errorDefault');
        }
      } else if (error instanceof Error) {
        message = error.message || t('promo.errorDefault');
      } else {
        message = t('promo.errorDefault');
      }

      setPromoError(message);
      onErrorMessage?.(message);
      return false;
    } finally {
      setProcessingPlanId(null);
    }
  };

  const handlePromoYes = () => {
    setPromoError(null);
    setStep('input');
  };

  const handleNoPromo = async () => {
    if (!planId || processingPlanId) {
      return;
    }

    setIsAnswerNoPending(true);

    const success = await handleSubmit();

    if (success) {
      closeModal();
    }

    setIsAnswerNoPending(false);
  };

  const handleConfirmPromo = async () => {
    if (!planId || processingPlanId) {
      return;
    }

    const success = await handleSubmit(promoCode);

    if (success) {
      closeModal();
    }
  };

  const handleBack = () => {
    closeModal();
    onBackToPlans?.();
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      closeModal();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className='fixed left-1/2 top-1/2 flex w-[90vw] max-w-[520rem] -translate-x-1/2 -translate-y-1/2 flex-col gap-y-[20rem] rounded-[24rem] bg-white p-[32rem] text-center shadow-lg'>
        {step === 'prompt' ? (
          <>
            <DialogHeader>
              <DialogTitle className='text-[20rem] font-semibold'>{t('promo.promptTitle')}</DialogTitle>
              <DialogDescription className='text-[16rem] leading-tight text-d-black/80'>{t('promo.promptQuestion')}</DialogDescription>
            </DialogHeader>

            <div className='mt-[12rem] flex flex-col gap-[12rem] tablet:flex-row tablet:justify-center tablet:gap-[16rem]'>
              <button
                type='button'
                onClick={handleNoPromo}
                disabled={isAnswerNoPending || processingPlanId === planId}
                className='w-full rounded-full bg-d-green px-[24rem] py-[12rem] text-[16rem] font-semibold text-black hover:bg-d-green/80 disabled:cursor-not-allowed tablet:w-[200rem]'
              >
                {isAnswerNoPending ? (
                  <svg className='mx-auto size-[20rem] animate-spin text-d-black' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'>
                    <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' />
                    <path
                      className='opacity-75'
                      fill='currentColor'
                      d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                    />
                  </svg>
                ) : (
                  t('promo.answerNo')
                )}
              </button>

              <button
                type='button'
                onClick={handlePromoYes}
                className='w-full rounded-full border border-d-light-gray px-[24rem] py-[12rem] text-[16rem] font-semibold text-d-black hover:border-d-green disabled:border-d-light-gray disabled:text-d-black/60 tablet:w-[160rem]'
              >
                {t('promo.answerYes')}
              </button>
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className='text-[20rem] font-semibold'>{t('promo.inputTitle')}</DialogTitle>
              <DialogDescription className='text-[16rem] leading-tight text-d-black/80'>{t('promo.inputHint')}</DialogDescription>
            </DialogHeader>

            <input
              value={promoCode}
              onChange={event => {
                setPromoCode(event.target.value);
                setPromoError(null);
                onErrorMessage?.(null);
              }}
              placeholder={t('promo.placeholder')}
              className='w-full rounded-full border border-d-light-gray bg-white px-[24rem] py-[12rem] text-[16rem] font-medium leading-tight text-d-black outline-none focus:border-d-green'
            />

            {promoError && <p className='rounded-[16rem] bg-d-red/10 px-[24rem] py-[8rem] text-[14rem] font-medium text-d-red'>{promoError}</p>}

            <div className='mt-[12rem] flex flex-col gap-[12rem] tablet:flex-row tablet:justify-center tablet:gap-[16rem]'>
              <button
                type='button'
                onClick={handleConfirmPromo}
                disabled={processingPlanId === planId}
                className='w-full rounded-full bg-d-green px-[24rem] py-[12rem] text-[16rem] font-semibold text-black hover:bg-d-green/80 disabled:cursor-not-allowed disabled:bg-d-gray/60 disabled:text-d-black/60 tablet:w-[200rem]'
              >
                {processingPlanId === planId ? (
                  <svg className='mx-auto size-[20rem] animate-spin text-black' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'>
                    <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' />
                    <path
                      className='opacity-75'
                      fill='currentColor'
                      d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                    />
                  </svg>
                ) : (
                  t('promo.confirm')
                )}
              </button>
              <button
                type='button'
                onClick={handleBack}
                className='w-full rounded-full border border-d-light-gray px-[24rem] py-[12rem] text-[16rem] font-semibold text-d-black hover:border-d-green tablet:w-[160rem]'
              >
                {tActions('back')}
              </button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
