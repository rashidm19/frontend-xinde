'use client';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

import { Footer } from '@/components/Footer';
import { GET_practice_reading_results_id } from '@/api/GET_practice_reading_results_id';
import { HeaderDuringTest } from '@/components/HeaderDuringTest';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useCustomTranslations } from '@/hooks/useCustomTranslations';

export default function Page({ params }: { params: { id: string } }) {
  const { t, tImgAlts, tCommon } = useCustomTranslations('practice.reading.results');

  const { data, status } = useQuery({
    queryKey: ['practice-reading-results', params.id],
    queryFn: () => GET_practice_reading_results_id(params.id),
  });

  if (status === 'pending') {
    return <div>Loading...</div>;
  }

  if (status === 'error') {
    return <div>Error</div>;
  }

  return (
    <>
      <HeaderDuringTest title={t('title')} tag={tCommon('reading')} />
      <main className='min-h-screen overflow-hidden bg-d-yellow-secondary py-[80rem]'>
        <section className='mx-auto mb-[24rem] flex w-[902rem] flex-col items-start gap-y-[24rem] rounded-[16rem] bg-white p-[24rem] shadow-primary'>
          <header className='flex items-center justify-center gap-x-[12rem]'>
            <div className='flex size-[52rem] items-center justify-center rounded-[8rem] bg-d-gray'>
              <img src='/images/icon_layers.svg' alt={tImgAlts('layers')} className='size-[24rem]' />
            </div>
            <div className='flex flex-col gap-y-[8rem]'>
              <h1 className='text-[20rem] font-medium leading-none'>{tCommon('answersSheet')}</h1>
              <div className='text-[14rem] font-medium leading-none'>{tCommon('viewYourResults')}</div>
            </div>
          </header>

          <Accordion type='multiple' className='flex w-full flex-col gap-y-[8rem]'>
            {data.questions.map((q: any, index: number) => (
              <AccordionItem value={(index + 1).toString()} className='group relative rounded-[16rem] bg-d-light-gray py-[28rem] pl-[40rem] pr-[96rem]'>
                <AccordionTrigger className='flex items-center justify-between'>
                  <h2 className='text-[20rem] font-medium leading-none'>
                    {index + 1}.{'  '}
                    {q.answer ? q.answer : tCommon('noAnswer')}
                  </h2>
                  {q.correct ? (
                    <div className='flex size-[32rem] items-center justify-center rounded-full bg-d-green'>
                      <img src='/images/icon_check.svg' alt={tImgAlts('check')} className='size-[16rem]' />
                    </div>
                  ) : (
                    <div className='flex size-[32rem] items-center justify-center rounded-full bg-d-red-disabled'>
                      <img src='/images/icon_cross.svg' alt={tImgAlts('cross')} className='size-[16rem]' />
                    </div>
                  )}
                  {!q.correct && (
                    <img
                      alt={tImgAlts('chevronDown')}
                      src='/images/icon_chevron--down.svg'
                      className='absolute right-[40rem] top-[32rem] size-[24rem] rotate-[270deg] group-data-[state=open]:rotate-90'
                    />
                  )}
                </AccordionTrigger>
                {!q.correct && (
                  <AccordionContent className='flex flex-col gap-y-[24rem] pt-[40rem]'>
                    {q.answer && (
                      <div className='text-[20rem] font-medium leading-none text-d-black'>
                        {tCommon('yourAnswer')}: {q.answer}
                      </div>
                    )}
                    <div className='text-[20rem] font-medium leading-none text-black'>
                      {tCommon('correctAnswer')}: {q.correct_answer}
                    </div>
                  </AccordionContent>
                )}
              </AccordionItem>
            ))}
          </Accordion>
        </section>
        <section className='mx-auto flex w-[902rem] items-center justify-between rounded-[16rem] bg-white p-[28rem] shadow-primary'>
          <div className='flex items-center gap-x-[8rem]'>
            <div className='flex size-[52rem] items-center justify-center rounded-[8rem] bg-d-light-gray'>
              <img src='/images/icon_star.svg' alt={tImgAlts('start')} className='size-[24rem]' />
            </div>
            <h2 className='text-[20rem] font-medium'>{tCommon('overallScore')}</h2>
          </div>
          <div className='text-[20rem] font-medium'>
            {tCommon('reading')}: {data.correct_answers_count} / {data.questions.length}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
