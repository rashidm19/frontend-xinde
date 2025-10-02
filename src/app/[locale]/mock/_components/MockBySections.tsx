import React, { useState } from 'react';

import { POST_mock_start } from '@/api/POST_mock_start';
import { mockStore } from '@/stores/mock';
import nProgress from 'nprogress';
import { useRouter } from 'next/navigation';
import { useSubscriptionGate } from '@/hooks/useSubscriptionGate';
import { SubscriptionAccessLabel } from '@/components/SubscriptionAccessLabel';

export const MockBySections = () => {
  const router = useRouter();
  const [isLoadingPart, setIsLoadingPart] = useState<string | null>(null);
  const { setMockData } = mockStore();
  const { requireSubscription, isCheckingAccess } = useSubscriptionGate();

  const startMock = async (part: string) => {
    if (isLoadingPart || isCheckingAccess) {
      return;
    }

    setIsLoadingPart(part);

    try {
      const canStart = await requireSubscription();

      if (!canStart) {
        return;
      }

      const data = await POST_mock_start();
      setMockData(data);
      nProgress.start();
      router.push(`/mock/exam/${part}/rules`);
    } finally {
      setIsLoadingPart(null);
    }
  };

  return (
    <section className='rounded-[16rem] bg-white p-[24rem]'>
      <h2 className='mb-[24rem] text-[20rem] font-medium leading-tight'>MOCK by section</h2>
      <p className='mb-[32rem] font-poppins text-[14rem] leading-tight'>Take MOCK exam by selecting the necessary section</p>
      <SubscriptionAccessLabel className='mb-[24rem]' />
      <div className='flex flex-col gap-y-[16rem]'>
        <button
          type='button'
          onClick={() => startMock('listening')}
          disabled={Boolean(isLoadingPart) || isCheckingAccess}
          className='flex items-center disabled:cursor-not-allowed disabled:opacity-60'
        >
          <div className='mr-[12rem] flex size-[52rem] items-center justify-center rounded-[8rem] bg-d-green-secondary'>
            <img src='/images/icon_listeningSection.svg' className='size-[24rem]' alt='icon' />
          </div>
          <div className='text-[14rem] font-medium'>Listening</div>
          <img src='/images/icon_chevron--down.svg' alt='icon' className='ml-auto size-[14rem]' />
          {isLoadingPart === 'listening' || isCheckingAccess ? <span className='ml-[12rem] text-[12rem] uppercase'>...</span> : null}
        </button>
        <button
          type='button'
          onClick={() => startMock('reading')}
          disabled={Boolean(isLoadingPart) || isCheckingAccess}
          className='flex items-center disabled:cursor-not-allowed disabled:opacity-60'
        >
          <div className='mr-[12rem] flex size-[52rem] items-center justify-center rounded-[8rem] bg-d-yellow-secondary'>
            <img src='/images/icon_readingSection.svg' className='size-[24rem]' alt='icon' />
          </div>
          <div className='text-[14rem] font-medium'>Reading</div>
          <img src='/images/icon_chevron--down.svg' alt='icon' className='ml-auto size-[14rem]' />
          {isLoadingPart === 'reading' || isCheckingAccess ? <span className='ml-[12rem] text-[12rem] uppercase'>...</span> : null}
        </button>
        <button
          type='button'
          onClick={() => startMock('writing')}
          disabled={Boolean(isLoadingPart) || isCheckingAccess}
          className='flex items-center disabled:cursor-not-allowed disabled:opacity-60'
        >
          <div className='mr-[12rem] flex size-[52rem] items-center justify-center rounded-[8rem] bg-d-blue-secondary'>
            <img src='/images/icon_writingSection.svg' className='size-[24rem]' alt='icon' />
          </div>
          <div className='text-[14rem] font-medium'>Writing</div>
          <img src='/images/icon_chevron--down.svg' alt='icon' className='ml-auto size-[14rem]' />
          {isLoadingPart === 'writing' || isCheckingAccess ? <span className='ml-[12rem] text-[12rem] uppercase'>...</span> : null}
        </button>
        <button
          type='button'
          onClick={() => startMock('speaking')}
          disabled={Boolean(isLoadingPart) || isCheckingAccess}
          className='flex items-center disabled:cursor-not-allowed disabled:opacity-60'
        >
          <div className='mr-[12rem] flex size-[52rem] items-center justify-center rounded-[8rem] bg-d-violet-secondary'>
            <img src='/images/icon_speakingSection.svg' className='size-[24rem]' alt='icon' />
          </div>
          <div className='text-[14rem] font-medium'>Speaking</div>
          <img src='/images/icon_chevron--down.svg' alt='icon' className='ml-auto size-[14rem]' />
          {isLoadingPart === 'speaking' || isCheckingAccess ? <span className='ml-[12rem] text-[12rem] uppercase'>...</span> : null}
        </button>
      </div>
    </section>
  );
};
