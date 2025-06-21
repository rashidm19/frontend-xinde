'use client';

import { Footer } from '@/components/Footer';
import Link from 'next/link';

export default function Page() {
  return (
    <>
      <main className='min-h-screen overflow-hidden bg-d-light-gray'>
        <div className='container relative min-h-[100dvh] max-w-[1440rem] px-[270rem] py-[80rem]'>
          <section className='relative flex flex-col gap-[24rem] rounded-[16rem] bg-white p-[64rem] shadow-primary'>
            {/* // * Cancel practice  */}
            <Link href='/mock' className='absolute right-[30rem] top-[30rem] flex size-[40rem] items-center justify-center'>
              <img src='/images/icon_cross.svg' alt='close' className='size-[20rem]' />
            </Link>

            <h1 className='text-[32rem] font-medium leading-none'>Play the record</h1>

            <p className='mb-[32rem] text-[20rem] font-medium leading-tight text-d-black/80'>
              You will be listening to an audio clip during this test.
              <br /> You will not be permitted to pause or rewind the audio while answering the questions.
            </p>

            <Link
              href='/[locale]/mock/exam/listening/test/'
              className='mx-auto flex h-[63rem] w-[280rem] items-center justify-center gap-x-[8rem] rounded-[40rem] bg-d-green text-[20rem] font-semibold hover:bg-d-green/40'
            >
              <img src='/images/icon_audioPlay.svg' alt='play' className='size-[16rem]' />
              Play
            </Link>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
