'use client';

import { Footer } from '@/components/Footer';
import Link from 'next/link';

export default function Page() {
  return (
    <>
      <main className='min-h-screen overflow-hidden bg-d-light-gray'>
        <div className='container relative min-h-[100dvh] max-w-[1440rem] px-[270rem] py-[80rem]'>
          <img src='/images/illustration_bread.png' alt='illustration' className='absolute right-[81rem] top-[67rem] h-auto w-[238rem] opacity-60 mix-blend-multiply' />
          <img
            src='/images/illustration_abstract.png'
            alt='illustration'
            className='absolute left-[-11rem] top-[738rem] h-auto w-[303rem] opacity-60 mix-blend-multiply'
          />

          <div className='relative flex flex-col gap-[48rem] rounded-[16rem] bg-white p-[64rem] shadow-primary'>
            {/* // * Cancel practice  */}
            <Link href='/practice' className='absolute right-[30rem] top-[30rem] flex size-[40rem] items-center justify-center'>
              <img src='/images/icon_cross.svg' alt='close' className='size-[20rem]' />
            </Link>
            {/* // * Header */}
            <header className='flex items-center gap-x-[12rem]'>
              <div className='bg-d-mint flex size-[52rem] items-center justify-center'>
                <img src='/images/icon_listeningSection.svg' className='size-[24rem]' alt='listening' />
              </div>
              <div className='flex flex-col gap-y-[6rem]'>
                <div className='text-[16rem] font-medium leading-none text-d-black/80'>Listening</div>
                <div className='text-[20rem] font-medium leading-none'>30 min</div>
              </div>
              <div className='ml-[12rem] flex flex-col gap-y-[6rem]'>
                <div className='text-[16rem] font-medium leading-none text-d-black/80'>Parts</div>
                <div className='text-[20rem] font-medium leading-none'>4</div>
              </div>
            </header>

            {/* // * Rules */}
            <section>
              <h1 className='mb-[32rem] text-[32rem] font-medium leading-none'>What’s in the IELTS Academic Listening paper?</h1>
              <p className='mb-[48rem] text-[20rem] font-medium leading-tight text-d-black/80'>
                The paper has four parts, with ten questions in each part. The questions are in the same order as the information in the recording, so the answer to the
                first question will be before the answer to the second question, and so on.
                <br />
                <br />
                Parts 1 and 2 deal with everyday, social situations. There is a conversation between two speakers in Part 1 (for example, a conversation about travel
                arrangements). Only one person speaks in Part 2 (for example, a speech about local facilities).
                <br />
                <br />
                Parts 3 and 4 deal with educational and training situations. In Part 3 there is a conversation between two main speakers (for example, two university
                students in discussion, perhaps guided by a tutor). In Part 4 only one person speaks on an academic subject.
                <br />
                <br />
                You will hear the recordings once only. Different accents, including British, Australian, New Zealand and North American, are used.
                <br />
                <br />
                You will need to transfer your answers to an answer sheet. You will have 10 minutes at the end of the test to do this. You should be careful when writing
                your answers on the answer sheet because you will lose marks for incorrect spelling and grammar.
              </p>
              <h2 className='mb-[32rem] text-[32rem] font-medium leading-none'>Marking</h2>
              <p className='mb-[48rem] text-[20rem] font-medium leading-tight text-d-black/80'>
                Each correct answer receives 1 mark. Your final score is given as a band score in whole or half bands, e.g. 5.5 or 7.0.
              </p>
              <Link
                href='/practice/listening/audio-check/'
                className='mx-auto flex h-[63rem] w-[280rem] items-center justify-center rounded-[40rem] bg-d-green text-[20rem] font-semibold hover:bg-d-green/40'
              >
                Continue
              </Link>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
