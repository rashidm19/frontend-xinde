import React, { useState } from 'react';

import { POST_mock_start } from '@/api/POST_mock_start';
import { mockStore } from '@/stores/mock';
import nProgress from 'nprogress';
import { useRouter } from 'next/navigation';

export const MockBySections = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { setMockData } = mockStore();

  const startMock = async (part: string) => {
    setIsLoading(true);
    const data = await POST_mock_start();
    setMockData(data);
    nProgress.start();
    router.push(`/mock/exam/${part}/rules`);
    setIsLoading(false);
  };

  return (
    <section className='rounded-[16rem] bg-white p-[24rem]'>
      <h2 className='mb-[24rem] text-[20rem] font-medium leading-tight'>MOCK by section</h2>
      <p className='mb-[32rem] font-poppins text-[14rem] leading-tight'>Take MOCK exam by selecting the necessary section</p>
      <div className='flex flex-col gap-y-[16rem]'>
        <button type='button' onClick={() => startMock('listening')} className='flex items-center'>
          <div className='mr-[12rem] flex size-[52rem] items-center justify-center rounded-[8rem] bg-d-green-secondary'>
            <img src='/images/icon_listeningSection.svg' className='size-[24rem]' alt='icon' />
          </div>
          <div className='text-[14rem] font-medium'>Listening</div>
          <img src='/images/icon_chevron--down.svg' alt='icon' className='ml-auto size-[14rem]' />
        </button>
        <button type='button' onClick={() => startMock('reading')} className='flex items-center'>
          <div className='mr-[12rem] flex size-[52rem] items-center justify-center rounded-[8rem] bg-d-yellow-secondary'>
            <img src='/images/icon_readingSection.svg' className='size-[24rem]' alt='icon' />
          </div>
          <div className='text-[14rem] font-medium'>Reading</div>
          <img src='/images/icon_chevron--down.svg' alt='icon' className='ml-auto size-[14rem]' />
        </button>
        <button type='button' onClick={() => startMock('writing')} className='flex items-center'>
          <div className='mr-[12rem] flex size-[52rem] items-center justify-center rounded-[8rem] bg-d-blue-secondary'>
            <img src='/images/icon_writingSection.svg' className='size-[24rem]' alt='icon' />
          </div>
          <div className='text-[14rem] font-medium'>Writing</div>
          <img src='/images/icon_chevron--down.svg' alt='icon' className='ml-auto size-[14rem]' />
        </button>
        <button type='button' onClick={() => startMock('speaking')} className='flex items-center'>
          <div className='mr-[12rem] flex size-[52rem] items-center justify-center rounded-[8rem] bg-d-violet-secondary'>
            <img src='/images/icon_speakingSection.svg' className='size-[24rem]' alt='icon' />
          </div>
          <div className='text-[14rem] font-medium'>Speaking</div>
          <img src='/images/icon_chevron--down.svg' alt='icon' className='ml-auto size-[14rem]' />
        </button>
      </div>
    </section>
  );
};
