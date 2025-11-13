'use client';

import Link from 'next/link';
import React, { useState } from 'react';
import { useCustomTranslations } from '@/hooks/useCustomTranslations';
import { useSubscriptionGate } from '@/hooks/useSubscriptionGate';
import { SubscriptionAccessLabel } from '@/components/SubscriptionAccessLabel';
import { PracticeWritingCard } from '@/components/practice/PracticeWritingCard';

export default function Page() {
  const { t, tImgAlts, tCommon, tActions } = useCustomTranslations('practice.writing.rules');
  const { requireSubscription, isCheckingAccess } = useSubscriptionGate();
  const [isStarting, setIsStarting] = useState(false);

  return (
    <main className='relative min-h-screen bg-d-blue-secondary'>
      <div className='relative z-[1] flex min-h-[100dvh] w-full items-center justify-center px-[16rem] py-[48rem]'>
        <PracticeWritingCard
          closeHref='/practice'
          closeAlt={tImgAlts('close')}
          iconAlt={tImgAlts('writing')}
          headingLabel={tCommon('writing')}
          durationLabel={tCommon('minCount', { count: 60 })}
          partsLabel={tCommon('parts')}
          partsValue='2'
        >
          <h1 className='mb-[8rem] text-[20rem] font-semibold leading-tight text-d-black'>{t('title')}</h1>
          <p className='mb-[16rem] text-[14rem] leading-[1.65] text-d-black/80'>{t('text')}</p>
          <h1 className='mb-[8rem] text-[20rem] font-semibold leading-tight text-d-black'>{tCommon('marking')}</h1>
          <p className='mb-[24rem] text-[14rem] leading-[1.65] text-d-black/80'>{t('marking')}</p>
          <Link
            href='/practice/writing/test'
            onClick={async event => {
              if (isStarting || isCheckingAccess) {
                event.preventDefault();
                return;
              }

              setIsStarting(true);
              const canStart = await requireSubscription();
              setIsStarting(false);

              if (!canStart) {
                event.preventDefault();
              }
            }}
            className={`mx-auto flex h-[56rem] w-[240rem] items-center justify-center rounded-[32rem] bg-d-green text-[18rem] font-semibold hover:bg-d-green/40 ${
              isCheckingAccess || isStarting ? 'pointer-events-none cursor-wait opacity-70' : ''
            }`}
          >
            {isCheckingAccess || isStarting ? '...' : tActions('continue')}
          </Link>
          <SubscriptionAccessLabel className='mt-[10rem] text-center text-[12rem]' />
        </PracticeWritingCard>
      </div>
    </main>
  );
}
