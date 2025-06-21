'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';

const Mic = dynamic(() => import('./_components/Mic').then(mod => mod.default), { ssr: false });

export default function Page() {
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
          <Link href='/practice' className='absolute right-[30rem] top-[30rem] flex size-[40rem] items-center justify-center'>
            <img src='/images/icon_cross.svg' alt='close' className='size-[20rem]' />
          </Link>

          {/* // * Header */}
          <header className='flex flex-col items-center justify-center gap-y-[24rem]'>
            <div className='w-full text-center text-[32rem] font-medium leading-none'>Check your microphone</div>
            <div className='w-full text-center text-[20rem] font-medium leading-none'>Turn on the microphone trough the browser</div>
          </header>

          <Mic />

          <Link
            href='/[locale]/practice/speaking/test'
            className='mx-auto flex h-[63rem] w-[280rem] items-center justify-center rounded-[40rem] bg-d-green text-[20rem] font-semibold hover:bg-d-green/40'
          >
            Continue
          </Link>
        </div>
      </div>
    </main>
  );
}
