'use client';

import React, { useEffect, useState } from 'react';

import { GET_practice_writing_feedback_id } from '@/api/GET_practice_writing_feedback_id';
import { HeaderDuringTest } from '@/components/HeaderDuringTest';
import { useQuery } from '@tanstack/react-query';

export default function Page({ params }: { params: { id: string } }) {
  const { data: feedbackData, status: feedbackStatus } = useQuery({
    queryKey: ['practice-writing-feedback', params.id],
    queryFn: () => GET_practice_writing_feedback_id(params.id),
    retry: false,
    refetchInterval: (query) => {
      const err = query.state.error as { status?: number } | null

      // Если статус 404 — вернуть 3000 (мс), иначе — false (не рефетчить)
      return err?.status === 404 ? 10000 : false
    },
  });

  const [part, setPart] = useState<'part_1' | 'part_2' | undefined>(undefined);

  useEffect(() => {
    if (feedbackData?.part_1?.question) {
      setPart('part_1');
    } else if (feedbackData?.part_2?.question) {
      setPart('part_2');
    } else {
      setPart(undefined);
    }
  }, [feedbackData]);

  return (
    <>
      <HeaderDuringTest title='Writing section feedback' tag={'Writing'} />

      {(feedbackStatus === 'pending' || !feedbackData) && (
        <main className='flex h-[100dvh] items-center justify-center gap-x-[5rem] bg-d-blue-secondary'>
          <div className='text-[20rem] font-medium leading-tight text-d-black/80'>Evaluating your answer. It usually takes 1-2 minutes...</div>
          <svg className='size-[20rem] animate-spin text-black' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'>
            <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' stroke-width='4' />
            <path
              className='opacity-75'
              fill='currentColor'
              d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
            />
          </svg>
        </main>
      )}

      {feedbackStatus === 'success' && part !== undefined && (
        <main className='min-h-[100dvh] bg-d-blue-secondary'>
          <div className='container flex min-h-[100dvh] max-w-[1440rem] items-start justify-between p-[40rem]'>
            {/* // * Left col */}
            <div className='flex w-[1016rem] flex-col gap-y-[16rem] *:rounded-[16rem]'>
              {/* // * Question & Answer */}
              <section className='flex flex-col gap-y-[24rem] bg-white p-[40rem]'>
                {/* // * Question */}
                <div className='whitespace-pre-line text-[20rem] font-medium leading-tight text-d-black/80'>{feedbackData.task}</div>
                <div className='rounded-[12rem] bg-d-gray px-[24rem] py-[20rem] text-[20rem] font-medium leading-tight'>{feedbackData[part].question}</div>
                {feedbackData.picture && <img src={feedbackData.picture} alt='picture' className='mx-auto w-[600rem] rounded-[12rem]' />}
                <div className='text-[20rem] font-medium leading-tight text-d-black/80'>{feedbackData.text}</div>
                <hr className='my-[16rem] border-b-2 border-d-gray' />
                {/* // * Answer */}
                <div className='whitespace-pre-line text-[20rem] font-medium leading-tight'>{feedbackData.user_answer}</div>
              </section>

              <div className='flex items-start gap-x-[16rem]'>
                {/* // * Overall recommendations */}
                <section className='flex w-[500rem] shrink-0 flex-col gap-[24rem] rounded-[16rem] bg-white p-[24rem]'>
                  {/* // * Header */}
                  <header className='flex items-center justify-between'>
                    <div className='flex items-center gap-x-[12rem]'>
                      <div className='flex size-[52rem] items-center justify-center rounded-[8rem] bg-d-blue-secondary'>
                        <img src='/images/icon_writingSection.svg' alt='writing section' className='size-[24rem]' />
                      </div>
                      <div className='text-[20rem] font-medium'>Overall recommendation</div>
                    </div>
                    <button type='button' className='flex size-[40rem] items-center justify-center rounded-full border border-d-gray'>
                      <img src='/images/icon_bookmark--empty.svg' className='size-[16rem]' alt='bookmark' />
                    </button>
                  </header>
                  {/* // * Recomendation */}
                  <div className='text-[14rem] font-medium leading-tight'>
                    {feedbackData[part].ml_output['General Feedback'].feedback}
                    <br />
                    <br />
                    {feedbackData[part].ml_output['General Feedback'].recommendation}
                  </div>
                </section>
                {/* // * Recommendations by bands */}
                <section className='flex w-[500rem] shrink-0 flex-col gap-[24rem] rounded-[16rem] bg-white p-[24rem]'>
                  {/* // * Header */}
                  <header className='flex items-center justify-between'>
                    <div className='flex items-center gap-x-[12rem]'>
                      <div className='flex size-[52rem] items-center justify-center rounded-[8rem] bg-d-blue-secondary'>
                        <img src='/images/icon_writingSection.svg' alt='writing section' className='size-[24rem]' />
                      </div>
                      <div className='text-[20rem] font-medium'>Recommendations by bands</div>
                    </div>
                  </header>
                  {/* // * Coherence & cohesion */}
                  <div className='flex items-center justify-between gap-x-[24rem]'>
                    <div className='flex w-[388rem] shrink-0 flex-col gap-y-[16rem]'>
                      <div className='text-[14rem] font-semibold leading-normal'>Coherence & cohesion</div>
                      <div className='text-[14rem] font-medium leading-tight text-d-black/80'>
                        {feedbackData[part].ml_output['Coherence & Cohesion'].feedback}
                        <br />
                        <br />
                        {feedbackData[part].ml_output['Coherence & Cohesion'].recommendation}
                      </div>
                    </div>
                    <button type='button' className='flex size-[40rem] items-center justify-center rounded-full border border-d-gray'>
                      <img src='/images/icon_bookmark--empty.svg' className='size-[16rem]' alt='bookmark' />
                    </button>
                  </div>
                  {/* // * Coherence & cohesion */}
                  <div className='flex items-center justify-between gap-x-[24rem]'>
                    <div className='flex w-[388rem] shrink-0 flex-col gap-y-[16rem]'>
                      <div className='text-[14rem] font-semibold leading-normal'>Lexical resource</div>
                      <div className='text-[14rem] font-medium leading-tight text-d-black/80'>
                        {feedbackData[part].ml_output['Lexical Resource'].feedback}
                        <br />
                        <br />
                        {feedbackData[part].ml_output['Lexical Resource'].recommendation}
                      </div>
                    </div>
                    <button type='button' className='flex size-[40rem] items-center justify-center rounded-full border border-d-gray'>
                      <img src='/images/icon_bookmark--empty.svg' className='size-[16rem]' alt='bookmark' />
                    </button>
                  </div>
                  {/* // * Grammatical range & accuracy */}
                  <div className='flex items-center justify-between gap-x-[24rem]'>
                    <div className='flex w-[388rem] shrink-0 flex-col gap-y-[16rem]'>
                      <div className='text-[14rem] font-semibold leading-normal'>Grammatical range & accuracy</div>
                      <div className='text-[14rem] font-medium leading-tight text-d-black/80'>
                        {feedbackData[part].ml_output['Grammatical Range & Accuracy'].feedback}
                        <br />
                        <br />
                        {feedbackData[part].ml_output['Grammatical Range & Accuracy'].recommendation}
                      </div>
                    </div>
                    <button type='button' className='flex size-[40rem] items-center justify-center rounded-full border border-d-gray'>
                      <img src='/images/icon_bookmark--empty.svg' className='size-[16rem]' alt='bookmark' />
                    </button>
                  </div>
                  {/* // * Task achievement< */}
                  <div className='flex items-center justify-between gap-x-[24rem]'>
                    <div className='flex w-[388rem] shrink-0 flex-col gap-y-[16rem]'>
                      <div className='text-[14rem] font-semibold leading-normal'>Task achievement</div>
                      <div className='text-[14rem] font-medium leading-tight text-d-black/80'>
                        {feedbackData[part].ml_output['Task Achievement'].feedback}
                        <br />
                        <br />
                        {feedbackData[part].ml_output['Task Achievement'].recommendation}
                      </div>
                    </div>
                    <button type='button' className='flex size-[40rem] items-center justify-center rounded-full border border-d-gray'>
                      <img src='/images/icon_bookmark--empty.svg' className='size-[16rem]' alt='bookmark' />
                    </button>
                  </div>
                </section>
              </div>
            </div>
            {/* // * Right col */}
            <div className='flex w-[328rem] flex-col gap-y-[16rem] *:rounded-[16rem]'>
              {/* // * Overall score */}
              <section className='flex h-[84rem] items-center justify-start gap-x-[8rem] bg-gradient-to-br from-d-green to-d-green-secondary px-[34rem]'>
                <div className='text-[32rem] font-medium'>{feedbackData.score.toFixed(1)}</div>
                <div className='text-[20rem] font-semibold'>Overall band score</div>
              </section>
              {/* // * Grammar score */}
              {/* <section className='flex flex-col gap-[24rem] bg-white p-[24rem]'>
                <div className='flex items-center gap-x-[12rem]'>
                  <div className='flex size-[52rem] items-center justify-center rounded-[8rem] bg-d-yellow-secondary text-[20rem] font-medium'>1</div>
                  <div className='flex flex-col'>
                    <span className='text-[20rem] font-medium leading-tight'>Linking words</span>
                    <span className='text-[14rem] font-medium leading-tight text-d-black/80'>meeting the goal 7 or more</span>
                  </div>
                </div>
                <div className='flex items-center gap-x-[12rem]'>
                  <div className='flex size-[52rem] items-center justify-center rounded-[8rem] bg-d-gray text-[20rem] font-medium'>1</div>
                  <div className='flex flex-col'>
                    <span className='text-[20rem] font-medium leading-tight'>Word repetition</span>
                    <span className='text-[14rem] font-medium leading-tight text-d-black/80'>meeting the goal of 3 or few</span>
                  </div>
                </div>
                <div className='flex items-center gap-x-[12rem]'>
                  <div className='flex size-[52rem] items-center justify-center rounded-[8rem] bg-d-red-disabled text-[20rem] font-medium'>0</div>
                  <div className='flex flex-col'>
                    <span className='text-[20rem] font-medium leading-tight'>Grammar mistakes</span>
                  </div>
                </div>
                <div className='mt-[8rem] flex items-center justify-center gap-x-[64rem]'>
                  <div className='text-[14rem] font-semibold leading-tight text-d-black/80'>
                    <span className='text-d-black'>150</span> words
                  </div>
                  <div className='text-[14rem] font-semibold leading-tight text-d-black/80'>
                    <span className='text-d-black'>5</span> paragraphs
                  </div>
                </div>
              </section> */}
              {/* // * Bands score -- Coherence & cohesion */}
              <section className='flex flex-col gap-[16rem] bg-white p-[24rem]'>
                <div className='mb-[8rem] text-[20rem] font-semibold'>Coherence & cohesion: {feedbackData[part].ml_output['Coherence & Cohesion'].score.toFixed(1)}</div>
                {feedbackData[part].ml_output['Coherence & Cohesion'].breakdown.map((item: any) => (
                  <div key={`coherence-cohesion-${item.name}`} className='flex items-center gap-x-[12rem]'>
                    <div
                      className={`flex size-[34rem] items-center justify-center rounded-[4rem] text-[14rem] font-medium data-[grade=bad]:bg-d-red-disabled data-[grade=good]:bg-d-green-secondary`}
                      data-grade={+item.score >= 6 ? 'good' : 'bad'}
                    >
                      {item.score}
                    </div>
                    <div className='text-[14rem] font-medium leading-tight text-d-black/80'>{item.name}</div>
                  </div>
                ))}
              </section>
              {/* // * Bands score -- Lexical resource */}
              <section className='flex flex-col gap-[16rem] bg-white p-[24rem]'>
                <div className='mb-[8rem] text-[20rem] font-semibold'>Lexical resource: {feedbackData[part].ml_output['Lexical Resource'].score.toFixed(1)}</div>
                {feedbackData[part].ml_output['Lexical Resource'].breakdown.map((item: any) => (
                  <div key={`lexical-resource-${item.name}`} className='flex items-center gap-x-[12rem]'>
                    <div
                      className={`flex size-[34rem] items-center justify-center rounded-[4rem] text-[14rem] font-medium data-[grade=bad]:bg-d-red-disabled data-[grade=good]:bg-d-green-secondary`}
                      data-grade={+item.score >= 6 ? 'good' : 'bad'}
                    >
                      {item.score}
                    </div>
                    <div className='text-[14rem] font-medium leading-tight text-d-black/80'>{item.name}</div>
                  </div>
                ))}
              </section>
              {/* // * Bands score -- Grammatical range */}
              <section className='flex flex-col gap-[16rem] bg-white p-[24rem]'>
                <div className='mb-[8rem] text-[20rem] font-semibold'>
                  Grammatical range & accuracy: {feedbackData[part].ml_output['Grammatical Range & Accuracy'].score.toFixed(1)}
                </div>
                {feedbackData[part].ml_output['Grammatical Range & Accuracy'].breakdown.map((item: any) => (
                  <div key={`grammatical-range-${item.name}`} className='flex items-center gap-x-[12rem]'>
                    <div
                      className={`flex size-[34rem] items-center justify-center rounded-[4rem] text-[14rem] font-medium data-[grade=bad]:bg-d-red-disabled data-[grade=good]:bg-d-green-secondary`}
                      data-grade={+item.score >= 6 ? 'good' : 'bad'}
                    >
                      {item.score}
                    </div>
                    <div className='text-[14rem] font-medium leading-tight text-d-black/80'>{item.name}</div>
                  </div>
                ))}
              </section>
              {/* // * Bands score -- Task achievement */}
              <section className='flex flex-col gap-[16rem] bg-white p-[24rem]'>
                <div className='mb-[8rem] text-[20rem] font-semibold'>Task achievement: {feedbackData[part].ml_output['Task Achievement'].score.toFixed(1)}</div>
                {feedbackData[part].ml_output['Task Achievement'].breakdown.map((item: any) => (
                  <div key={`task-achievement-${item.name}`} className='flex items-center gap-x-[12rem]'>
                    <div className='flex size-[34rem] items-center justify-center rounded-[4rem] bg-d-green-secondary text-[14rem] font-medium'>{item.score}</div>
                    <div className='text-[14rem] font-medium leading-tight text-d-black/80'>{item.name}</div>
                  </div>
                ))}
              </section>
            </div>
          </div>
        </main>
      )}

      <footer className='bg-d-blue-secondary pb-[24rem] text-center text-[12rem]'>© All rights reserved</footer>
    </>
  );
}
