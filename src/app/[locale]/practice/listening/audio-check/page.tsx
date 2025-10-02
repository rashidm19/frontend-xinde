'use client';

import { Footer } from '@/components/Footer';
import Link from 'next/link';
import { useCustomTranslations } from '@/hooks/useCustomTranslations';
import React from 'react';
import { useSubscriptionGate } from '@/hooks/useSubscriptionGate';
import { SubscriptionAccessLabel } from '@/components/SubscriptionAccessLabel';

export default function Page() {
  const { t, tImgAlts, tActions } = useCustomTranslations('practice.listening.audioCheck');
  const { requireSubscription, isCheckingAccess } = useSubscriptionGate();

  return (
    <>
      <main className='min-h-screen overflow-hidden bg-d-light-gray'>
        <div className='container relative min-h-[100dvh] max-w-[1440rem] px-[270rem] py-[80rem]'>
          <section className='relative flex flex-col gap-[24rem] rounded-[16rem] bg-white p-[64rem] shadow-primary'>
            {/* // * Cancel practice  */}
            <Link href='/practice' className='absolute right-[30rem] top-[30rem] flex size-[40rem] items-center justify-center'>
              <img src='/images/icon_cross.svg' alt={tImgAlts('close')} className='size-[20rem]' />
            </Link>

            <h1 className='text-[32rem] font-medium leading-none'>{t('title')}</h1>

            <p className='mb-[32rem] text-[20rem] font-medium leading-tight text-d-black/80'>
              {t.rich('subtitle', {
                br: () => <br />,
              })}
            </p>

            <Link
              href='/practice/listening/test/'
              onClick={async event => {
                if (isCheckingAccess) {
                  event.preventDefault();
                  return;
                }
                const canStart = await requireSubscription();
                if (!canStart) {
                  event.preventDefault();
                }
              }}
              className={`mx-auto flex h-[63rem] w-[280rem] items-center justify-center gap-x-[8rem] rounded-[40rem] bg-d-green text-[20rem] font-semibold hover:bg-d-green/40 ${
                isCheckingAccess ? 'pointer-events-none cursor-wait opacity-70' : ''
              }`}
            >
              <img src='/images/icon_audioPlay.svg' alt={tImgAlts('play')} className='size-[16rem]' />
              {isCheckingAccess ? '...' : tActions('play')}
            </Link>
            <SubscriptionAccessLabel className='text-center' />
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
