import Link from 'next/link';
import React from 'react';

export default function Page() {
  return (
    <main className='realtive min-h-screen bg-d-blue-secondary'>
      <img src='/images/illustration_torusArray--02.png' className='absolute bottom-0 left-0 h-auto w-[320rem] opacity-80' alt='illustration_torusArray' />
      <img src='/images/illustration_molecule.png' className='absolute right-0 top-0 h-auto w-[250rem] opacity-50' alt='illustration_molecule' />
      <div className='d container max-w-[1440rem] px-[270rem] pb-[150rem] pt-[80rem]'>
        <div className='shadow-car flex flex-col gap-[48rem] rounded-[16rem] bg-white p-[64rem]'>
          {/* // * Header */}
          <div className='flex items-center gap-x-[12rem]'>
            <div className='flex size-[52rem] items-center justify-center bg-d-blue-secondary'>
              <img src='/images/icon_writingSection.svg' className='size-[24rem]' alt='writing' />
            </div>
            <div className='flex flex-col gap-y-[6rem]'>
              <div className='text-[16rem] font-medium leading-none text-d-black/80'>Writing</div>
              <div className='text-[20rem] font-medium leading-none'>60 min</div>
            </div>
            <div className='ml-[12rem] flex flex-col gap-y-[6rem]'>
              <div className='text-[16rem] font-medium leading-none text-d-black/80'>Parts</div>
              <div className='text-[20rem] font-medium leading-none'>2</div>
            </div>
          </div>
          {/* // * Seclection */}
          <div>
            <h1 className='mb-[32rem] text-[32rem] font-medium leading-none'>What’s in the IELTS Academic Writing paper?</h1>
            <p className='mb-[48rem] text-[20rem] font-medium leading-tight text-d-black/80'>
              There are two Writing tasks. In Task 1, you have to describe some visual information in your own words (a graph, table, chart or diagram). You need to write
              at least 150 words in about 20 minutes. In Task 2, you are given a point of view, argument or problem which you need to discuss. You need to write at least
              250 words in about 40 minutes. You must write your answers using full sentences. You must not write your answers as notes or bullet points. You must write
              your answers on the answer sheet. You are allowed to write notes on the question paper, but these will not be seen by the examiner.
            </p>
            <h1 className='mb-[32rem] text-[32rem] font-medium leading-none'>Marking</h1>
            <p className='mb-[48rem] text-[20rem] font-medium leading-tight text-d-black/80'>
              Certificated IELTS examiners assess your performance on each Writing task. There are four assessment criteria (things which the examiner thinks about when
              deciding what score to give you):
            </p>
            <Link
              href='/[locale]/practice/writing/test'
              className='mx-auto flex h-[63rem] w-[280rem] items-center justify-center rounded-[40rem] bg-d-green text-[20rem] font-semibold hover:bg-d-green/40'
            >
              Continue
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
