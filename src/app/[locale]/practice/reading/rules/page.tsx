'use client';

import React, { useState } from 'react';

import { SubscriptionAccessLabel } from '@/components/SubscriptionAccessLabel';
import { PracticeWritingCard } from '@/components/practice/PracticeWritingCard';
import axiosInstance from '@/lib/axiosInstance';
import { useCustomTranslations } from '@/hooks/useCustomTranslations';
import { useSubscriptionGate } from '@/hooks/useSubscriptionGate';
import nProgress from 'nprogress';
import { useRouter } from 'next/navigation';

export default function Page() {
  const router = useRouter();
  const { t, tImgAlts, tCommon, tActions } = useCustomTranslations('practice.reading.rules');
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

      const result = await axiosInstance.get('/practice/reading', {
        validateStatus: () => true,
      });
      if (result.status >= 200 && result.status < 300) {
        nProgress.start();
        const json = result.data;
        if (Array.isArray(json.data) && json.data.length > 0) {
          const randomIndex = Math.floor(Math.random() * json.data.length);
          const randomReadingId = json.data[randomIndex].reading_id;
          localStorage.setItem('practiceReadingId', randomReadingId);
          router.push('/practice/reading/test');
        } else {
          console.error('Нет доступных reading_id');
        }
      }
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <main className='relative min-h-screen bg-d-yellow-secondary'>
      <div className='relative z-[1] flex min-h-screen items-center justify-center px-[16rem] py-[48rem]'>
        <PracticeWritingCard
          closeHref='/practice'
          closeAlt={tImgAlts('close')}
          iconAlt={tImgAlts('reading')}
          headingLabel={<span className='text-[14rem] font-medium text-slate-600'>{tCommon('reading')}</span>}
          durationLabel={<span className='text-[18rem] font-semibold text-slate-900'>{tCommon('minCount', { count: 60 })}</span>}
          partsLabel={<span className='text-[13.5rem] font-medium text-slate-600'>{tCommon('parts')}</span>}
          partsValue={<span className='text-[18rem] font-semibold text-slate-900'>3</span>}
          headingSlot={
            <div className='flex flex-wrap items-center gap-[16rem]'>
              <div className='flex size-[44rem] items-center justify-center rounded-full bg-d-yellow-secondary'>
                <img src='/images/icon_readingSection.svg' className='size-[22rem]' alt={tImgAlts('reading')} />
              </div>
              <div className='flex flex-col gap-[4rem] text-left'>
                <span className='text-[14rem] font-medium leading-none text-slate-600'>{tCommon('reading')}</span>
                <span className='text-[18rem] font-semibold leading-none text-slate-900'>{tCommon('minCount', { count: 60 })}</span>
              </div>
              <div className='ml-[12rem] flex flex-col gap-[4rem] text-left text-slate-700'>
                <span className='text-[13.5rem] font-medium leading-none'>{tCommon('parts')}</span>
                <span className='text-[18rem] font-semibold leading-none text-slate-900'>3</span>
              </div>
              <div className='ml-[12rem] flex flex-col gap-[4rem] text-left text-slate-700'>
                <span className='text-[13.5rem] font-medium leading-none'>{tCommon('questions')}</span>
                <span className='text-[18rem] font-semibold leading-none text-slate-900'>40</span>
              </div>
            </div>
          }
          className='gap-[26rem] border-none bg-white px-[32rem] py-[30rem] shadow-[0_24rem_60rem_-44rem_rgba(15,23,42,0.32)]'
        >
          <section className='flex flex-col gap-[20rem] leading-[1.65] text-slate-700'>
            <div className='space-y-[8rem]'>
              <h1 className='text-[20rem] font-semibold text-slate-900'>{t('title')}</h1>
              <p className="text-[14rem]">{t('text')}</p>
            </div>
            <div className='space-y-[8rem]'>
              <h2 className='text-[20rem] font-semibold text-slate-900'>{tCommon('marking')}</h2>
              <p className="text-[14rem]">{t('marking')}</p>
            </div>
            <div className='flex flex-col items-center gap-[10rem] pt-[6rem]'>
              <button
                onClick={startPractice}
                disabled={isStarting || isCheckingAccess}
                className={`mx-auto flex h-[56rem] w-[240rem] items-center justify-center rounded-[32rem] bg-d-green text-[18rem] font-semibold hover:bg-d-green/40 ${
                  isCheckingAccess || isStarting ? 'pointer-events-none cursor-wait opacity-70' : ''
                }`}
              >
                {isStarting || isCheckingAccess ? '...' : tActions('continue')}
              </button>
              <SubscriptionAccessLabel className='text-[11.5rem] text-slate-500' />
            </div>
          </section>
        </PracticeWritingCard>
      </div>
    </main>
  );
}
