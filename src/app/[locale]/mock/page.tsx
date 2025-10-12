'use client';

import { Header } from '@/components/Header';
import { MockBySections } from './_components/MockBySections';
import { MockLastResults } from './_components/MockLastResults';
import { MockProgressOverTime } from './_components/MockProgressOverTime';
import { POST_mock_start } from '@/api/POST_mock_start';
import { RecentRecomendations } from './_components/RecentRecomendations';
import { mockStore } from '@/stores/mock';
import nProgress from 'nprogress';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProfile } from '@/hooks/useProfile';
import { useSubscriptionGate } from '@/hooks/useSubscriptionGate';
import { SubscriptionAccessLabel } from '@/components/SubscriptionAccessLabel';
import { SubscriptionStatusBanner } from '@/components/SubscriptionStatusBanner';
import { useSubscriptionStore } from '@/stores/subscriptionStore';

const data_rows = [
  {
    id: 1,
    score: 6.5,
    type: 'MOCK',
    reading: 5.5,
    listening: 6.0,
    speaking: 6.5,
    writing: 7.0,
    date: '01/01/24',
    time: '14:02:14',
    feedback: 'Feedback',
  },
  {
    id: 2,
    score: 8.0,
    type: 'Listening',
    reading: 7.5,
    listening: 6.5,
    speaking: undefined,
    writing: 6.5,
    date: '01/01/24',
    time: '14:02:14',
    feedback: 'Feedback',
  },
  {
    id: 3,
    score: 6.5,
    type: 'MOCK',
    reading: 5.5,
    listening: 6.0,
    speaking: 6.5,
    writing: 7.0,
    date: '01/01/24',
    time: '14:02:14',
    feedback: 'Feedback',
  },
  {
    id: 4,
    score: 8.0,
    type: 'Listening',
    reading: 7.5,
    listening: 6.5,
    speaking: undefined,
    writing: 6.5,
    date: '01/01/24',
    time: '14:02:14',
    feedback: 'Feedback',
  },
  {
    id: 5,
    score: 6.5,
    type: 'MOCK',
    reading: 5.5,
    listening: 6.0,
    speaking: 6.5,
    writing: 7.0,
    date: '01/01/24',
    time: '14:02:14',
    feedback: 'Feedback',
  },
  {
    id: 6,
    score: 8.0,
    type: 'Listening',
    reading: 7.5,
    listening: 6.5,
    speaking: undefined,
    writing: 6.5,
    date: '01/01/24',
    time: '14:02:14',
    feedback: 'Feedback',
  },
  {
    id: 7,
    score: 6.5,
    type: 'MOCK',
    reading: 5.5,
    listening: 6.0,
    speaking: 6.5,
    writing: 7.0,
    date: '01/01/24',
    time: '14:02:14',
    feedback: 'Feedback',
  },
  {
    id: 8,
    score: 8.0,
    type: 'Listening',
    reading: 7.5,
    listening: 6.5,
    speaking: undefined,
    writing: 6.5,
    date: '01/01/24',
    time: '14:02:14',
    feedback: 'Feedback',
  },
  {
    id: 9,
    score: 6.5,
    type: 'MOCK',
    reading: 5.5,
    listening: 6.0,
    speaking: 6.5,
    writing: 7.0,
    date: '01/01/24',
    time: '14:02:14',
    feedback: 'Feedback',
  },
  {
    id: 10,
    score: 8.0,
    type: 'Listening',
    reading: 7.5,
    listening: 6.5,
    speaking: undefined,
    writing: 6.5,
    date: '01/01/24',
    time: '14:02:14',
    feedback: 'Feedback',
  },
];

export default function Page() {
  const router = useRouter();
  const { profile } = useProfile();
  const { requireSubscription, isCheckingAccess } = useSubscriptionGate('mock');

  const [isLoading, setIsLoading] = useState(false);
  const subscription = useSubscriptionStore(state => state.subscription);
  const hasCancellationScheduled = Boolean(subscription?.cancel_at_period_end && subscription.current_period_end);

  const { setMockData } = mockStore();

  const startMock = async () => {
    if (isLoading || isCheckingAccess) {
      return;
    }

    setIsLoading(true);

    try {
      const canStart = await requireSubscription();

      if (!canStart) {
        return;
      }

      const data = await POST_mock_start();
      setMockData(data);
      nProgress.start();
      router.push('/mock/exam/listening/rules');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Header name={profile?.name} avatar={profile?.avatar} />
      <main>
        <div className='container grid max-w-[1440rem] grid-cols-[1016rem,328rem] gap-x-[16rem] gap-y-[16rem] px-[40rem] pb-[150rem] pt-[40rem]'>
          {hasCancellationScheduled && (
            <div className='col-span-2'>
              <SubscriptionStatusBanner className='mb-[16rem]' />
            </div>
          )}
          <div className='relative flex h-[420rem] w-[1016rem] items-center justify-center overflow-hidden rounded-[16rem] bg-d-violet'>
            <img
              src='/images/illustration_worm--02.png'
              className='pointer-events-none absolute right-0 top-0 h-auto w-[339rem] mix-blend-soft-light'
              alt='illustration'
            />
            <img
              src='/images/illustration_torusArray--03.png'
              className='pointer-events-none absolute bottom-[30rem] left-0 h-auto w-[204rem] mix-blend-soft-light'
              alt='illustration'
            />
            <div className='flex flex-col items-center gap-y-[28rem]'>
              <h1 className='text-center text-[24rem] font-medium leading-none text-white'>Keep pushing your limits!</h1>
              <p className='text-center font-poppins text-[14rem] leading-tight text-white'>
                {' '}
                Take another mock exam and elevate your IELTS readiness
                <br /> to new heights
              </p>
              <button
                type='button'
                onClick={startMock}
                disabled={isLoading || isCheckingAccess}
                className='flex h-[50rem] w-[285rem] items-center justify-center rounded-[40rem] bg-d-green text-[14rem] font-semibold hover:bg-d-green/40 disabled:cursor-not-allowed disabled:bg-d-gray/60 disabled:text-d-black/60'
              >
                {isLoading || isCheckingAccess ? (
                  <svg className='size-[20rem] animate-spin text-black' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'>
                    <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' stroke-width='4' />
                    <path
                      className='opacity-75'
                      fill='currentColor'
                      d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                    />
                  </svg>
                ) : (
                  'Take MOCK exam'
                )}
              </button>
              <SubscriptionAccessLabel className='mt-[12rem] text-center text-white/90' />
            </div>
          </div>

          <MockBySections />
          <MockProgressOverTime />
          <RecentRecomendations />

          <div className='col-span-2'>
            <MockLastResults data={[]} />
          </div>
        </div>
      </main>
    </>
  );
}
