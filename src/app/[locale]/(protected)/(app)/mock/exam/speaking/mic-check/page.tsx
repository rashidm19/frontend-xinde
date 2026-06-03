'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useSubscriptionGate } from '@/hooks/useSubscriptionGate';
import { SubscriptionAccessLabel } from '@/components/SubscriptionAccessLabel';

const Mic = dynamic(() => import('../../../../practice/speaking/mic-check/_components/Mic').then(mod => mod.default), { ssr: false });

export default function Page() {
  const { requireSubscription, isCheckingAccess } = useSubscriptionGate('mock');

  return (
    <main className='min-h-screen overflow-hidden bg-d-red-secondary'>
      <div className='container relative max-w-[1440rem] px-[248rem] pb-[48rem] pt-[64rem]'>
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

        <div className='relative z-10 flex flex-col items-center gap-[56rem] rounded-[16rem] bg-white p-[64rem] shadow-card'>
          {/* // * Cancel practice  */}
          <Link href='/mock' className='absolute right-[30rem] top-[30rem] flex size-[40rem] items-center justify-center'>
            <img src='/images/icon_cross.svg' alt='close' className='size-[20rem]' />
          </Link>

          {/* // * Header */}
          <header className='flex flex-col items-center justify-center gap-y-[24rem]'>
            <div className='w-full text-center text-[32rem] font-medium leading-none'>Check your microphone</div>
            <div className='w-full text-center text-[20rem] font-medium leading-none'>Turn on the microphone trough the browser</div>
          </header>

          <Mic />

          <Link
            href='/mock/exam/speaking/test'
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
            className={`mx-auto flex h-[63rem] w-[280rem] items-center justify-center rounded-[40rem] bg-d-green text-[20rem] font-semibold hover:bg-d-green/40 ${
              isCheckingAccess ? 'pointer-events-none cursor-wait opacity-70' : ''
            }`}
          >
            {isCheckingAccess ? '...' : 'Continue'}
          </Link>
          <SubscriptionAccessLabel className='text-center' />
        </div>
      </div>
    </main>
  );
}
