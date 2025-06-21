import Link from 'next/link';
import React from 'react';

export default function Page() {
  return (
    <main className='min-h-screen overflow-hidden bg-d-yellow-secondary'>
      <div className='container relative max-w-[1440rem] px-[270rem] pb-[150rem] pt-[80rem]'>
        <img
          src='/images/illustration_pyramide.png'
          alt='illustration'
          className='pointer-events-none absolute left-[40rem] top-[760rem] h-auto w-[320rem] rotate-[-42deg] opacity-30 mix-blend-multiply'
        />
        <img
          src='/images/illustration_softball.png'
          alt='illustration'
          className='pointer-events-none absolute right-[54rem] top-[20rem] h-auto w-[318rem] opacity-30 mix-blend-multiply'
        />

        <div className='relative z-10 flex flex-col gap-[48rem] rounded-[16rem] bg-white p-[64rem] shadow-card'>
          {/* // * Cancel mock exam  */}
          <Link href='/mock' className='absolute right-[30rem] top-[30rem] flex size-[40rem] items-center justify-center'>
            <img src='/images/icon_cross.svg' alt='close' className='size-[20rem]' />
          </Link>

          {/* // * Header */}
          <header className='flex items-center gap-x-[12rem]'>
            <div className='flex size-[52rem] items-center justify-center bg-d-yellow-secondary'>
              <img src='/images/icon_readingSection.svg' className='size-[24rem]' alt='writing' />
            </div>
            <div className='flex flex-col gap-y-[6rem]'>
              <div className='text-[16rem] font-medium leading-none text-d-black/80'>Reading</div>
              <div className='text-[20rem] font-medium leading-none'>60 min</div>
            </div>
            <div className='ml-[12rem] flex flex-col gap-y-[6rem]'>
              <div className='text-[16rem] font-medium leading-none text-d-black/80'>Parts</div>
              <div className='text-[20rem] font-medium leading-none'>3</div>
            </div>
            <div className='ml-[12rem] flex flex-col gap-y-[6rem]'>
              <div className='text-[16rem] font-medium leading-none text-d-black/80'>Questions</div>
              <div className='text-[20rem] font-medium leading-none'>40</div>
            </div>
          </header>

          {/* // * Rules */}
          <section>
            <h1 className='mb-[32rem] text-[32rem] font-medium leading-none'>What’s in the IELTS Academic Reading paper?</h1>
            <p className='mb-[48rem] text-[20rem] font-medium leading-tight text-d-black/80'>
              What’s in the IELTS Academic Reading paper? Texts come from books, journals, magazines, newspapers and online resources, written for a non-specialist
              audience. All the topics are of general interest to students at undergraduate or postgraduate level. The texts may be written in different styles, for
              example, narrative, descriptive or discursive/argumentative. At least one text contains detailed logical argument. Texts may also contain diagrams, graphs
              or illustrations. If texts use technical vocabulary, then a simple dictionary definition is provided. You will need to transfer your answers to an answer
              sheet. You must transfer your answers during the hour you are given for the Reading test. Unlike the Listening test, no extra transfer time is given. You
              should be careful when writing your answers on the answer sheet because you will lose marks for incorrect spelling and grammar.
            </p>
            <h1 className='mb-[32rem] text-[32rem] font-medium leading-none'>Marking</h1>
            <p className='mb-[48rem] text-[20rem] font-medium leading-tight text-d-black/80'>
              Each correct answer receives 1 mark. Your final score is given as a band score from 1–9 in whole or half bands, e.g. 4 or 6.5
            </p>
            <Link
              href='/[locale]/mock/exam/reading/test'
              className='mx-auto flex h-[63rem] w-[280rem] items-center justify-center rounded-[40rem] bg-d-green text-[20rem] font-semibold hover:bg-d-green/40'
            >
              Continue
            </Link>
          </section>
        </div>
      </div>
    </main>
  );
}
