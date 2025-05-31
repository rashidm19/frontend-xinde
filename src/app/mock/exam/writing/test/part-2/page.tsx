'use client';

import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import React, { useEffect } from 'react';

import { AutosizeTextarea } from '@/components/ui/autosize-textarea';
import { GET_practice_writing_id } from '@/api/GET_practice_writing_id';
import { HeaderDuringTest } from '@/components/HeaderDuringTest';
import { POST_practice_writing_id } from '@/api/POST_practice_writing_id';
import { mockStore } from '@/stores/mock';
import nProgress from 'nprogress';
import { useForm } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

export const dynamic = 'force-dynamic';

export default function Page() {
  const router = useRouter();
  const { mockData, setTimer } = mockStore();
  const data = mockData?.writing?.part_2;

  if (!data) {
    return router.push('/mock');
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    nProgress.start();
    router.push('/mock/exam/speaking/rules');
  }

  const formSchema = z.object({
    answer: z.string().min(500, 'Answer must be at least 500 characters long'),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      answer: '',
    },
  });

  const formValues = form.watch();

  useEffect(() => {
    setTimer(1800000);
  }, []);

  return (
    <>
      <HeaderDuringTest title={`Mock exam writing - part ${data?.picture ? '1' : '2'}`} tag='Writing' />

      <main className='min-h-[100dvh] bg-d-blue-secondary'>
        <div className='container flex min-h-[100dvh] max-w-[1440rem] items-start justify-between px-[40rem] pb-[24rem] pt-[40rem]'>
          {/* // * Вопрос */}
          {data.picture ? (
            <div className='w-[672rem] rounded-[16rem] bg-white p-[40rem] pb-[60rem]'>
              {/* // * Текст вопроса */}
              <div className='whitespace-pre-line text-[20rem] font-medium'>{data.question}</div>
              {/* // * Разделитель */}
              <hr className='mb-[56rem] mt-[16rem] border-b border-d-light-gray' />
              {/* // * Иллюстрация к вопросу */}
              <img src={data.picture} alt='illustration' className='h-auto w-full' />
            </div>
          ) : (
            <div className='flex w-[672rem] flex-col gap-y-[24rem] rounded-[16rem] bg-white p-[40rem] pb-[60rem]'>
              <div className='text-[20rem] font-medium leading-tight text-d-black/80'>Write about the following topic:</div>
              {/* // * Текс вопроса */}
              <div className='whitespace-pre-line rounded-[12rem] bg-d-light-gray px-[24rem] py-[20rem] text-[20rem] font-medium leading-[24rem]'>{data?.question}</div>
              <div className='text-[20rem] font-medium leading-tight text-d-black/80'>{data.text}</div>
            </div>
          )}

          {/* // * Форма для ответа */}
          <div className='w-[672rem] rounded-[16rem] bg-white p-[40rem]'>
            {/* // * Рекомендации */}
            <div className='flex justify-between'>
              <div className='whitespace-pre-line text-[14rem] leading-normal text-d-black/80'>{data.task}</div>
              <div className='text-[14rem] leading-normal text-d-black/80'>
                Words:{' '}
                {
                  formValues.answer
                    .trim()
                    .split(/\s+/)
                    .filter((word: string) => word.length > 1).length
                }
              </div>
            </div>
            {/* // * Разделитель */}
            <hr className='my-[40rem] border-b border-d-light-gray' />
            {/* // * Форма ответа */}
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <FormField
                  control={form.control}
                  name='answer'
                  render={({ field }) => (
                    <FormItem className=''>
                      <FormMessage className='mb-[12rem] font-poppins text-[14rem] font-medium leading-none text-d-red' />
                      <FormControl>
                        <AutosizeTextarea
                          {...field}
                          minHeight={350}
                          className='mb-[54rem] w-full text-[20rem] font-medium leading-[24rem] outline-none placeholder:text-d-black/40'
                          placeholder='Start typing here...'
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <button
                  type='submit'
                  className='flex h-[71rem] w-full items-center justify-center rounded-[40rem] bg-d-green text-[20rem] font-normal hover:bg-d-green/40'
                >
                  Submit part 2 ( you can't go back )
                </button>
              </form>
            </Form>
          </div>
        </div>
      </main>
    </>
  );
}
