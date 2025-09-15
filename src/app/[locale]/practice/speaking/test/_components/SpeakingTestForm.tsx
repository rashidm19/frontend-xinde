'use client';

import { Audio } from './audio';
import { Form } from '@/components/ui/form';
import Record from './record';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { API_URL } from '@/lib/config';

interface FormProps {
  data: any;
}

export default function SpeakingTestForm({ data }: FormProps) {
  const router = useRouter();

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const practice_id = localStorage.getItem('practiceSpeakingIdStarted');

    const promises = Object.entries(values).map(async ([key, value]) => {
      const formData = new FormData();
      formData.append('id', key);

      formData.append('practice_id', practice_id || '');
      formData.append('question', '1');
      formData.append('audio', value?.audioBlob as Blob, `record_${key}.webm`);

      return await fetch(`${API_URL}/practice/send/speaking`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });
    });
    try {
      await Promise.all(promises);

      const finishRes = await fetch(`${API_URL}/practice/speaking/${practice_id}/finish`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const finishData = await finishRes.json();

      if (finishData?.id) {
        router.push(`/practice/speaking/feedback/${finishData.id}`);
      } else {
        router.push('/error500');
      }
    } catch (err) {
      console.error('Ошибка при отправке:', err);
    }
  }

  const formSchema = z.object({
    1: z.object({
      audioBlob: z.instanceof(Blob).optional(),
      recordingUrl: z.string().optional(),
    }),
    2: z.object({
      audioBlob: z.instanceof(Blob).optional(),
      recordingUrl: z.string().optional(),
    }),
    3: z.object({
      audioBlob: z.instanceof(Blob).optional(),
      recordingUrl: z.string().optional(),
    }),
    4: z.object({
      audioBlob: z.instanceof(Blob).optional(),
      recordingUrl: z.string().optional(),
    }),
    5: z.object({
      audioBlob: z.instanceof(Blob).optional(),
      recordingUrl: z.string().optional(),
    }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const formValues = form.watch();

  const currectQuestionNumber = () => {
    if (!formValues[1]?.recordingUrl) {
      return 1;
    }
    // @ts-ignore
    if (formValues[1]?.recordingUrl && !formValues[2]?.recordingUrl) {
      return 2;
    }
    // @ts-ignore
    if (formValues[1]?.recordingUrl && formValues[2]?.recordingUrl && !formValues[3]?.recordingUrl) {
      return 3;
    }
    // @ts-ignore
    if (formValues[1]?.recordingUrl && formValues[2]?.recordingUrl && formValues[3]?.recordingUrl && !formValues[4]?.recordingUrl) {
      return 4;
    } else {
      return 5;
    }
  };

  return (
    <main className='min-h-screen overflow-hidden bg-d-red-secondary'>
      <div className='container relative max-w-[1440rem] px-[270rem] pb-[150rem] pt-[80rem]'>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='relative z-10 mx-auto flex w-[672rem] flex-col rounded-[16rem] bg-white p-[40rem] shadow-card'>
            <div className='flex min-h-[515rem] flex-col gap-y-[16rem] rounded-t-[16rem] bg-d-gray p-[16rem]'>
              {data.questions.map((question: any) => (
                <>
                  {question.number === 1 && (
                    <>
                      <Audio src={question.intro_url} title={'Examiner Introduction'} />
                      <Audio src={question.question_url} title={`Question ${question.number}`} />
                      {formValues[1]?.recordingUrl && (
                        <div className='ml-auto'>
                          <Audio src={formValues[1]?.recordingUrl} title={`Your Answer`} blob={formValues[1]?.audioBlob} />
                        </div>
                      )}
                    </>
                  )}
                  {question.number === 2 && formValues[1]?.recordingUrl && (
                    <>
                      <Audio src={question.intro_url} title={`Question ${question.number}`} />
                      <Audio src={question.question_url} title={`Question ${question.number}`} />
                      {formValues[2]?.recordingUrl && (
                        <div className='ml-auto'>
                          <Audio src={formValues[2]?.recordingUrl} title={`Your Answer`} blob={formValues[2]?.audioBlob} />
                        </div>
                      )}
                    </>
                  )}
                  {question.number === 3 && formValues[2]?.recordingUrl && (
                    <>
                      <Audio src={question.intro_url} title={`Question ${question.number}`} />
                      <Audio src={question.question_url} title={`Question ${question.number}`} />
                      {formValues[3]?.recordingUrl && (
                        <div className='ml-auto'>
                          <Audio src={formValues[3]?.recordingUrl} title={`Your Answer`} blob={formValues[3]?.audioBlob} />
                        </div>
                      )}
                    </>
                  )}
                  {question.number === 4 && formValues[3]?.recordingUrl && (
                    <>
                      <Audio src={question.intro_url} title={`Question ${question.number}`} />
                      <Audio src={question.question_url} title={`Question ${question.number}`} />
                      {formValues[4]?.recordingUrl && (
                        <div className='ml-auto'>
                          <Audio src={formValues[4]?.recordingUrl} title={`Your Answer`} blob={formValues[4]?.audioBlob} />
                        </div>
                      )}
                    </>
                  )}
                  {question.number === 5 && formValues[4]?.recordingUrl && (
                    <>
                      <Audio src={question.intro_url} title={`Question ${question.number}`} />
                      <Audio src={question.question_url} title={`Question ${question.number}`} />
                      {formValues[5]?.recordingUrl && (
                        <div className='ml-auto'>
                          <Audio src={formValues[5]?.recordingUrl} title={`Your Answer`} blob={formValues[5]?.audioBlob} />
                        </div>
                      )}
                    </>
                  )}
                </>
              ))}
            </div>
            {/* @ts-ignore */}
            {!formValues[5]?.recordingUrl && (
              <div className='flex h-[104rem] w-full items-center justify-between rounded-b-[16rem] bg-d-light-gray px-[16rem]'>
                {currectQuestionNumber() === 1 && <Record setFieldValue={form.setValue} currentQuestionNumber={1} />}
                {currectQuestionNumber() === 2 && <Record setFieldValue={form.setValue} currentQuestionNumber={2} />}
                {currectQuestionNumber() === 3 && <Record setFieldValue={form.setValue} currentQuestionNumber={3} />}
                {currectQuestionNumber() === 4 && <Record setFieldValue={form.setValue} currentQuestionNumber={4} />}
                {currectQuestionNumber() === 5 && <Record setFieldValue={form.setValue} currentQuestionNumber={5} />}
              </div>
            )}

            <button
              type='submit'
              // disabled={!formValues[5]?.recordingUrl}
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
