'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useCustomTranslations } from '@/hooks/useCustomTranslations';
import { useSubscriptionGate } from '@/hooks/useSubscriptionGate';
import { SubscriptionAccessLabel } from '@/components/SubscriptionAccessLabel';
import { PracticeWritingCard } from '@/components/practice/PracticeWritingCard';

export default function Page() {
  const { tImgAlts, tCommon, tActions } = useCustomTranslations('practice.speaking.rules');
  const { requireSubscription, isCheckingAccess } = useSubscriptionGate();
  const [isStarting, setIsStarting] = useState(false);

  return (
    <main className='relative min-h-screen bg-d-red-secondary'>
      <div className='relative z-[1] flex min-h-[100dvh] w-full items-center justify-center px-[16rem] py-[48rem]'>
        <PracticeWritingCard
          closeHref='/practice'
          closeAlt={tImgAlts('close')}
          iconAlt={tImgAlts('speaking')}
          headingLabel={tCommon('speaking')}
          durationLabel={tCommon('minCount', { count: 14 })}
          partsLabel={tCommon('parts')}
          partsValue='3'
          headingSlot={
            <div className='flex items-center gap-x-[12rem]'>
              <div className='flex size-[48rem] items-center justify-center rounded-full bg-d-red-secondary'>
                <img src='/images/icon_speakingSection.svg' className='size-[22rem]' alt={tImgAlts('speaking')} />
              </div>
              <div className='flex flex-col gap-y-[6rem]'>
                <div className='text-[14rem] font-medium leading-none text-d-black/80'>{tCommon('speaking')}</div>
                <div className='text-[18rem] font-semibold leading-none text-d-black'>{tCommon('minCount', { count: 14 })}</div>
              </div>
              <div className='ml-[12rem] flex flex-col gap-y-[6rem]'>
                <div className='text-[14rem] font-medium leading-none text-d-black/80'>{tCommon('parts')}</div>
                <div className='text-[18rem] font-semibold leading-none text-d-black'>3</div>
              </div>
            </div>
          }
        >
          <h1 className='mb-[8rem] text-[20rem] font-semibold leading-tight text-d-black'>What’s in the IELTS Academic Speaking paper?</h1>
          <p className='mb-[16rem] text-[14rem] leading-[1.65] text-d-black/80'>
            The Speaking test is a face-to-face interview between the test taker and an examiner. The Speaking test is recorded. There are three parts to the test, and
            each part follows a specific pattern of tasks in order to test your speaking ability in different ways.
          </p>
          <h1 className='mb-[8rem] text-[20rem] font-semibold leading-tight text-d-black'>Marking</h1>
          <p className='mb-[24rem] text-[14rem] leading-[1.65] text-d-black/80'>
            Certificated IELTS examiners assess your speaking performance throughout the test. There are four assessment criteria (things which the examiner thinks about
            when deciding what score to give you).
          </p>
          <Link
            href='/practice/speaking/audio-check'
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
