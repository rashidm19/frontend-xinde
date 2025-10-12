'use client';

import { Audio } from './audio';
import { Form } from '@/components/ui/form';
import Record from './record';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import axiosInstance from '@/lib/axiosInstance';
import { Fragment, useMemo } from 'react';
import type { PracticeSpeakingAnswer, PracticeSpeakingAttempt } from '@/types/PracticeSpeaking';

interface FormProps {
  data: any;
}

export default function SpeakingTestForm({ data }: FormProps) {
  const router = useRouter();

  const createDynamicFormSchema = useMemo(() => {
    const schemaObject: Record<string, any> = {};

    data.questions.forEach((question: any) => {
      schemaObject[question.number] = z.object({
        audioBlob: z.instanceof(Blob).optional(),
        recordingUrl: z.string().optional(),
      });
    });

    return z.object(schemaObject);
  }, [data.questions]);

  async function onSubmit(values: z.infer<typeof createDynamicFormSchema>) {
    const practice_id = localStorage.getItem('practiceSpeakingIdStarted');

    const promises = Object.entries(values).map(async ([questionNumber, value]) => {
      const formData = new FormData();

      formData.append('practice_id', practice_id || '');
      formData.append('question', questionNumber);
      formData.append('audio', value?.audioBlob as Blob, `record_${questionNumber}.webm`);

      return await axiosInstance.post<PracticeSpeakingAnswer>('/practice/send/speaking', formData);
    });
    try {
      await Promise.all(promises);

      const finishRes = await axiosInstance.post<PracticeSpeakingAttempt>(`/practice/speaking/${practice_id}/finish`, undefined);
      const finishData = finishRes.data;

      if (finishData?.id) {
        router.push(`/practice/speaking/feedback/${finishData.id}`);
      } else {
        router.push('/error500');
      }
    } catch (err) {
      console.error('Ошибка при отправке:', err);
    }
  }

  const form = useForm<z.infer<typeof createDynamicFormSchema>>({
    resolver: zodResolver(createDynamicFormSchema),
  });

  const formValues = form.watch();

  const currentQuestionNumber = () => {
    const sortedQuestions = data.questions.sort((a: any, b: any) => a.number - b.number);

    for (let i = 0; i < sortedQuestions.length; i++) {
      const questionNumber = sortedQuestions[i].number;
      if (!formValues[questionNumber]?.recordingUrl) {
        return questionNumber;
      }
    }

    return sortedQuestions[sortedQuestions.length - 1]?.number || 1;
  };

  const isAllQuestionsCompleted = () => {
    return data.questions.every((question: any) => formValues[question.number]?.recordingUrl);
  };

  const isPreviousQuestionCompleted = (questionNumber: number) => {
    const sortedQuestions = data.questions.sort((a: any, b: any) => a.number - b.number);
    const currentIndex = sortedQuestions.findIndex((q: any) => q.number === questionNumber);

    if (currentIndex === 0) return true;

    const previousQuestion = sortedQuestions[currentIndex - 1];
    return !!formValues[previousQuestion.number]?.recordingUrl;
  };

  return (
    <main className='min-h-screen overflow-hidden bg-d-red-secondary'>
      <div className='container relative max-w-[1440rem] px-[270rem] pb-[150rem] pt-[80rem]'>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='relative z-10 mx-auto flex w-[672rem] flex-col rounded-[16rem] bg-white p-[40rem] shadow-card'>
            <div className='flex min-h-[515rem] flex-col gap-y-[16rem] rounded-t-[16rem] bg-d-gray p-[16rem]'>
              {data.questions
                .sort((a: any, b: any) => a.number - b.number)
                .map((question: any) => {
                  const shouldShow = isPreviousQuestionCompleted(question.number);

                  if (!shouldShow) return null;

                  return (
                    <Fragment key={question.number}>
                      {question.number === 1 && question.intro_url && <Audio src={question.intro_url} title={'Examiner Introduction'} />}
                      <Audio src={question.question_url} title={`Question ${question.number}`} />
                      {formValues[question.number]?.recordingUrl && (
                        <div className='ml-auto'>
                          <Audio src={formValues[question.number]?.recordingUrl} title={`Your Answer`} blob={formValues[question.number]?.audioBlob} />
                        </div>
                      )}
                    </Fragment>
                  );
                })}
            </div>
            {!isAllQuestionsCompleted() && (
              <div className='flex h-[104rem] w-full items-center justify-between rounded-b-[16rem] bg-d-light-gray px-[16rem]'>
                {data.questions
                  .sort((a: any, b: any) => a.number - b.number)
                  .map((question: any) => (
                    <Fragment key={question.number}>
                      {currentQuestionNumber() === question.number && <Record setFieldValue={form.setValue} currentQuestionNumber={question.number} />}
                    </Fragment>
                  ))}
              </div>
            )}

            <button
              type='submit'
              disabled={!isAllQuestionsCompleted()}
              className='mx-auto mt-[48rem] flex h-[63rem] w-[280rem] items-center justify-center rounded-[40rem] bg-d-green text-[20rem] font-semibold hover:bg-d-green/40 disabled:bg-d-light-gray'
            >
              Submit
            </button>
          </form>
        </Form>
      </div>
    </main>
  );
}
