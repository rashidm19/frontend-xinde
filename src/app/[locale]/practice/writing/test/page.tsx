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
import { X } from 'lucide-react';
import { MobileHeader } from '@/components/practice/reading/mobile/MobileHeader';
import { useMediaQuery } from 'usehooks-ts';

export const dynamic = 'force-dynamic';

export default function Page() {
  const router = useRouter();
  const isMobile = useMediaQuery('(max-width: 767px)');
  const { t, tCommon, tActions, tForm, tMessages } = useCustomTranslations('practice.writing.test');
  const [isPictureExpanded, setIsPictureExpanded] = React.useState(false);
  const [isWritingFocused, setIsWritingFocused] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const writingCardRef = React.useRef<HTMLDivElement | null>(null);
  const [isMobileImagePreviewOpen, setIsMobileImagePreviewOpen] = React.useState(false);

  const { data, status } = useQuery({
    queryKey: ['practice-writing'],
    queryFn: () => GET_practice_writing_id(localStorage.getItem('practiceWritingId') as string),
  });

  const handleExit = React.useCallback(() => {
    router.push('/profile');
  }, [router]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setSubmitError(null);
    try {
      const response = await POST_practice_writing_id(localStorage.getItem('practiceWritingId') as string, values.answer);
      if (response?.id) {
        router.push(`/practice/writing/feedback/${response.id}`);
        return;
      }
      setSubmitError(tMessages('unexpectedError'));
    } catch (error) {
      setSubmitError(tMessages('unexpectedError'));
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
  const trimmedAnswer = formValues.answer?.trim() ?? '';
  const wordCount = React.useMemo(() => {
    if (!trimmedAnswer) {
      return 0;
    }

    return trimmedAnswer.split(/\s+/).filter((word: string) => word.trim().length > 1).length;
  }, [trimmedAnswer]);
  const isSubmitting = form.formState.isSubmitting;
  const isSubmitDisabled = trimmedAnswer.length === 0 || isSubmitting;

  React.useEffect(() => {
    if (!submitError) {
      return;
    }

    if (trimmedAnswer.length > 0) {
      setSubmitError(null);
    }
  }, [submitError, trimmedAnswer]);

  React.useEffect(() => {
    setIsPictureExpanded(false);
    setIsMobileImagePreviewOpen(false);
  }, [data?.picture]);

  React.useEffect(() => {
    if (!isMobileImagePreviewOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMobileImagePreviewOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMobileImagePreviewOpen]);

  if (status === 'pending') {
    return <></>;
  }
  if (status === 'error') {
    return <></>;
  }

  return (
    <PracticeLeaveGuard>
      <div className='hidden tablet:block'>
        <WritingFeedbackHeader
          topBarElevated
          title={tCommon('practicePartNumber', { number: data?.picture ? 1 : 2 })}
          exitLabel={tActions('exit')}
          onExit={handleExit}
        />
      </div>

      <MobileHeader
        title={tCommon('practicePartNumber', { number: data?.picture ? 1 : 2 })}
        tag={tCommon('writing')}
        exitLabel={tActions('exit')}
        closeAs={'link'}
        closeHref='/m/practice'
        variant='writing'
      />

      <main className={cn(isMobile ? 'bg-[#F5FCFE]' : 'bg-d-blue-secondary')}>
        <div
          className='container w-full px-[18rem] pb-[36rem] pt-[28rem] tablet:min-h-[calc(100dvh-64rem)] tablet:max-w-[1600rem] tablet:px-[24rem] tablet:pb-[16rem] tablet:pt-[24rem]'>
          <div className='flex w-full flex-col gap-[16rem] tablet:gap-[20rem]'>
            <div
              className='flex w-full flex-col gap-[20rem] tablet:flex-row tablet:items-start tablet:justify-center tablet:gap-[24rem]'>
              <h2
                className='mt-[-12rem] text-[13rem] font-medium uppercase tracking-[0.08em] text-d-black/45 tablet:hidden'>
                {tCommon('practicePartNumber', { number: data?.picture ? 1 : 2 })}
              </h2>

              <section
                className={cn(
                  'relative flex w-full flex-col rounded-[20rem] border border-[#b9deef]/80 bg-white p-[22rem] shadow-[0_20rem_60rem_rgba(8,56,80,0.12)] transition-all duration-300 ease-out',
                  'tablet:h-[calc(100dvh-96rem)] tablet:w-[720rem] tablet:overflow-hidden tablet:rounded-[16rem] tablet:border-black tablet:p-[24rem] tablet:shadow-lg',
                  {
                    'tablet:p-0': isPictureExpanded,
                  }
                )}
              >
                {data.picture ? (
                  <>
                    <div
                      className={cn(
                        'whitespace-pre-line text-[18rem] font-medium leading-[26rem] text-d-black/90',
                        'tablet:rounded-[16rem] tablet:border tablet:border-[#c2c2c2] tablet:p-[16rem] tablet:text-[18rem] tablet:leading-[24rem]',
                        isPictureExpanded && 'tablet:hidden'
                      )}
                    >
                      {data.question}
                    </div>
                    <div className='mt-[24rem] flex flex-col gap-[18rem] tablet:mt-[16rem] tablet:flex-1'>
                      <button
                        type='button'
                        onClick={() => setIsMobileImagePreviewOpen(true)}
                        className='flex max-h-[340rem] min-h-[220rem] items-center justify-center overflow-hidden rounded-[18rem] border border-[#cfe7f3] bg-gradient-to-b from-white via-white to-[#e9f6fc] transition hover:border-[#bed8ea] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6cc3e5] tablet:hidden'
                        aria-label={t('imagePreview.open')}
                      >
                        <img src={data.picture} alt='illustration' className='h-full w-full object-contain' />
                      </button>
                      <button
                        type='button'
                        onClick={() => setIsPictureExpanded(prev => !prev)}
                        className={cn(
                          'relative hidden w-full flex-1 items-center justify-center overflow-hidden rounded-[16rem] border border-d-light-gray bg-d-light-gray transition-all duration-300 ease-out focus:outline-none focus-visible:ring-4 focus-visible:ring-d-green/40 tablet:flex',
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
                  </>
                ) : (
                  <div className='flex flex-col gap-[22rem]'>
                    <div
                      className='text-[18rem] font-semibold leading-[26rem] text-d-black/90 tablet:text-[18rem] tablet:leading-tight'>{t('writeAboutTopic')}</div>
                    <div
                      className='rounded-[18rem] bg-[#f2f6f9] px-[18rem] py-[18rem] text-[16rem] leading-[24rem] text-d-black/80 tablet:my-[12rem] tablet:max-h-[200rem] tablet:overflow-auto tablet:rounded-[12rem] tablet:bg-d-light-gray tablet:px-[18rem] tablet:py-[14rem] tablet:text-[18rem] tablet:leading-[22rem]'>
                      <div className='whitespace-pre-line'>{data?.question}</div>
                    </div>
                    <div
                      className='whitespace-pre-line rounded-[18rem] border border-[#d6eaf5] bg-white px-[18rem] py-[18rem] text-[15rem] leading-[24rem] text-d-black/70 tablet:flex-1 tablet:overflow-auto tablet:rounded-[12rem] tablet:border tablet:border-d-light-gray tablet:px-[18rem] tablet:py-[14rem] tablet:text-[16rem] tablet:leading-[22rem]'>
                      {data.text}
                    </div>
                  </div>
                )}

                <div
                  className='mt-[28rem] space-y-[6rem] border-t border-[#cde5f1] pt-[16rem] text-[13rem] leading-[19rem] text-d-black/55 tablet:mt-auto tablet:hidden tablet:border-t-0 tablet:pt-[24rem] tablet:text-[14rem] tablet:leading-[20rem] tablet:text-d-black/60'>
                  <p>{data?.task}</p>
                </div>
              </section>

              <section
                ref={writingCardRef}
                className={cn(
                  'relative flex w-full flex-col rounded-[20rem] border border-[#b9deef]/80 bg-white p-[22rem] shadow-[0_24rem_64rem_rgba(8,56,80,0.12)] transition-all duration-300 ease-out',
                  isWritingFocused && 'shadow-[0_28rem_84rem_rgba(8,56,80,0.18)]',
                  'tablet:h-[calc(100dvh-96rem)] tablet:w-[720rem] tablet:scale-100 tablet:overflow-hidden tablet:rounded-[16rem] tablet:border-black tablet:p-[24rem] tablet:shadow-lg tablet:transition-none'
                )}
              >
                <div className='flex flex-col gap-[12rem]'>
                  <div
                    className='flex items-center justify-between gap-[12rem] rounded-[16rem] border border-transparent bg-transparent px-[6rem] py-[4rem] text-[14rem] leading-[22rem] text-d-black/70 tablet:flex-row tablet:items-start tablet:rounded-[12rem] tablet:border-[#c2c2c2] tablet:bg-d-light-gray tablet:px-[18rem] tablet:py-[14rem] tablet:text-[14rem] tablet:leading-[20rem] tablet:text-d-black/80'>
                    <span className='font-medium text-d-black/75 tablet:hidden'>{t('infoBarStartTyping')}</span>
                    <span className='hidden whitespace-pre-line tablet:block'>{data.task}</span>
                    <span
                      aria-live='polite'
                      role='status'
                      className='shrink-0 text-[13rem] font-medium text-d-black/55 transition-colors duration-200 tablet:text-[14rem] tablet:font-semibold tablet:text-d-black'
                    >
                      {tCommon('wordsCount', { count: wordCount })}
                    </span>
                  </div>
                </div>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)}
                        className='relative mt-[20rem] flex flex-1 flex-col tablet:mt-[16rem]'>
                    <FormField
                      name='answer'
                      control={form.control}
                      render={({ field }) => (
                        <FormItem className='flex h-full flex-col'>
                          <FormControl>
                            <AutosizeTextarea
                              {...field}
                              minHeight={240}
                              maxHeight={520}
                              placeholder={tForm('placeholders.startTypingHere')}
                              className={cn(
                                'flex-1 resize-none overflow-y-auto rounded-[16rem] border border-transparent bg-white px-[20rem] py-[18rem] text-[16rem] font-medium leading-[24rem] text-d-black/80 shadow-[inset_0_0_0_1rem_rgba(8,56,80,0.06)] outline-none transition-all duration-200 ease-out placeholder:text-d-black/35 focus:border-transparent focus:shadow-[0_16rem_40rem_rgba(8,56,80,0.16)]',
                                isWritingFocused && 'ring-0',
                                'tablet:rounded-[12rem] tablet:border-d-light-gray tablet:bg-d-light-gray tablet:px-[20rem] tablet:py-[16rem] tablet:text-[16rem] tablet:leading-[22rem] tablet:shadow-none tablet:focus:border-d-green tablet:focus:shadow-none'
                              )}
                              onFocus={() => {
                                setIsWritingFocused(true);
                                if (typeof window !== 'undefined' && window.innerWidth < 768) {
                                  window.requestAnimationFrame(() => {
                                    writingCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                  });
                                }
                              }}
                              onBlur={() => {
                                field.onBlur();
                                setIsWritingFocused(false);
                              }}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <div className='mt-[24rem] space-y-[12rem] tablet:mt-[16rem]'>
                      {submitError ? (
                        <p className='text-[14rem] font-medium text-d-red' role='alert'>
                          {submitError}
                        </p>
                      ) : null}
                      <div className='sticky left-0 right-0 z-20 tablet:static'
                           style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 24px)' }}>
                        <button
                          type='submit'
                          disabled={isSubmitDisabled}
                          className={cn(
                            'flex h-[56rem] w-full items-center justify-center rounded-[32rem] text-[18rem] font-semibold text-d-black transition-transform duration-200 ease-out focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-d-green/40 tablet:h-[54rem] tablet:rounded-[28rem] tablet:bg-d-green tablet:bg-none tablet:text-[18rem] tablet:shadow-none tablet:hover:translate-y-0 tablet:hover:bg-d-green/80 tablet:active:translate-y-0',
                            isSubmitDisabled
                              ? 'cursor-not-allowed bg-d-green-secondary text-d-black/50 shadow-none'
                              : 'bg-gradient-to-r from-[#bffb6d] to-[#a7f05a] shadow-[0_16rem_44rem_rgba(8,56,80,0.18)] hover:-translate-y-[2rem] hover:shadow-[0_24rem_60rem_rgba(8,56,80,0.2)] active:translate-y-[1rem] active:shadow-[0_14rem_36rem_rgba(8,56,80,0.18)]'
                          )}
                          aria-busy={isSubmitting}
                        >
                          {isSubmitting ? tActions('sending') : tActions('submit')}
                        </button>
                      </div>
                    </div>
                  </form>
                </Form>
              </section>
            </div>
          </div>
        </div>
      </main>

      {isMobileImagePreviewOpen && data?.picture ? (
        <div
          className='fixed inset-0 z-[60] flex items-center justify-center bg-[#082431]/85 px-[20rem] py-[40rem] tablet:hidden'
          role='dialog'
          aria-modal='true'
          aria-label={t('imagePreview.title')}
          onClick={() => setIsMobileImagePreviewOpen(false)}
        >
          <div
            className='relative w-full max-w-[560rem]'
            onClick={event => {
              event.stopPropagation();
            }}
          >
            <img src={data.picture} alt='illustration'
                 className='h-full max-h-[80vh] w-full rounded-[20rem] object-contain shadow-[0_24rem_72rem_rgba(0,0,0,0.45)]' />
            <button
              type='button'
              onClick={() => setIsMobileImagePreviewOpen(false)}
              className='absolute right-[16rem] top-[16rem] inline-flex items-center justify-center rounded-full bg-black/60 p-[8rem] text-white transition hover:bg-black/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80'
              aria-label={t('imagePreview.close')}
            >
              <X className='size-[18rem]' aria-hidden='true' />
            </button>
          </div>
        </div>
      ) : null}
    </PracticeLeaveGuard>
  );
}
