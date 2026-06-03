"use client";

import React, { useState } from "react";

import { SubscriptionAccessLabel } from "@/components/SubscriptionAccessLabel";
import { PracticeWritingCard } from "@/components/practice/PracticeWritingCard";
import axiosInstance from "@/lib/axiosInstance";
import { setPracticeSessionCookie } from '@/lib/practiceSession';
import { useCustomTranslations } from "@/hooks/useCustomTranslations";
import { useSubscriptionGate } from "@/hooks/useSubscriptionGate";
import nProgress from "nprogress";
import { useRouter } from "next/navigation";

export function ListeningRulesClient() {
  const router = useRouter();
  const { t, tImgAlts, tCommon, tActions } = useCustomTranslations("practice.listening.rules");
  const { requireSubscription, isCheckingAccess } = useSubscriptionGate();
  const [isStarting, setIsStarting] = useState(false);

  const startPractice = async () => {
    if (isStarting || isCheckingAccess) {
      return;
    }

    setIsStarting(true);

    try {
      const canStart = await requireSubscription();

      if (!canStart) {
        return;
      }

      const result = await axiosInstance.get("/practice/listening", {
        validateStatus: () => true,
      });

      if (result.status >= 200 && result.status < 300) {
        nProgress.start();
        const payload = result.data;
        if (Array.isArray(payload.data) && payload.data.length > 0) {
          const randomIndex = Math.floor(Math.random() * payload.data.length);
          const randomListeningId = payload.data[randomIndex].listening_id;
          await setPracticeSessionCookie({ flow: 'listening', practiceId: randomListeningId });
          router.push("/practice/listening/audio-check");
        } else {
          console.error("No available listening tasks");
        }
      }
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <main className='relative min-h-screen bg-d-mint'>
      <div className='relative z-[1] flex min-h-screen items-center justify-center px-[16rem] py-[48rem]'>
        <PracticeWritingCard
          closeHref='/practice'
          closeAlt={tImgAlts('close')}
          iconAlt={tImgAlts('listening')}
          headingLabel={<span className='text-[14rem] font-medium text-slate-600'>{tCommon('listening')}</span>}
          durationLabel={<span className='text-[18rem] font-semibold text-slate-900'>{tCommon('minCount', { count: 30 })}</span>}
          partsLabel={<span className='text-[13.5rem] font-medium text-slate-600'>{tCommon('parts')}</span>}
          partsValue={<span className='text-[18rem] font-semibold text-slate-900'>4</span>}
          headingSlot={
            <div className='flex flex-wrap items-center gap-[16rem]'>
              <div className='flex size-[44rem] items-center justify-center rounded-full bg-d-mint'>
                <img src='/images/icon_listeningSection.svg' className='size-[22rem]' alt={tImgAlts('listening')} />
              </div>
              <div className='flex flex-col gap-[4rem] text-left'>
                <span className='text-[14rem] font-medium leading-none text-slate-600'>{tCommon('listening')}</span>
                <span className='text-[18rem] font-semibold leading-none text-slate-900'>{tCommon('minCount', { count: 30 })}</span>
              </div>
              <div className='ml-[12rem] flex flex-col gap-[4rem] text-left text-slate-700'>
                <span className='text-[13.5rem] font-medium leading-none'>{tCommon('parts')}</span>
                <span className='text-[18rem] font-semibold leading-none text-slate-900'>4</span>
              </div>
            </div>
          }
          className='max-w-[660rem] gap-[26rem] border-none bg-white px-[32rem] py-[30rem] shadow-[0_24rem_60rem_-44rem_rgba(15,23,42,0.32)]'
        >
          <section>
            <h1 className='mb-[8rem] text-[20rem] font-medium leading-none'>{t('title')}</h1>
            <p className='mb-[16rem] text-[14rem] font-medium leading-tight text-d-black/80'>
              {t.rich('text', {
                br: () => <br />,
              })}
            </p>
            <h2 className='mb-[8rem] text-[20rem] font-medium leading-none'>{tCommon('marking')}</h2>
            <p className='mb-[24rem] text-[14rem] font-medium leading-tight text-d-black/80'>{t('marking')}</p>

            <button
              onClick={startPractice}
              disabled={isStarting || isCheckingAccess}
              className={`mx-auto flex h-[56rem] w-[240rem] items-center justify-center rounded-[32rem] bg-d-green text-[18rem] font-semibold hover:bg-d-green/40 ${
                isCheckingAccess || isStarting ? 'pointer-events-none cursor-wait opacity-70' : ''
              }`}
            >
              {isCheckingAccess || isStarting ? '...' : tActions('continue')}
            </button>
            <SubscriptionAccessLabel className='mt-[10rem] text-center text-[12rem]' />
          </section>
        </PracticeWritingCard>
      </div>
    </main>
  );
}
