'use client';

import Link from 'next/link';
import React, { useState } from 'react';
import { useCustomTranslations } from '@/hooks/useCustomTranslations';
import nProgress from 'nprogress';
import { useRouter } from 'next/navigation';
import axiosInstance from '@/lib/axiosInstance';
import { useSubscriptionGate } from '@/hooks/useSubscriptionGate';
import { SubscriptionAccessLabel } from '@/components/SubscriptionAccessLabel';

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
    <main className='min-h-screen overflow-hidden bg-d-yellow-secondary'>
      <div className='container relative max-w-[1440rem] px-[270rem] pb-[150rem] pt-[80rem]'>
        <img
          alt={tImgAlts('pyramid')}
          src='/images/illustration_pyramide.png'
          className='pointer-events-none absolute left-[40rem] top-[760rem] h-auto w-[320rem] rotate-[-42deg] opacity-30 mix-blend-multiply'
        />
        <img
          alt={tImgAlts('softball')}
          src='/images/illustration_softball.png'
          className='pointer-events-none absolute right-[54rem] top-[20rem] h-auto w-[318rem] opacity-30 mix-blend-multiply'
        />

        <div className='relative z-10 flex flex-col gap-[48rem] rounded-[16rem] bg-white p-[64rem] shadow-card'>
          {/* // * Cancel practice  */}
          <Link href='/practice' className='absolute right-[30rem] top-[30rem] flex size-[40rem] items-center justify-center'>
            <img src='/images/icon_cross.svg' alt={tImgAlts('close')} className='size-[20rem]' />
          </Link>

          {/* // * Header */}
          <header className='flex items-center gap-x-[12rem]'>
            <div className='flex size-[52rem] items-center justify-center bg-d-yellow-secondary'>
              <img src='/images/icon_readingSection.svg' className='size-[24rem]' alt={tImgAlts('reading')} />
            </div>
            <div className='flex flex-col gap-y-[6rem]'>
              <div className='text-[16rem] font-medium leading-none text-d-black/80'>{tCommon('reading')}</div>
              <div className='text-[20rem] font-medium leading-none'>{tCommon('minCount', { count: 60 })}</div>
            </div>
            <div className='ml-[12rem] flex flex-col gap-y-[6rem]'>
              <div className='text-[16rem] font-medium leading-none text-d-black/80'>{tCommon('parts')}</div>
              <div className='text-[20rem] font-medium leading-none'>3</div>
            </div>
            <div className='ml-[12rem] flex flex-col gap-y-[6rem]'>
              <div className='text-[16rem] font-medium leading-none text-d-black/80'>{tCommon('questions')}</div>
              <div className='text-[20rem] font-medium leading-none'>40</div>
            </div>
          </header>

          {/* // * Rules */}
          <section>
            <h1 className='mb-[32rem] text-[32rem] font-medium leading-none'>{t('title')}</h1>
            <p className='mb-[48rem] text-[20rem] font-medium leading-tight text-d-black/80'>{t('text')}</p>
            <h1 className='mb-[32rem] text-[32rem] font-medium leading-none'>{tCommon('marking')}</h1>
            <p className='mb-[48rem] text-[20rem] font-medium leading-tight text-d-black/80'>{t('marking')}</p>
            <button
              onClick={startPractice}
              disabled={isStarting || isCheckingAccess}
              className='mx-auto flex h-[63rem] w-[280rem] items-center justify-center rounded-[40rem] bg-d-green text-[20rem] font-semibold hover:bg-d-green/40 disabled:cursor-not-allowed disabled:bg-d-gray/60 disabled:text-d-black/60'
            >
              {isStarting || isCheckingAccess ? '...' : tActions('continue')}
            </button>
            <SubscriptionAccessLabel className='mt-[12rem] text-center' />
          </section>
        </div>
      </div>
    </main>
  );
}
