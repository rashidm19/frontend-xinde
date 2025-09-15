'use client';

import React from 'react';

import { GET_practice_speaking_feedback_id } from '@/api/GET_practice_speaking_feedback_id';
import { HeaderDuringTest } from '@/components/HeaderDuringTest';
import { useQuery } from '@tanstack/react-query';
import { API_URL } from '@/lib/config';
import { ISpeakingPracticeFeedback } from '@/types/SpeakingFeedback';

export default function Page({ params }: { params: { id: string } }) {
  const { status } = useQuery({
    queryKey: ['practice-speaking-feedbacks'],
    queryFn: () =>
      fetch(`${API_URL}/practice/speaking/passed`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      }).then(res => res.json()),
    refetchInterval: 3000,
  });

  const { data: feedbackData, status: feedbackStatus } = useQuery({
    queryKey: ['practice-speaking-feedback', params.id],
    queryFn: async () => {
      const response = await GET_practice_speaking_feedback_id(params.id);
      return response as ISpeakingPracticeFeedback;
    },
  });

  return (
    <>
      <HeaderDuringTest title='Speaking section feedback' tag={'Speaking'} />

      {(status === 'pending' || !feedbackData) && (
        <main className='flex h-[100dvh] items-center justify-center gap-x-[5rem] bg-d-red-secondary'>
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

      {feedbackStatus === 'success' &&
        feedbackData &&
        feedbackData.parts.length > 0 &&
        feedbackData?.parts.map((part, idx: number) => (
          <main key={idx} className='min-h-[100dvh] bg-d-red-secondary'>
            <div className='container flex min-h-[100dvh] max-w-[1440rem] items-start justify-between p-[40rem]'>
              {/* // * Left col */}
              <div className='flex w-[1016rem] flex-col gap-y-[16rem] *:rounded-[16rem]'>
                {/* // * Questions & Answers */}
                <section className='flex flex-col gap-y-[24rem] bg-white p-[40rem]'>
                  {/* // * Questions and Audio Answers */}
                  {part.questions.map((q, qIdx) => (
                    <div key={qIdx} className='flex flex-col gap-y-[16rem]'>
                      <div className='rounded-[12rem] bg-d-gray px-[24rem] py-[20rem] text-[20rem] font-medium leading-tight'>{q.question}</div>
                      <audio controls className='w-full'>
                        <source src={q.answer_audio} type='audio/webm' />
                      </audio>
                    </div>
                  ))}
                  {part.ml_output['General Feedback'].transcription && (
                    <>
                      <hr className='my-[16rem] border-b-2 border-d-gray' />
                      <div className='flex flex-col gap-y-[8rem]'>
                        <div className='text-[16rem] font-semibold'>Transcription:</div>
                        <div className='whitespace-pre-line text-[16rem] leading-tight'>{part.ml_output['General Feedback'].transcription.join('\n')}</div>
                      </div>
                    </>
                  )}
                </section>

                <div className='flex items-start gap-x-[16rem]'>
                  {/* // * Overall recommendations */}
                  <section className='flex w-[500rem] shrink-0 flex-col gap-[24rem] rounded-[16rem] bg-white p-[24rem]'>
                    {/* // * Header */}
                    <header className='flex items-center justify-between'>
                      <div className='flex items-center gap-x-[12rem]'>
                        <div className='flex size-[52rem] items-center justify-center rounded-[8rem] bg-d-red-secondary'>
                          <img src='/images/icon_speakingSection.svg' alt='speaking section' className='size-[24rem]' />
                        </div>
                        <div className='text-[20rem] font-medium'>Overall recommendation</div>
                      </div>
                      <button type='button' className='flex size-[40rem] items-center justify-center rounded-full border border-d-gray'>
                        <img src='/images/icon_bookmark--empty.svg' className='size-[16rem]' alt='bookmark' />
                      </button>
                    </header>
                    {/* // * Recommendation */}
                    <div className='text-[14rem] font-medium leading-tight'>
                      {part.ml_output['General Feedback'].feedback}
                      <br />
                      <br />
                      {part.ml_output['General Feedback'].recommendation}
                    </div>
                  </section>
                  {/* // * Recommendations by bands */}
                  <section className='flex w-[500rem] shrink-0 flex-col gap-[24rem] rounded-[16rem] bg-white p-[24rem]'>
                    {/* // * Header */}
                    <header className='flex items-center justify-between'>
                      <div className='flex items-center gap-x-[12rem]'>
                        <div className='flex size-[52rem] items-center justify-center rounded-[8rem] bg-d-red-secondary'>
                          <img src='/images/icon_speakingSection.svg' alt='speaking section' className='size-[24rem]' />
                        </div>
                        <div className='text-[20rem] font-medium'>Recommendations by bands</div>
                      </div>
                    </header>
                    {/* // * Fluency & Coherence */}
                    <div className='flex items-center justify-between gap-x-[24rem]'>
                      <div className='flex w-[388rem] shrink-0 flex-col gap-y-[16rem]'>
                        <div className='text-[14rem] font-semibold leading-normal'>Fluency & Coherence</div>
                        <div className='text-[14rem] font-medium leading-tight text-d-black/80'>
                          {part.ml_output['Fluency & Coherence'].feedback}
                          <br />
                          <br />
                          {part.ml_output['Fluency & Coherence'].recommendation}
                        </div>
                      </div>
                      <button type='button' className='flex size-[40rem] items-center justify-center rounded-full border border-d-gray'>
                        <img src='/images/icon_bookmark--empty.svg' className='size-[16rem]' alt='bookmark' />
                      </button>
                    </div>
                    {/* // * Lexical Resource */}
                    <div className='flex items-center justify-between gap-x-[24rem]'>
                      <div className='flex w-[388rem] shrink-0 flex-col gap-y-[16rem]'>
                        <div className='text-[14rem] font-semibold leading-normal'>Lexical resource</div>
                        <div className='text-[14rem] font-medium leading-tight text-d-black/80'>
                          {part.ml_output['Lexical Resource'].feedback}
                          <br />
                          <br />
                          {part.ml_output['Lexical Resource'].recommendation}
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
                          {part.ml_output['Grammatical Range & Accuracy'].feedback}
                          <br />
                          <br />
                          {part.ml_output['Grammatical Range & Accuracy'].recommendation}
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
                {/* // * Bands score -- Fluency & Coherence */}
                <section className='flex flex-col gap-[16rem] bg-white p-[24rem]'>
                  <div className='mb-[8rem] text-[20rem] font-semibold'>Fluency & Coherence: {part.ml_output['Fluency & Coherence'].score.toFixed(1)}</div>
                  {part.ml_output['Fluency & Coherence'].breakdown.map((item: any) => (
                    <div key={`fluency-coherence-${item.name}`} className='flex items-center gap-x-[12rem]'>
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
                  <div className='mb-[8rem] text-[20rem] font-semibold'>Lexical resource: {part.ml_output['Lexical Resource'].score.toFixed(1)}</div>
                  {part.ml_output['Lexical Resource'].breakdown.map((item: any) => (
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
                    Grammatical range & accuracy: {part.ml_output['Grammatical Range & Accuracy'].score.toFixed(1)}
                  </div>
                  {part.ml_output['Grammatical Range & Accuracy'].breakdown.map((item: any) => (
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
              </div>
            </div>
          </main>
        ))}

      <footer className='bg-d-blue-secondary pb-[24rem] text-center text-[12rem]'>© All rights reserved</footer>
    </>
  );
}
