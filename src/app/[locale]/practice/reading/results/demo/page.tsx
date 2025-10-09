'use client';

import {
  ReadingAnswerSheetDemo,
  ReadingAnswerSheetError,
  ReadingAnswerSheetSkeleton,
} from '../[id]/_components/reading-answer-sheet';

export default function ReadingResultsDemoPage({ params }: { params: { locale: string } }) {
  return (
    <main className='min-h-screen bg-[#EEF3FF] px-[24rem] py-[40rem] tablet:px-[40rem] desktop:px-[64rem]'>
      <div className='mx-auto flex w-full max-w-[1280rem] flex-col gap-[32rem]'>
        <header className='space-y-[12rem]'>
          <span className='text-[13rem] font-semibold uppercase tracking-[0.2em] text-slate-500'>Reading answer sheet</span>
          <h1 className='text-[24rem] font-semibold text-slate-900'>Demo states</h1>
          <p className='max-w-[560rem] text-[14rem] text-slate-600'>Use this playground to verify loading, error, and ready states of the redesigned reading answer sheet UI.</p>
        </header>

        <section className='grid gap-[24rem] tablet:grid-cols-2'>
          <div className='rounded-[28rem] border border-slate-200 bg-white px-[24rem] py-[20rem] shadow-[0_24rem_64rem_-48rem_rgba(46,67,139,0.25)]'>
            <h2 className='text-[16rem] font-semibold text-slate-900'>Loading</h2>
            <div className='mt-[16rem]'>
              <ReadingAnswerSheetSkeleton />
            </div>
          </div>

          <div className='rounded-[28rem] border border-slate-200 bg-white px-[24rem] py-[20rem] shadow-[0_24rem_64rem_-48rem_rgba(46,67,139,0.25)]'>
            <h2 className='text-[16rem] font-semibold text-slate-900'>Error</h2>
            <div className='mt-[16rem]'>
              <ReadingAnswerSheetError />
            </div>
          </div>
        </section>

        <section className='rounded-[28rem] border border-slate-200 bg-white px-[24rem] py-[20rem] shadow-[0_24rem_64rem_-48rem_rgba(46,67,139,0.25)]'>
          <h2 className='text-[16rem] font-semibold text-slate-900'>Interactive demo</h2>
          <div className='mt-[16rem]'>
            <ReadingAnswerSheetDemo locale={params.locale} />
          </div>
        </section>
      </div>
    </main>
  );
}
