'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useSubscriptionGate } from '@/hooks/useSubscriptionGate';
import { SubscriptionAccessLabel } from '@/components/SubscriptionAccessLabel';

export default function Page() {
  const { requireSubscription, isCheckingAccess } = useSubscriptionGate('mock');
  const [isStarting, setIsStarting] = useState(false);

  return (
    <main className='min-h-screen overflow-hidden bg-d-red-secondary'>
      <div className='container relative max-w-[1440rem] px-[270rem] pb-[150rem] pt-[80rem]'>
        <img
          src='/images/illustration_halfspheres.png'
          alt='illustration'
          className='pointer-events-none absolute right-[120rem] top-[140rem] h-auto w-[264rem] rotate-[14deg] opacity-20 mix-blend-multiply'
        />
        <img
          src='/images/illustration_flowerOrange.png'
          alt='illustration'
          className='pointer-events-none absolute left-[-60rem] top-[716rem] h-auto w-[392rem] rotate-[-16deg] opacity-20 mix-blend-multiply'
        />
        <div className='relative z-10 flex flex-col gap-[48rem] rounded-[16rem] bg-white p-[64rem] shadow-card'>
          {/* // * Cancel practice  */}
          <Link href='/mock' className='absolute right-[30rem] top-[30rem] flex size-[40rem] items-center justify-center'>
            <img src='/images/icon_cross.svg' alt='close' className='size-[20rem]' />
          </Link>

          {/* // * Header */}
          <div className='flex items-center gap-x-[12rem]'>
            <div className='flex size-[52rem] items-center justify-center bg-d-red-secondary'>
              <img src='/images/icon_speakingSection.svg' className='size-[24rem]' alt='speaking' />
            </div>
            <div className='flex flex-col gap-y-[6rem]'>
              <div className='text-[16rem] font-medium leading-none text-d-black/80'>Speaking</div>
              <div className='text-[20rem] font-medium leading-none'>~ 14 min</div>
            </div>
            <div className='ml-[12rem] flex flex-col gap-y-[6rem]'>
              <div className='text-[16rem] font-medium leading-none text-d-black/80'>Parts</div>
              <div className='text-[20rem] font-medium leading-none'>3</div>
            </div>
          </div>
          {/* // * Seclection */}
          <div>
            <h1 className='mb-[32rem] text-[32rem] font-medium leading-none'>What’s in the IELTS Academic Speaking paper?</h1>
            <p className='mb-[48rem] text-[20rem] font-medium leading-tight text-d-black/80'>
              The Speaking test is a face-to-face interview between the test taker and an examiner. The Speaking test is recorded.
              <br />
              <br /> There are three parts to the test, and each part follows a specific pattern of tasks in order to test your speaking ability in different ways.
            </p>
            <h1 className='mb-[32rem] text-[32rem] font-medium leading-none'>Marking</h1>
            <p className='mb-[48rem] text-[20rem] font-medium leading-tight text-d-black/80'>
              Certificated IELTS examiners assess your speaking performance throughout the test. There are four assessment criteria (things which the examiner thinks
              about when deciding what score to give you):
            </p>
            <Link
              href='/mock/exam/speaking/audio-check/'
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
              className={`mx-auto flex h-[63rem] w-[280rem] items-center justify-center rounded-[40rem] bg-d-green text-[20rem] font-semibold hover:bg-d-green/40 ${
                isStarting || isCheckingAccess ? 'pointer-events-none cursor-wait opacity-70' : ''
              }`}
            >
              {isStarting || isCheckingAccess ? '...' : 'Continue'}
            </Link>
            <SubscriptionAccessLabel className='mt-[12rem] text-center' />
          </div>
        </div>
      </div>
    </main>
  );
}
