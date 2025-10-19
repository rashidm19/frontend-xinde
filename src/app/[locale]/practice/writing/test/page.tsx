'use client';

import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';

import { AutosizeTextarea } from '@/components/ui/autosize-textarea';
import { GET_practice_writing_id } from '@/api/GET_practice_writing_id';
import { POST_practice_writing_id } from '@/api/POST_practice_writing_id';
import React from 'react';
import { useForm } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCustomTranslations } from '@/hooks/useCustomTranslations';
import { WritingFeedbackHeader } from '@/components/practice/WritingFeedbackHeader';
import { PracticeLeaveGuard } from '@/components/PracticeLeaveGuard';
import { cn } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default function Page() {
  const router = useRouter();
  const { t, tCommon, tActions, tForm } = useCustomTranslations('practice.writing.test');
  const [isPictureExpanded, setIsPictureExpanded] = React.useState(false);

  const { data, status } = useQuery({
    queryKey: ['practice-writing'],
    queryFn: () => GET_practice_writing_id(localStorage.getItem('practiceWritingId') as string),
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const data = await POST_practice_writing_id(localStorage.getItem('practiceWritingId') as string, values.answer);
    if (data?.id) {
      router.push(`/practice/writing/feedback/${data.id}`);
    } else {
      router.push('/error500');
    }
  }

  const formSchema = z.object({
    answer: z.string(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      answer: '',
    },
  });

  const formValues = form.watch();

  React.useEffect(() => {
    setIsPictureExpanded(false);
  }, [data?.picture]);

  if (status === 'pending') {
    return <></>;
  }
  if (status === 'error') {
    return <></>;
  }

  return (
    <PracticeLeaveGuard>
      <WritingFeedbackHeader
        topBarElevated
        title={tCommon('practicePartNumber', { number: data?.picture ? 1 : 2 })}
        exitLabel={tActions('exit')}
        onExit={() => router.push('/profile')}
      />

      <main className='bg-d-blue-secondary'>
        <div className='container flex min-h-[calc(100dvh-64rem)] max-w-[1600rem] items-start justify-center gap-[24rem] px-[24rem] pb-[16rem] pt-[24rem]'>
          {/* // * Вопрос */}
          {data.picture ? (
            <div
              className={cn(
                'flex h-[calc(100dvh-96rem)] w-[720rem] flex-col overflow-hidden rounded-[16rem] border border-black bg-white shadow-lg transition-all duration-300 ease-out',
                isPictureExpanded ? 'p-0' : 'p-[24rem]'
              )}
            >
              {!isPictureExpanded && (
                <div className='whitespace-pre-line rounded-[16rem] border border-[#c2c2c2] p-[16rem] text-[18rem] font-medium leading-[24rem] text-d-black/90'>
                  {data.question}
                </div>
              )}
              <button
                type='button'
                onClick={() => setIsPictureExpanded(prev => !prev)}
                className={cn(
                  'relative flex w-full flex-1 items-center justify-center overflow-hidden rounded-[12rem] border border-d-light-gray bg-d-light-gray transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-d-green/40',
                  isPictureExpanded ? 'mt-0 h-full rounded-none border-0 bg-[#c2c2c2]' : 'mt-[16rem] min-h-[200rem]'
                )}
                aria-pressed={isPictureExpanded}
              >
                <img
                  src={data.picture}
                  alt='illustration'
                  className={cn('h-full w-full object-contain transition-all duration-300 ease-out', isPictureExpanded ? 'object-cover' : 'max-h-[280rem]')}
                />
              </button>
            </div>
          ) : (
            <div className='flex h-[calc(100dvh-96rem)] w-[720rem] flex-col overflow-hidden rounded-[16rem] border border-black bg-white p-[24rem] shadow-lg'>
              <div className='text-[18rem] font-semibold leading-tight text-d-black/90'>{t('writeAboutTopic')}</div>
              <div className='my-[12rem] max-h-[200rem] overflow-auto whitespace-pre-line rounded-[12rem] bg-d-light-gray px-[18rem] py-[14rem] text-[18rem] font-medium leading-[22rem] text-d-black/80'>
                {data?.question}
              </div>
              <div className='flex-1 overflow-auto whitespace-pre-line rounded-[12rem] border border-d-light-gray px-[18rem] py-[14rem] text-[16rem] leading-[22rem] text-d-black/80'>
                {data.text}
              </div>
            </div>
          )}

          <div className='flex h-[calc(100dvh-96rem)] w-[720rem] flex-col overflow-hidden rounded-[16rem] border border-black bg-white p-[24rem] shadow-lg'>
            <div className='flex items-start justify-between gap-[12rem] rounded-[12rem] border border-[#c2c2c2] bg-d-light-gray px-[18rem] py-[14rem] text-[14rem] leading-[20rem] text-d-black/80'>
              <div className='whitespace-pre-line'>{data.task}</div>
              <div>
                {tCommon('wordsCount', {
                  count: formValues.answer
                    .trim()
                    .split(/\s+/)
                    .filter((word: string) => word.length > 1).length,
                })}
              </div>
            </div>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className='flex h-full flex-col'>
                <FormField
                  name='answer'
                  control={form.control}
                  render={({ field }) => (
                    <FormItem className='mt-[16rem] flex h-full flex-col'>
                      <FormControl>
                        <AutosizeTextarea
                          {...field}
                          minHeight={220}
                          placeholder={tForm('placeholders.startTypingHere')}
                          className='flex-1 resize-none rounded-[12rem] border border-d-light-gray bg-d-light-gray px-[20rem] py-[16rem] text-[16rem] font-medium leading-[22rem] text-d-black/80 outline-none placeholder:text-d-black/40 focus:border-d-green'
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <button
                  type='submit'
                  className='mt-[16rem] flex h-[54rem] w-full shrink-0 items-center justify-center rounded-[28rem] bg-d-green text-[18rem] font-semibold transition hover:bg-d-green/80'
                >
                  {tActions('submit')}
                </button>
              </form>
            </Form>
          </div>
        </div>
      </main>
    </PracticeLeaveGuard>
  );
}
